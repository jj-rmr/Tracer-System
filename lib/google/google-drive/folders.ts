//folders.ts

import { drive } from "../google-drive";

const folderLocks = new Map<
  string,
  Promise<{ id?: string | null; name?: string | null }>
>();

export async function getOrCreateFolder(name: string, parentId?: string) {
  const actualParentId = parentId ?? process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

  const lockKey = `${actualParentId}:${name}`;

  const existingLock = folderLocks.get(lockKey);

  if (existingLock) {
    return existingLock;
  }

  const creationPromise = findOrCreateFolder(name, actualParentId);

  folderLocks.set(lockKey, creationPromise);

  try {
    return await creationPromise;
  } finally {
    folderLocks.delete(lockKey);
  }
}

async function findOrCreateFolder(name: string, parentId: string) {
  const escapedName = name.replace(/'/g, "\\'");

  const response = await drive.files.list({
    q: [
      `name = '${escapedName}'`,
      "mimeType = 'application/vnd.google-apps.folder'",
      "trashed = false",
      `'${parentId}' in parents`,
    ].join(" and "),

    fields: "files(id,name,parents)",
    spaces: "drive",
  });

  const existingFolder = response.data.files?.[0];

  if (existingFolder?.id) {
    return existingFolder;
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },

    fields: "id,name,parents",
  });

  if (!folder.data.id) {
    throw new Error(`Failed to create folder: ${name}`);
  }

  return folder.data;
}
