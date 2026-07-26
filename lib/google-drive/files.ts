import { drive } from "./client";
import { Readable } from "stream";
import {
  deleteDriveIndexItem,
  updateIndexedDriveItem,
  upsertDriveIndexItems,
} from "@/lib/repositories/google-drive-items.repository";
import { DRIVE_FOLDER_MIME_TYPE, getDriveRootId } from "./browser";

export interface UploadedDriveFile {
  filename: string;
  mimeType: string;
  size: number;

  googleDriveFileId: string;
  googleDriveFolderId: string;

  webViewLink?: string;
}

function sanitizeFilename(name: string) {
  return name.replace(/[\/\\]/g, "-");
}

export async function uploadFileToDrive(
  file: File,
  folderId: string,
): Promise<UploadedDriveFile> {
  const MAX_SIZE = 10 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds 10MB limit");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await drive.files.create({
    requestBody: {
      name: sanitizeFilename(file.name),
      parents: [folderId],
    },

    media: {
      mimeType: file.type,
      body: Readable.from(buffer),
    },

    fields: "id,name,mimeType,size,modifiedTime,webViewLink",
  });

  if (!response.data.id) {
    throw new Error("Google Drive upload returned no file ID.");
  }

  try {
    await upsertDriveIndexItems([
      {
        id: response.data.id,
        rootId: getDriveRootId(),
        parentId: folderId,
        name: response.data.name ?? sanitizeFilename(file.name),
        mimeType: response.data.mimeType ?? file.type,
        isFolder: response.data.mimeType === DRIVE_FOLDER_MIME_TYPE,
        size: Number(response.data.size ?? file.size),
        modifiedTime: response.data.modifiedTime ?? null,
        webViewLink: response.data.webViewLink ?? null,
        syncedAt: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    await drive.files.delete({ fileId: response.data.id }).catch(() => undefined);
    throw error;
  }

  return {
    filename: response.data.name!,
    mimeType: response.data.mimeType!,
    size: Number(response.data.size ?? 0),
    googleDriveFileId: response.data.id,
    googleDriveFolderId: folderId,
    webViewLink: response.data.webViewLink ?? undefined,
  };
}

export async function deleteDriveFile(fileId: string) {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response
        ? error.response.status
        : undefined;

    if (status !== 404) throw error;
  }

  await deleteDriveIndexItem(fileId).catch((error) => {
    console.error("Failed to remove deleted file from the Drive index:", error);
  });
}

export async function moveDriveFile({
  fileId,
  fromFolderId,
  toFolderId,
}: {
  fileId: string;
  fromFolderId: string;
  toFolderId: string;
}) {
  if (fromFolderId === toFolderId) return;

  const response = await drive.files.update({
    fileId,
    addParents: toFolderId,
    removeParents: fromFolderId,
    fields: "id,parents,modifiedTime",
  });

  await updateIndexedDriveItem({
    fileId,
    parentId: toFolderId,
    modifiedTime: response.data.modifiedTime ?? new Date().toISOString(),
  });
}

export async function listStaleStagedDriveFileIds(
  folderId: string,
  olderThan: Date,
) {
  const escapedFolderId = folderId.replace(/'/g, "\\'");
  const response = await drive.files.list({
    q: [
      `'${escapedFolderId}' in parents`,
      "trashed = false",
      `modifiedTime < '${olderThan.toISOString()}'`,
    ].join(" and "),
    fields: "files(id)",
    spaces: "drive",
    pageSize: 1000,
  });

  return (response.data.files ?? []).flatMap((file) =>
    file.id ? [file.id] : [],
  );
}
