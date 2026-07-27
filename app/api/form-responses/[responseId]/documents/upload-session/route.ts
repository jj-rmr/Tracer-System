import { after, NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import { canChangeResponseDocuments } from "@/lib/forms/response-document-lifecycle";
import { createDriveResumableUpload } from "@/lib/google-drive/direct-upload";
import { deleteDriveFile } from "@/lib/google-drive/files";
import { getUploadStagingFolder } from "@/lib/google-drive/response-folders";
import {
  createDirectDriveUploadSession,
  deleteDirectDriveUploadSession,
  getDirectDriveUploadSessionByUploadKey,
  listExpiredDirectDriveUploadSessions,
  markDirectDriveUploadExpired,
} from "@/lib/repositories/direct-drive-uploads.repository";
import {
  getFormResponseById,
  getFormResponseDocumentByUploadKey,
} from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";
import {
  UploadValidationError,
  validateUploadMetadata,
} from "@/lib/security/uploads";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHUNK_SIZE = 2 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> },
) {
  try {
    const { user } = await requireUser();
    const { responseId } = await params;
    const browserOrigin = request.headers.get("origin");
    if (!browserOrigin || browserOrigin !== request.nextUrl.origin) {
      return NextResponse.json(
        { success: false, message: "The upload request origin is invalid." },
        { status: 403 },
      );
    }
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

    const body = (await request.json()) as Record<string, unknown>;
    const filename = typeof body.filename === "string" ? body.filename : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
    const size = typeof body.size === "number" ? body.size : NaN;
    const documentType = body.documentType;
    const suppliedUploadKey =
      typeof body.uploadKey === "string" ? body.uploadKey : undefined;
    const uploadKey = suppliedUploadKey ?? crypto.randomUUID();
    if (documentType !== "employment" && documentType !== "awards") {
      return NextResponse.json(
        { success: false, message: "Invalid document type." },
        { status: 400 },
      );
    }
    if (!UUID_PATTERN.test(uploadKey)) {
      return NextResponse.json(
        { success: false, message: "Invalid document upload key." },
        { status: 400 },
      );
    }
    if (response.source === "admin_import" && !suppliedUploadKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Manual import documents require an upload key.",
        },
        { status: 400 },
      );
    }
    validateUploadMetadata(filename, mimeType, size, "document");

    const existingDocument = await getFormResponseDocumentByUploadKey(
      responseId,
      uploadKey,
    );
    if (existingDocument) {
      return NextResponse.json(
        { success: true, document: existingDocument },
        { status: 200 },
      );
    }
    const existing = await getDirectDriveUploadSessionByUploadKey(
      responseId,
      uploadKey,
    );
    if (
      existing?.status === "initiated" &&
      existing.browserOrigin === browserOrigin &&
      new Date(existing.expiresAt) > new Date()
    ) {
      return NextResponse.json(
        {
          success: true,
          data: {
            sessionId: existing.id,
            uploadUrl: existing.uploadUrl,
            chunkSize: CHUNK_SIZE,
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (
      existing &&
      (existing.browserOrigin === null ||
        ["failed", "expired"].includes(existing.status))
    ) {
      await deleteDriveFile(existing.driveFileId).catch(() => undefined);
      await deleteDirectDriveUploadSession(existing.id);
    } else if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This upload attempt has expired. Please select the file again.",
        },
        { status: 409 },
      );
    }

    const stagingFolder = await getUploadStagingFolder();
    const sessionId = crypto.randomUUID();
    const googleSession = await createDriveResumableUpload({
      sessionId,
      filename,
      mimeType,
      size,
      folderId: stagingFolder.id,
      browserOrigin,
    });
    await createDirectDriveUploadSession({
      id: sessionId,
      responseId,
      actorUserId: user.$id,
      documentType,
      uploadKey,
      filename,
      mimeType,
      size,
      driveFileId: googleSession.fileId,
      uploadUrl: googleSession.uploadUrl,
      browserOrigin,
      stagingFolderId: stagingFolder.id,
      expiresAt: googleSession.expiresAt,
    });

    after(async () => {
      const expired = await listExpiredDirectDriveUploadSessions().catch(
        () => [],
      );
      await Promise.all(
        expired.map(async (item) => {
          await deleteDriveFile(item.driveFileId).catch(() => undefined);
          await markDirectDriveUploadExpired(item.id).catch(() => undefined);
        }),
      );
    });
    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId,
          uploadUrl: googleSession.uploadUrl,
          chunkSize: CHUNK_SIZE,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to create direct Drive upload session:", error);
    const invalid = error instanceof UploadValidationError;
    return NextResponse.json(
      {
        success: false,
        message: invalid
          ? error.message
          : "We couldn't start the document upload. Please try again.",
      },
      { status: invalid ? 400 : 500 },
    );
  }
}
