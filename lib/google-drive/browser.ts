import { Readable } from "node:stream";

import {
  getIndexedDriveBreadcrumbs,
  listIndexedDriveFolder,
  requireIndexedDriveBrowserItem,
  searchIndexedDriveItems,
} from "@/lib/repositories/google-drive-items.repository";

import { drive } from "./client";
import { EXTERNAL_TIMEOUTS } from "@/lib/server/timeouts";

export const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

function getConfiguredRootId() {
  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!rootId) {
    throw new Error(
      "Missing required environment variable: GOOGLE_DRIVE_ROOT_FOLDER_ID",
    );
  }

  return rootId;
}

export async function listIndexedFolder({
  folderId = getConfiguredRootId(),
  pageToken,
  sort,
  direction,
}: {
  folderId?: string;
  pageToken?: string;
  sort?: "name" | "size" | "type" | "modified";
  direction?: "asc" | "desc";
}) {
  const rootId = getConfiguredRootId();
  const folder = await requireIndexedDriveBrowserItem(folderId, rootId);

  if (!folder.isFolder) {
    throw new Error("The requested Drive item is not a folder.");
  }

  const offset = Math.max(0, Number.parseInt(pageToken ?? "0", 10) || 0);
  const [listing, breadcrumbs] = await Promise.all([
    listIndexedDriveFolder({ rootId, folderId, offset, sort, direction }),
    getIndexedDriveBreadcrumbs(rootId, folderId),
  ]);

  return {
    folderId,
    breadcrumbs,
    items: listing.items,
    nextPageToken:
      listing.nextOffset === null ? null : String(listing.nextOffset),
  };
}

export async function searchIndexedDriveFolder({
  folderId = getConfiguredRootId(),
  query,
  sort,
  direction,
}: {
  folderId?: string;
  query: string;
  sort?: "name" | "size" | "type" | "modified";
  direction?: "asc" | "desc";
}) {
  const normalizedQuery = query.trim().slice(0, 100);

  if (!normalizedQuery) return [];

  const rootId = getConfiguredRootId();
  const folder = await requireIndexedDriveBrowserItem(folderId, rootId);

  if (!folder.isFolder) {
    throw new Error("The requested Drive item is not a folder.");
  }

  return searchIndexedDriveItems(
    rootId,
    folderId,
    normalizedQuery,
    sort,
    direction,
  );
}

const googleExportMimeTypes: Record<string, string> = {
  "application/vnd.google-apps.document": "application/pdf",
  "application/vnd.google-apps.spreadsheet": "application/pdf",
  "application/vnd.google-apps.presentation": "application/pdf",
  "application/vnd.google-apps.drawing": "application/pdf",
};

export async function getDriveFileContent(fileId: string, range?: string) {
  const item = await requireIndexedDriveBrowserItem(
    fileId,
    getConfiguredRootId(),
  );

  if (item.isFolder) {
    throw new Error("Folders cannot be previewed as files.");
  }

  const exportMimeType = item.mimeType
    ? googleExportMimeTypes[item.mimeType]
    : undefined;
  const response = exportMimeType
    ? await drive.files.export(
        { fileId, mimeType: exportMimeType },
        {
          responseType: "stream",
          timeout: EXTERNAL_TIMEOUTS.driveTransfer,
        },
      )
    : await drive.files.get(
        { fileId, alt: "media" },
        {
          responseType: "stream",
          timeout: EXTERNAL_TIMEOUTS.driveTransfer,
          headers: range ? { Range: range } : undefined,
        },
      );

  return {
    item,
    body: Readable.toWeb(response.data as Readable) as ReadableStream,
    contentType:
      exportMimeType ??
      String(response.headers["content-type"] ?? item.mimeType),
    contentLength: response.headers["content-length"],
    contentRange: response.headers["content-range"],
  };
}

export function getDriveRootId() {
  return getConfiguredRootId();
}
