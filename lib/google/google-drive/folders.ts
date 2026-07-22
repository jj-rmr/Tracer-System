import { drive } from "../google-drive";

// 1. Persistent in-memory cache for resolved folder IDs
const folderIdCache = new Map<string, string>();

// 2. Active locks for in-flight requests
const folderLocks = new Map<
  string,
  Promise<{ id?: string | null; name?: string | null }>
>();

export async function getOrCreateFolder(name: string, parentId?: string) {
  const actualParentId = parentId ?? process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;
  const cacheKey = `${actualParentId}:${name.toLowerCase().trim()}`;

  // Check 1: Return from in-memory cache instantly
  if (folderIdCache.has(cacheKey)) {
    return { id: folderIdCache.get(cacheKey)!, name };
  }

  // Check 2: Return active creation promise if currently in-flight
  const existingLock = folderLocks.get(cacheKey);
  if (existingLock) {
    return existingLock;
  }

  // Setup promise lock synchronously
  let resolvePromise: (value: any) => void;
  let rejectPromise: (reason?: any) => void;

  const lockPromise = new Promise<{ id?: string | null; name?: string | null }>(
    (resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    },
  );

  folderLocks.set(cacheKey, lockPromise);

  findOrCreateFolder(name, actualParentId)
    .then((result) => {
      if (result.id) {
        folderIdCache.set(cacheKey, result.id); // Save to cache on success
      }
      resolvePromise(result);
    })
    .catch((err) => rejectPromise(err))
    .finally(() => {
      folderLocks.delete(cacheKey);
    });

  return lockPromise;
}

async function findOrCreateFolder(name: string, parentId: string) {
  const escapedName = name.replace(/'/g, "\\'");

  // Query Google Drive
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

  // Double Check: Small safety delay (500ms) and retry list query once before creating
  // to account for Google Drive indexing latency from near-simultaneous requests
  await new Promise((resolve) => setTimeout(resolve, 500));

  const retryResponse = await drive.files.list({
    q: [
      `name = '${escapedName}'`,
      "mimeType = 'application/vnd.google-apps.folder'",
      "trashed = false",
      `'${parentId}' in parents`,
    ].join(" and "),
    fields: "files(id,name,parents)",
    spaces: "drive",
  });

  const retryFolder = retryResponse.data.files?.[0];
  if (retryFolder?.id) {
    return retryFolder;
  }

  // Create folder if still not found
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
