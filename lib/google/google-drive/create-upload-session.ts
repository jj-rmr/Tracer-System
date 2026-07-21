import { oauth2Client } from "../google-drive";

function sanitizeFilename(name: string) {
  return name.replace(/[\/\\]/g, "-");
}

export async function createDriveUploadSession(
  filename: string,
  mimeType: string,
  size: number,
  folderId: string,
  providedOrigin?: string,
) {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB Limit

  if (size > MAX_SIZE) {
    throw new Error("File exceeds 10MB limit");
  }

  const rawOrigin =
    providedOrigin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const cleanOrigin = rawOrigin.replace(/\/+$/, "");

  const accessToken = await oauth2Client.getAccessToken();
  if (!accessToken.token) {
    throw new Error("Failed to obtain Google access token");
  }

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(size),
        Origin: cleanOrigin,
      },
      body: JSON.stringify({
        name: sanitizeFilename(filename),
        parents: [folderId],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Google Drive upload session: ${error}`);
  }

  const uploadUrl = response.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("Google Drive returned no upload URL");
  }

  return uploadUrl;
}
