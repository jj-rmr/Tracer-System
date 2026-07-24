import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { deleteDriveFile } from "@/lib/google-drive/files";
import {
  deleteFormResponseDocument,
  getFormResponseDocuments,
  setManualImportStatus,
} from "@/lib/repositories/form-responses.repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = (await request.json()) as {
      status?: unknown;
      uploadKeys?: unknown;
    };

    if (body.status !== "completed" && body.status !== "failed") {
      return NextResponse.json(
        { success: false, message: "Invalid manual import status." },
        { status: 400 },
      );
    }

    if (body.status === "completed") {
      if (
        !Array.isArray(body.uploadKeys) ||
        body.uploadKeys.some(
          (uploadKey) =>
            typeof uploadKey !== "string" || !UUID_PATTERN.test(uploadKey),
        )
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid manual import upload manifest." },
          { status: 400 },
        );
      }

      const expectedUploadKeys = new Set(body.uploadKeys as string[]);
      const documents = await getFormResponseDocuments(id);
      const persistedUploadKeys = new Set(
        documents.flatMap((document) =>
          document.uploadKey ? [document.uploadKey] : [],
        ),
      );
      const missingUpload = [...expectedUploadKeys].some(
        (uploadKey) => !persistedUploadKeys.has(uploadKey),
      );

      if (missingUpload) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more manual import documents are missing.",
          },
          { status: 409 },
        );
      }

      const obsoleteDocuments = documents.filter(
        (document) =>
          document.uploadKey && !expectedUploadKeys.has(document.uploadKey),
      );

      for (const document of obsoleteDocuments) {
        await deleteDriveFile(document.googleDriveFileId);
        await deleteFormResponseDocument(document.id);
      }
    }

    const updated = await setManualImportStatus(id, body.status);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Manual response not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Failed to update manual import status:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { success: false, message: "Failed to update the manual import." },
      { status: 500 },
    );
  }
}
