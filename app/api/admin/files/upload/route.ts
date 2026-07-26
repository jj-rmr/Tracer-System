import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getDriveRootId } from "@/lib/google-drive/browser";
import {
  getAdminFilesHierarchyKey,
  getOrCreateAdminFilesRoot,
} from "@/lib/google-drive/initialize-hierarchy";
import { uploadFileToDrive } from "@/lib/google-drive/files";
import { getRegisteredDriveFolder } from "@/lib/repositories/google-drive-folders.repository";
import {
  isIndexedDriveDescendant,
  requireIndexedDriveBrowserItem,
} from "@/lib/repositories/google-drive-items.repository";
import { UploadValidationError } from "@/lib/security/uploads";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folderId = formData.get("folderId");

    if (!(file instanceof File) || typeof folderId !== "string" || !folderId) {
      return NextResponse.json(
        { success: false, message: "Choose a file and an Admin Files folder." },
        { status: 400 },
      );
    }

    const rootId = getDriveRootId();
    const adminRoot =
      (await getRegisteredDriveFolder(getAdminFilesHierarchyKey(rootId))) ??
      (await getOrCreateAdminFilesRoot());
    const adminRootId =
      "googleDriveFolderId" in adminRoot
        ? adminRoot.googleDriveFolderId
        : adminRoot.id;
    const [target, isInsideAdminFiles] = await Promise.all([
      requireIndexedDriveBrowserItem(folderId, rootId),
      isIndexedDriveDescendant(folderId, adminRootId),
    ]);

    if (!target.isFolder || !isInsideAdminFiles) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Manual uploads are only allowed inside the Admin Files directory.",
        },
        { status: 403 },
      );
    }

    const uploaded = await uploadFileToDrive(file, folderId, "admin");

    return NextResponse.json(
      { success: true, data: uploaded },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to upload an admin Drive file:", error);
    const invalidUpload = error instanceof UploadValidationError;

    return NextResponse.json(
      {
        success: false,
        message: invalidUpload ? error.message : "Failed to upload the file.",
      },
      { status: invalidUpload ? 400 : 500 },
    );
  }
}
