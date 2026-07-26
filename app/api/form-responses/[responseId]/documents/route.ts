import { after, NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import { canChangeResponseDocuments } from "@/lib/forms/response-document-lifecycle";
import {
  deleteDriveFile,
  moveDriveFile,
  uploadFileToDrive,
} from "@/lib/google-drive/files";
import {
  getResponseDocumentFolder,
  getUploadStagingFolder,
} from "@/lib/google-drive/response-folders";
import { cleanupStaleStagedUploads } from "@/lib/google-drive/staged-upload-cleanup";
import {
  createFormResponseDocument,
  deleteFormResponseDocument,
  getFormResponseById,
  getFormResponseDocumentByUploadKey,
  getFormResponseDocuments,
  markFormResponseDocumentReady,
} from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> },
) {
  try {
    const { user } = await requireUser();
    const { responseId } = await params;
    const response = await getFormResponseById(responseId);

    if (!response || (!isAdmin(user) && response.userId !== user.$id)) {
      return NextResponse.json(
        { success: false, message: "Response not found." },
        { status: 404 },
      );
    }

    const studyContext = await getStudyContext(response.studyPeriodId);

    if (
      !studyContext ||
      !canChangeResponseDocuments({
        source: response.source,
        studyStatus: studyContext.study.status,
      })
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This study is closed and its documents are read-only.",
        },
        { status: 423 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType");
    const rawUploadKey = formData.get("uploadKey");
    const uploadKey = typeof rawUploadKey === "string" ? rawUploadKey : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 },
      );
    }

    if (documentType !== "employment" && documentType !== "awards") {
      return NextResponse.json(
        { success: false, message: "Invalid document type." },
        { status: 400 },
      );
    }

    if (uploadKey && !UUID_PATTERN.test(uploadKey)) {
      return NextResponse.json(
        { success: false, message: "Invalid document upload key." },
        { status: 400 },
      );
    }

    if (response.source === "admin_import" && !uploadKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Manual import documents require an upload key.",
        },
        { status: 400 },
      );
    }

    if (uploadKey) {
      const existingDocument = await getFormResponseDocumentByUploadKey(
        response.id,
        uploadKey,
      );

      if (existingDocument) {
        return NextResponse.json(
          { success: true, document: existingDocument },
          { status: 200 },
        );
      }
    }

    const stagingFolder = await getUploadStagingFolder();
    const stagingFolderId = stagingFolder.id;
    after(async () => {
      await cleanupStaleStagedUploads(stagingFolderId).catch((error) => {
        console.error("Failed to clean stale staged uploads:", error);
      });
    });
    const uploaded = await uploadFileToDrive(file, stagingFolderId);
    let stagedDocumentId: string | null = null;

    try {
      const documents = await getFormResponseDocuments(response.id);
      const typeFolder = await getResponseDocumentFolder({
        response,
        documents,
        documentType,
      });

      const stagedDocument = await createFormResponseDocument({
        responseId,
        documentType,
        uploadKey,
        ...uploaded,
        googleDriveFolderId: typeFolder.id,
        uploadStatus: "staged",
      });
      stagedDocumentId = stagedDocument.id;

      await moveDriveFile({
        fileId: uploaded.googleDriveFileId,
        fromFolderId: stagingFolderId,
        toFolderId: typeFolder.id,
      });
      const document = await markFormResponseDocumentReady(stagedDocument.id);

      return NextResponse.json({ success: true, document }, { status: 201 });
    } catch (error) {
      await deleteDriveFile(uploaded.googleDriveFileId).catch(() => undefined);
      if (stagedDocumentId) {
        await deleteFormResponseDocument(stagedDocumentId).catch(() => undefined);
      }

      if (uploadKey) {
        const concurrentDocument = await getFormResponseDocumentByUploadKey(
          response.id,
          uploadKey,
        );

        if (concurrentDocument) {
          return NextResponse.json(
            { success: true, document: concurrentDocument },
            { status: 200 },
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error("Failed to upload response document:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload document.",
      },
      { status: 500 },
    );
  }
}
