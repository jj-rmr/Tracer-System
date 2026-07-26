import { getAdminFilesHierarchyKey } from "./initialize-hierarchy";
import { getDriveRootId } from "./browser";
import { getRegisteredDriveFolder } from "@/lib/repositories/google-drive-folders.repository";
import {
  isIndexedDriveDescendant,
  requireIndexedDriveBrowserItem,
} from "@/lib/repositories/google-drive-items.repository";

export async function requireAdminDirectoryItem(fileId: string) {
  const rootId = getDriveRootId();
  const adminRoot = await getRegisteredDriveFolder(
    getAdminFilesHierarchyKey(rootId),
  );

  if (!adminRoot) {
    throw new Error("The Admin Files directory has not been generated yet.");
  }

  const [item, isInsideAdminDirectory] = await Promise.all([
    requireIndexedDriveBrowserItem(fileId, rootId),
    isIndexedDriveDescendant(fileId, adminRoot.googleDriveFolderId),
  ]);

  if (!isInsideAdminDirectory) {
    throw new Error("This operation is only allowed inside Admin Files.");
  }

  return { item, rootId, adminRootId: adminRoot.googleDriveFolderId };
}
