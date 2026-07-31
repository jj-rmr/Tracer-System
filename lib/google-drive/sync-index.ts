import {
  deleteDriveIndexItemsOlderThan,
  deleteMissingResponseDocumentRecords,
  upsertDriveIndexItems,
  type DriveIndexInput,
  getIndexedDriveItem,
} from "@/lib/repositories/google-drive-items.repository";
import { deleteUnseenRegisteredDriveFolders } from "@/lib/repositories/google-drive-folders.repository";

import { DRIVE_FOLDER_MIME_TYPE, getDriveRootId } from "./browser";
import { drive } from "./client";

const INDEX_READINESS_TTL_MS = 30_000;
let indexReadyUntil = 0;
let ensureIndexPromise: Promise<Awaited<
  ReturnType<typeof syncGoogleDriveIndex>
> | null> | null = null;

function toIndexItem(
  file: {
    id?: string | null;
    name?: string | null;
    mimeType?: string | null;
    size?: string | number | null;
    modifiedTime?: string | null;
    webViewLink?: string | null;
  },
  rootId: string,
  parentId: string | null,
  syncedAt: string,
): DriveIndexInput | null {
  if (!file.id || !file.name || !file.mimeType) return null;

  return {
    id: file.id,
    rootId,
    parentId,
    name: file.name,
    mimeType: file.mimeType,
    isFolder: file.mimeType === DRIVE_FOLDER_MIME_TYPE,
    size: file.size == null ? null : Number(file.size),
    modifiedTime: file.modifiedTime ?? null,
    webViewLink: file.webViewLink ?? null,
    syncedAt,
  };
}

export async function syncGoogleDriveIndex() {
  const rootId = getDriveRootId();
  const syncStartedAt = new Date().toISOString();
  const rootResponse = await drive.files.get({
    fileId: rootId,
    fields: "id,name,mimeType,size,modifiedTime,webViewLink,trashed",
  });

  if (rootResponse.data.trashed) {
    throw new Error("The configured Google Drive root is in the trash.");
  }

  const root = toIndexItem(
    rootResponse.data,
    rootId,
    null,
    new Date().toISOString(),
  );

  if (!root || !root.isFolder) {
    throw new Error("The configured Google Drive root is not a folder.");
  }

  await upsertDriveIndexItems([root]);

  const folderQueue = [rootId];
  const liveFileIds = new Set<string>([rootId]);
  const liveFolderIds = new Set<string>([rootId]);

  for (let index = 0; index < folderQueue.length; index += 1) {
    const parentId = folderQueue[index];
    let pageToken: string | undefined;

    do {
      const response = await drive.files.list({
        q: `'${parentId.replace(/'/g, "\\'")}' in parents and trashed = false`,
        fields:
          "nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink)",
        pageSize: 1000,
        pageToken,
        spaces: "drive",
      });
      const pageSyncedAt = new Date().toISOString();
      const items = (response.data.files ?? [])
        .map((file) => toIndexItem(file, rootId, parentId, pageSyncedAt))
        .filter((item): item is DriveIndexInput => item !== null);

      for (const item of items) {
        liveFileIds.add(item.id);
        if (item.isFolder) {
          liveFolderIds.add(item.id);
          folderQueue.push(item.id);
        }
      }

      await Promise.all(
        Array.from({ length: Math.ceil(items.length / 500) }, (_, batch) =>
          upsertDriveIndexItems(items.slice(batch * 500, batch * 500 + 500)),
        ),
      );

      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);
  }

  await deleteDriveIndexItemsOlderThan(rootId, syncStartedAt);
  const [foldersRemoved, documentsRemoved] = await Promise.all([
    deleteUnseenRegisteredDriveFolders([...liveFolderIds], syncStartedAt),
    deleteMissingResponseDocumentRecords(),
  ]);

  return {
    items: liveFileIds.size,
    folders: liveFolderIds.size,
    foldersRemoved,
    documentsRemoved,
    syncedAt: syncStartedAt,
  };
}

export async function ensureGoogleDriveIndex() {
  if (Date.now() < indexReadyUntil) return null;
  if (ensureIndexPromise) return ensureIndexPromise;

  ensureIndexPromise = (async () => {
    const rootId = getDriveRootId();
    const indexedRoot = await getIndexedDriveItem(rootId);
    const result = indexedRoot ? null : await syncGoogleDriveIndex();
    indexReadyUntil = Date.now() + INDEX_READINESS_TTL_MS;
    return result;
  })();

  try {
    return await ensureIndexPromise;
  } finally {
    ensureIndexPromise = null;
  }
}
