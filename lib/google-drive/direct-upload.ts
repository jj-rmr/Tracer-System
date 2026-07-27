import "server-only";

import { drive, googleDriveOAuthClient } from "./client";
import { sanitizeFilename } from "./files";
import { fetchWithTimeout, EXTERNAL_TIMEOUTS } from "@/lib/server/timeouts";

const SESSION_LIFETIME_MS = 60 * 60 * 1000;

export async function createDriveResumableUpload({
  sessionId,
  filename,
  mimeType,
  size,
  folderId,
  browserOrigin,
}: {
  sessionId: string;
  filename: string;
  mimeType: string;
  size: number;
  folderId: string;
  browserOrigin: string;
}) {
  const generated = await drive.files.generateIds({ count: 1, space: "drive" });
  const fileId = generated.data.ids?.[0];
  if (!fileId) throw new Error("Google Drive did not reserve a file ID.");

  const accessToken = await googleDriveOAuthClient.getAccessToken();
  if (!accessToken.token) throw new Error("Google Drive authorization failed.");

  const response = await fetchWithTimeout(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,modifiedTime,webViewLink,parents,appProperties",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(size),
        Origin: browserOrigin,
      },
      body: JSON.stringify({
        id: fileId,
        name: sanitizeFilename(filename),
        parents: [folderId],
        appProperties: { tracerUploadSession: sessionId },
      }),
      cache: "no-store",
    },
    EXTERNAL_TIMEOUTS.driveMetadata,
  );

  if (!response.ok) {
    throw new Error(
      `Google Drive rejected the upload session (${response.status}).`,
    );
  }
  const uploadUrl = response.headers.get("location");
  if (!uploadUrl) throw new Error("Google Drive returned no upload location.");

  return {
    fileId,
    uploadUrl,
    expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS).toISOString(),
  };
}
