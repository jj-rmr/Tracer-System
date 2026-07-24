import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import { deleteDriveFile } from "@/lib/google-drive/files";
import {
  deleteFormResponseDocument,
  getFormResponseById,
  getFormResponseDocument,
} from "@/lib/repositories/form-responses.repository";

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ responseId: string; documentId: string }>;
  },
) {
  try {
    const { user } = await requireUser();
    const { responseId, documentId } = await params;
    const [response, document] = await Promise.all([
      getFormResponseById(responseId),
      getFormResponseDocument(documentId),
    ]);

    if (
      !response ||
      !document ||
      document.response_id !== responseId ||
      (!isAdmin(user) && response.userId !== user.$id)
    ) {
      return NextResponse.json(
        { success: false, message: "Document not found." },
        { status: 404 },
      );
    }

    await deleteDriveFile(document.google_drive_file_id);
    await deleteFormResponseDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete response document:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete document.",
      },
      { status: 500 },
    );
  }
}
