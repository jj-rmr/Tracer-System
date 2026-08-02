import { deleteDriveFile, moveDriveFile } from "@/lib/google-drive/files";
import {
  getAdminFilesHierarchyKey,
  getOrCreateAdminFilesRoot,
} from "@/lib/google-drive/initialize-hierarchy";
import { getDriveRootId } from "@/lib/google-drive/browser";
import {
  deleteRegisteredDriveFolders,
  getRegisteredDriveFolder,
  listRegisteredDriveFolderDescendants,
  rekeyRegisteredDriveFolder,
  updateRegisteredDriveFolder,
} from "@/lib/repositories/google-drive-folders.repository";

function studyFolderKey(studyId: string) {
  return `drive-root:${getDriveRootId()}:study:${studyId}`;
}

export async function moveStudyDriveFolderToAdminFiles({
  studyId,
}: {
  studyId: string;
}) {
  const folder = await getRegisteredDriveFolder(studyFolderKey(studyId));
  if (!folder) return false;

  const adminRoot = await getOrCreateAdminFilesRoot();
  await moveDriveFile({
    fileId: folder.googleDriveFolderId,
    fromFolderId: folder.parentGoogleDriveFolderId,
    toFolderId: adminRoot.id,
  });

  await updateRegisteredDriveFolder({
    folderKey: folder.folderKey,
    name: folder.name,
    parentGoogleDriveFolderId: adminRoot.id,
  });
  const registeredFolders = await listRegisteredDriveFolderDescendants(
    folder.googleDriveFolderId,
  );
  for (const registeredFolder of registeredFolders) {
    await rekeyRegisteredDriveFolder({
      currentFolderKey: registeredFolder.folderKey,
      nextFolderKey: registeredFolder.folderKey.replace(
        `drive-root:${getDriveRootId()}:study:${studyId}`,
        `${getAdminFilesHierarchyKey()}:deleted-study:${studyId}`,
      ),
    });
  }
  return true;
}

export async function deleteStudyDriveFolder(studyId: string) {
  const key = studyFolderKey(studyId);
  const folder = await getRegisteredDriveFolder(key);
  if (!folder) return;

  await deleteDriveFile(folder.googleDriveFolderId);
  const registeredFolders = await listRegisteredDriveFolderDescendants(
    folder.googleDriveFolderId,
  );
  await deleteRegisteredDriveFolders(
    registeredFolders.map((registeredFolder) => registeredFolder.folderKey),
  );
}
