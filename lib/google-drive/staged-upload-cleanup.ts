import {
  deleteFormResponseDocument,
  getFormResponseDocumentByDriveFileId,
  listStagedFormResponseDocumentsOlderThan,
} from "@/lib/repositories/form-responses.repository";

import { deleteDriveFile, listStaleStagedDriveFileIds } from "./files";

export async function cleanupStaleStagedUploads(folderId: string) {
  const olderThan = new Date(Date.now() - 60 * 60 * 1000);
  const [folderFileIds, stagedDocuments] = await Promise.all([
    listStaleStagedDriveFileIds(folderId, olderThan),
    listStagedFormResponseDocumentsOlderThan(olderThan.toISOString()),
  ]);
  const fileIds = [
    ...new Set([
      ...folderFileIds,
      ...stagedDocuments.map((document) => document.google_drive_file_id),
    ]),
  ];

  for (const fileId of fileIds) {
    const document = await getFormResponseDocumentByDriveFileId(fileId);
    await deleteDriveFile(fileId);
    if (document?.id) await deleteFormResponseDocument(document.id);
  }

  return fileIds.length;
}
