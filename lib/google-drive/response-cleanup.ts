import { deleteDriveFile } from "@/lib/google-drive/files";
import { getParentFolderId } from "@/lib/google-drive/folders";
import {
  deleteRegisteredDriveFolders,
  listRegisteredResponseFolders,
} from "@/lib/repositories/google-drive-folders.repository";
import { getFormResponseDocuments } from "@/lib/repositories/form-responses.repository";

export async function deleteResponseDriveData(responseId: string) {
  const [documents, registeredFolders] = await Promise.all([
    getFormResponseDocuments(responseId),
    listRegisteredResponseFolders(responseId),
  ]);

  const responseFolderKeySuffix = `:response:${responseId}`;
  const registeredResponseFolder = registeredFolders.find((folder) =>
    folder.folderKey.endsWith(responseFolderKeySuffix),
  );
  const inferredResponseFolderId = documents[0]?.googleDriveFolderId
    ? await getParentFolderId(documents[0].googleDriveFolderId).catch(
        () => null,
      )
    : null;
  const responseFolderId =
    registeredResponseFolder?.googleDriveFolderId ?? inferredResponseFolderId;

  for (const document of documents) {
    await deleteDriveFile(document.googleDriveFileId);
  }

  if (responseFolderId) {
    await deleteDriveFile(responseFolderId);
  }

  await deleteRegisteredDriveFolders(
    registeredFolders.map((folder) => folder.folderKey),
  );
}
