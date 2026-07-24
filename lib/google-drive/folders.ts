import {
  claimDriveFolder,
  getRegisteredDriveFolder,
  updateRegisteredDriveFolder,
} from "@/lib/repositories/google-drive-folders.repository";

import { drive } from "./client";

interface ManagedFolderInput {
  folderKey: string;
  name: string;
  parentId: string;
  existingFolderId?: string;
}

interface DriveFolder {
  id: string;
  name: string;
}

const folderLocks = new Map<string, Promise<DriveFolder>>();

function sanitizeFolderName(name: string) {
  return (
    name
      .replace(/[\u0000-\u001f/\\]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180) || "Not Specified"
  );
}

export async function getOrCreateManagedFolder(input: ManagedFolderInput) {
  const existingLock = folderLocks.get(input.folderKey);

  if (existingLock) {
    return existingLock;
  }

  const creationPromise = findClaimOrCreateFolder({
    ...input,
    name: sanitizeFolderName(input.name),
  });

  folderLocks.set(input.folderKey, creationPromise);

  try {
    return await creationPromise;
  } finally {
    folderLocks.delete(input.folderKey);
  }
}

async function findClaimOrCreateFolder({
  folderKey,
  name,
  parentId,
  existingFolderId,
}: ManagedFolderInput): Promise<DriveFolder> {
  const registered = await getRegisteredDriveFolder(folderKey);

  if (registered) {
    await synchronizeFolder(
      registered.googleDriveFolderId,
      name,
      parentId,
      folderKey,
    );

    return { id: registered.googleDriveFolderId, name };
  }

  const foundFolder = existingFolderId
    ? { id: existingFolderId, name }
    : await findFolderByName(name, parentId);
  const candidate = foundFolder ?? (await createFolder(name, parentId));
  const candidateWasCreated = !foundFolder;

  try {
    const claimed = await claimDriveFolder({
      folderKey,
      googleDriveFolderId: candidate.id,
      name,
      parentGoogleDriveFolderId: parentId,
    });

    if (claimed) {
      await synchronizeFolder(candidate.id, name, parentId, folderKey);
      return candidate;
    }

    const winner = await getRegisteredDriveFolder(folderKey);

    if (!winner) {
      throw new Error(`Drive folder claim was lost without a winner: ${folderKey}`);
    }

    if (candidateWasCreated && candidate.id !== winner.googleDriveFolderId) {
      await drive.files.delete({ fileId: candidate.id }).catch(() => undefined);
    }

    await synchronizeFolder(
      winner.googleDriveFolderId,
      name,
      parentId,
      folderKey,
    );

    return { id: winner.googleDriveFolderId, name };
  } catch (error) {
    if (candidateWasCreated) {
      await drive.files.delete({ fileId: candidate.id }).catch(() => undefined);
    }

    throw error;
  }
}

async function findFolderByName(name: string, parentId: string) {
  const escapedName = name.replace(/'/g, "\\'");
  const response = await drive.files.list({
    q: [
      `name = '${escapedName}'`,
      "mimeType = 'application/vnd.google-apps.folder'",
      "trashed = false",
      `'${parentId}' in parents`,
    ].join(" and "),
    fields: "files(id,name)",
    spaces: "drive",
    pageSize: 1,
  });
  const folder = response.data.files?.[0];

  return folder?.id ? { id: folder.id, name: folder.name ?? name } : null;
}

async function createFolder(name: string, parentId: string) {
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id,name",
  });

  if (!response.data.id) {
    throw new Error(`Failed to create folder: ${name}`);
  }

  return { id: response.data.id, name: response.data.name ?? name };
}

async function synchronizeFolder(
  folderId: string,
  name: string,
  parentId: string,
  folderKey: string,
) {
  const response = await drive.files.get({
    fileId: folderId,
    fields: "id,name,parents,trashed",
  });

  if (response.data.trashed) {
    throw new Error(`Managed Google Drive folder is in the trash: ${name}`);
  }

  const currentParents = response.data.parents ?? [];
  const parentChanged = !currentParents.includes(parentId);
  const nameChanged = response.data.name !== name;

  if (parentChanged || nameChanged) {
    await drive.files.update({
      fileId: folderId,
      addParents: parentChanged ? parentId : undefined,
      removeParents: parentChanged ? currentParents.join(",") : undefined,
      requestBody: nameChanged ? { name } : undefined,
      fields: "id,name,parents",
    });
  }

  await updateRegisteredDriveFolder({
    folderKey,
    name,
    parentGoogleDriveFolderId: parentId,
  });
}

export async function getParentFolderId(folderId: string) {
  const response = await drive.files.get({
    fileId: folderId,
    fields: "parents",
  });

  return response.data.parents?.[0] ?? null;
}
