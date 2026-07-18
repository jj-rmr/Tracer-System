import { drive } from "../google-drive";
import { Readable } from "stream";

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

export async function uploadToDrive(
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

    fields: "id,name,mimeType,size,webViewLink",
  });

  return {
    filename: response.data.name!,

    mimeType: response.data.mimeType!,

    size: Number(response.data.size ?? 0),

    googleDriveFileId: response.data.id!,

    googleDriveFolderId: folderId,

    webViewLink: response.data.webViewLink ?? undefined,
  };
}
