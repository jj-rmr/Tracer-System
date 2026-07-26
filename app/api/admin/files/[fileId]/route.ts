import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { requireAdminDirectoryItem } from "@/lib/google-drive/admin-files";
import { drive } from "@/lib/google-drive/client";
import {
  deleteRegisteredDriveFoldersByIds,
  updateRegisteredDriveFolderById,
} from "@/lib/repositories/google-drive-folders.repository";
import {
  deleteIndexedDriveItems,
  getIndexedDriveItem,
  isIndexedDriveDescendant,
  listIndexedDriveDescendantIds,
  updateIndexedDriveItem,
} from "@/lib/repositories/google-drive-items.repository";

function sanitizeName(value: string) {
  return value
    .replace(/[\u0000-\u001f/\\]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    await requireAdmin();

    const { fileId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const { item, rootId } = await requireAdminDirectoryItem(fileId);

    if (body.action === "rename") {
      const name = sanitizeName(typeof body.name === "string" ? body.name : "");

      if (!name) {
        return NextResponse.json(
          { success: false, message: "Enter a valid file or folder name." },
          { status: 400 },
        );
      }

      const response = await drive.files.update({
        fileId,
        requestBody: { name },
        fields: "id,name,modifiedTime",
      });
      await updateIndexedDriveItem({
        fileId,
        name: response.data.name ?? name,
        modifiedTime: response.data.modifiedTime ?? new Date().toISOString(),
      });
      if (item.isFolder) {
        await updateRegisteredDriveFolderById({
          googleDriveFolderId: fileId,
          name: response.data.name ?? name,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (body.action === "move") {
      const destinationId =
        typeof body.destinationId === "string" ? body.destinationId : "";

      if (!destinationId || destinationId === fileId) {
        return NextResponse.json(
          { success: false, message: "Choose a valid destination folder." },
          { status: 400 },
        );
      }

      const [{ item: destination }, source] = await Promise.all([
        requireAdminDirectoryItem(destinationId),
        getIndexedDriveItem(fileId),
      ]);

      if (!destination.isFolder || !source?.parent_google_drive_folder_id) {
        return NextResponse.json(
          { success: false, message: "Choose a valid destination folder." },
          { status: 400 },
        );
      }

      if (source.parent_google_drive_folder_id === destinationId) {
        return NextResponse.json(
          { success: false, message: "The item is already in that folder." },
          { status: 400 },
        );
      }

      if (
        item.isFolder &&
        (await isIndexedDriveDescendant(destinationId, fileId))
      ) {
        return NextResponse.json(
          { success: false, message: "A folder cannot be moved into itself." },
          { status: 400 },
        );
      }

      await drive.files.update({
        fileId,
        addParents: destinationId,
        removeParents: source.parent_google_drive_folder_id,
        fields: "id,parents,modifiedTime",
      });
      await updateIndexedDriveItem({
        fileId,
        parentId: destinationId,
        modifiedTime: new Date().toISOString(),
      });
      if (item.isFolder) {
        await updateRegisteredDriveFolderById({
          googleDriveFolderId: fileId,
          parentGoogleDriveFolderId: destinationId,
        });
      }

      return NextResponse.json({ success: true, data: { rootId } });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported file operation." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to update an Admin Files item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update the item.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    await requireAdmin();

    const { fileId } = await params;
    const { adminRootId } = await requireAdminDirectoryItem(fileId);

    if (fileId === adminRootId) {
      return NextResponse.json(
        { success: false, message: "The Admin Files root cannot be deleted." },
        { status: 400 },
      );
    }

    const descendantIds = await listIndexedDriveDescendantIds(fileId);
    await drive.files.delete({ fileId });
    await Promise.all([
      deleteIndexedDriveItems(descendantIds),
      deleteRegisteredDriveFoldersByIds(descendantIds),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete an Admin Files item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete the item.",
      },
      { status: 500 },
    );
  }
}
