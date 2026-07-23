import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import { deleteDriveFile, uploadFileToDrive } from "@/lib/google-drive/files";
import { getOrCreateFolder } from "@/lib/google-drive/folders";
import {
  createFormResponseDocument,
  getFormResponseById,
} from "@/lib/repositories/form-responses.repository";

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

    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType");

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

    const rootFolder = await getOrCreateFolder("Tracer Study Responses");
    if (!rootFolder.id) throw new Error("Could not create the document folder.");

    const responseFolder = await getOrCreateFolder(
      `${response.respondentName ?? response.userId ?? "Response"} - ${response.id}`,
      rootFolder.id,
    );
    if (!responseFolder.id) throw new Error("Could not create the response folder.");

    const typeFolder = await getOrCreateFolder(
      documentType === "employment" ? "Employment Documents" : "Awards",
      responseFolder.id,
    );
    if (!typeFolder.id) throw new Error("Could not create the document type folder.");

    const uploaded = await uploadFileToDrive(file, typeFolder.id);

    try {
      const document = await createFormResponseDocument({
        responseId,
        documentType,
        ...uploaded,
      });

      return NextResponse.json({ success: true, document }, { status: 201 });
    } catch (error) {
      await deleteDriveFile(uploaded.googleDriveFileId).catch(() => undefined);
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
