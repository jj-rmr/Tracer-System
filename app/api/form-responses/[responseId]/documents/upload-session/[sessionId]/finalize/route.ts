import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import { canChangeResponseDocuments } from "@/lib/forms/response-document-lifecycle";
import { getDriveRootId } from "@/lib/google-drive/browser";
import { drive } from "@/lib/google-drive/client";
import {
  deleteDriveFile,
  moveDriveFile,
  sanitizeFilename,
} from "@/lib/google-drive/files";
import { getResponseDocumentFolder } from "@/lib/google-drive/response-folders";
import {
  claimDirectDriveUploadFinalization,
  getDirectDriveUploadSession,
  markDirectDriveUploadFailed,
  markDirectDriveUploadFinalized,
  releaseDirectDriveUploadFinalization,
} from "@/lib/repositories/direct-drive-uploads.repository";
import { upsertDriveIndexItems } from "@/lib/repositories/google-drive-items.repository";
import {
  createFormResponseDocument,
  deleteFormResponseDocument,
  getFormResponseById,
  getFormResponseDocumentByUploadKey,
  getFormResponseDocuments,
  markFormResponseDocumentReady,
} from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";
import {
  UploadValidationError,
  validateUploadSignature,
} from "@/lib/security/uploads";
import { EXTERNAL_TIMEOUTS } from "@/lib/server/timeouts";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ responseId: string; sessionId: string }> },
) {
  let claimedSessionId: string | null = null;
  let stagedDocumentId: string | null = null;
  let movedFile:
    | { fileId: string; fromFolderId: string; toFolderId: string }
    | undefined;
  try {
    const { user } = await requireUser();
    const { responseId, sessionId } = await params;
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

    const session = await getDirectDriveUploadSession(sessionId);
    if (
      !session ||
      session.responseId !== responseId ||
      session.actorUserId !== user.$id
    ) {
      return NextResponse.json(
        { success: false, message: "Upload session not found." },
        { status: 404 },
      );
    }
    const existingDocument = await getFormResponseDocumentByUploadKey(
      responseId,
      session.uploadKey,
    );
    if (existingDocument) {
      return NextResponse.json({ success: true, document: existingDocument });
    }
    const claimed = await claimDirectDriveUploadFinalization(sessionId);
    if (!claimed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The upload is still being verified or has expired. Please try again.",
        },
        { status: 409 },
      );
    }
    claimedSessionId = sessionId;

    const metadataResponse = await drive.files.get({
      fileId: claimed.driveFileId,
      fields:
        "id,name,mimeType,size,modifiedTime,webViewLink,parents,appProperties",
    });
    const metadata = metadataResponse.data;
    const validMetadata =
      metadata.id === claimed.driveFileId &&
      metadata.name === sanitizeFilename(claimed.filename) &&
      metadata.mimeType === claimed.mimeType &&
      Number(metadata.size) === claimed.size &&
      metadata.parents?.includes(claimed.stagingFolderId) &&
      metadata.appProperties?.tracerUploadSession === claimed.id;
    if (!validMetadata)
      throw new UploadValidationError(
        "The uploaded file could not be verified.",
      );

    const media = await drive.files.get(
      { fileId: claimed.driveFileId, alt: "media" },
      {
        headers: { Range: "bytes=0-15" },
        responseType: "arraybuffer",
        timeout: EXTERNAL_TIMEOUTS.driveMetadata,
      },
    );
    validateUploadSignature(
      claimed.filename,
      new Uint8Array(media.data as ArrayBuffer),
    );

    const documents = await getFormResponseDocuments(responseId);
    const typeFolder = await getResponseDocumentFolder({
      response,
      documents,
      documentType: claimed.documentType,
    });
    const uploaded = {
      filename: metadata.name!,
      mimeType: metadata.mimeType!,
      size: Number(metadata.size),
      googleDriveFileId: claimed.driveFileId,
      googleDriveFolderId: typeFolder.id,
      webViewLink: metadata.webViewLink ?? undefined,
    };
    const staged = await createFormResponseDocument({
      responseId,
      documentType: claimed.documentType,
      uploadKey: claimed.uploadKey,
      ...uploaded,
      uploadStatus: "staged",
    });
    stagedDocumentId = staged.id;
    await moveDriveFile({
      fileId: claimed.driveFileId,
      fromFolderId: claimed.stagingFolderId,
      toFolderId: typeFolder.id,
    });
    movedFile = {
      fileId: claimed.driveFileId,
      fromFolderId: claimed.stagingFolderId,
      toFolderId: typeFolder.id,
    };
    const document = await markFormResponseDocumentReady(staged.id);
    await upsertDriveIndexItems([
      {
        id: claimed.driveFileId,
        rootId: getDriveRootId(),
        parentId: typeFolder.id,
        name: uploaded.filename,
        mimeType: uploaded.mimeType,
        isFolder: false,
        size: uploaded.size,
        modifiedTime: metadata.modifiedTime ?? null,
        webViewLink: metadata.webViewLink ?? null,
        syncedAt: new Date().toISOString(),
      },
    ]);
    await markDirectDriveUploadFinalized(sessionId, document.id);
    claimedSessionId = null;
    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    console.error("Failed to finalize direct Drive upload:", error);
    if (claimedSessionId) {
      const session = await getDirectDriveUploadSession(claimedSessionId).catch(
        () => null,
      );
      const completed = session
        ? await getFormResponseDocumentByUploadKey(
            session.responseId,
            session.uploadKey,
          ).catch(() => null)
        : null;
      if (completed) {
        await markDirectDriveUploadFinalized(
          claimedSessionId,
          completed.id,
        ).catch(() => undefined);
        return NextResponse.json({ success: true, document: completed });
      }
    }
    if (error instanceof UploadValidationError && claimedSessionId) {
      const session = await getDirectDriveUploadSession(claimedSessionId).catch(
        () => null,
      );
      if (session)
        await deleteDriveFile(session.driveFileId).catch(() => undefined);
      await markDirectDriveUploadFailed(claimedSessionId).catch(
        () => undefined,
      );
    } else if (claimedSessionId) {
      if (movedFile) {
        await moveDriveFile({
          fileId: movedFile.fileId,
          fromFolderId: movedFile.toFolderId,
          toFolderId: movedFile.fromFolderId,
        }).catch(() => undefined);
      }
      await releaseDirectDriveUploadFinalization(claimedSessionId).catch(
        () => undefined,
      );
    }
    if (stagedDocumentId)
      await deleteFormResponseDocument(stagedDocumentId).catch(() => undefined);
    const invalid = error instanceof UploadValidationError;
    return NextResponse.json(
      {
        success: false,
        message: invalid
          ? error.message
          : "The upload reached Google Drive, but we couldn't finish verifying it. Please retry.",
      },
      { status: invalid ? 400 : 500 },
    );
  }
}
