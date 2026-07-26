import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { requireAdminDirectoryItem } from "@/lib/google-drive/admin-files";
import { DRIVE_FOLDER_MIME_TYPE } from "@/lib/google-drive/browser";
import { drive } from "@/lib/google-drive/client";
import { upsertDriveIndexItems } from "@/lib/repositories/google-drive-items.repository";

function sanitizeFolderName(value: string) {
  return value
    .replace(/[\u0000-\u001f/\\]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = (await request.json()) as Record<string, unknown>;
    const parentId = typeof body.parentId === "string" ? body.parentId : "";
    const name = sanitizeFolderName(typeof body.name === "string" ? body.name : "");

    if (!parentId || !name) {
      return NextResponse.json(
        { success: false, message: "Enter a valid folder name." },
        { status: 400 },
      );
    }

    const { item: parent, rootId } = await requireAdminDirectoryItem(parentId);

    if (!parent.isFolder) {
      return NextResponse.json(
        { success: false, message: "Choose a valid parent folder." },
        { status: 400 },
      );
    }

    const response = await drive.files.create({
      requestBody: {
        name,
        mimeType: DRIVE_FOLDER_MIME_TYPE,
        parents: [parentId],
      },
      fields: "id,name,mimeType,modifiedTime,webViewLink",
    });

    if (!response.data.id) throw new Error("Google Drive did not return a folder ID.");

    await upsertDriveIndexItems([
      {
        id: response.data.id,
        rootId,
        parentId,
        name: response.data.name ?? name,
        mimeType: DRIVE_FOLDER_MIME_TYPE,
        isFolder: true,
        size: null,
        modifiedTime: response.data.modifiedTime ?? null,
        webViewLink: response.data.webViewLink ?? null,
        syncedAt: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to create an Admin Files folder:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create folder.",
      },
      { status: 500 },
    );
  }
}
