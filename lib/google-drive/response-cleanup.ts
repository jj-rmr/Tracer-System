import { deleteDriveFile } from "@/lib/google-drive/files";
import { getParentFolderId } from "@/lib/google-drive/folders";
import {
  deleteRegisteredDriveFolders,
  listRegisteredResponseFolders,
} from "@/lib/repositories/google-drive-folders.repository";
import { getAllFormResponseDocuments } from "@/lib/repositories/form-responses.repository";

export async function deleteResponseDriveData(responseId: string) {
  const [documents, registeredFolders] = await Promise.all([
    getAllFormResponseDocuments(responseId),
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

  const cleanupResults = await Promise.allSettled([
    ...(responseFolderId ? [deleteDriveFile(responseFolderId)] : []),
    ...documents.map((document) => deleteDriveFile(document.googleDriveFileId)),
  ]);

  const failures = cleanupResults.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (failures.length > 0) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      "One or more response Drive resources could not be deleted.",
    );
  }

  await deleteRegisteredDriveFolders(
    registeredFolders.map((folder) => folder.folderKey),
  );
}
