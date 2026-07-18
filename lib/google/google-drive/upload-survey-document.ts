import { Survey, SurveyDocument } from "@/types";
import { getOrCreateGraduateFolder } from "./graduate-folder";
import { uploadToDrive } from "./upload";

export async function uploadSurveyDocument(
  survey: Survey,
  file: File,
): Promise<SurveyDocument> {
  const folderId = await getOrCreateGraduateFolder(survey);

  const uploaded = await uploadToDrive(file, folderId);

  return {
    id: crypto.randomUUID(),

    filename: uploaded.filename,

    mimeType: uploaded.mimeType,

    size: uploaded.size,

    googleDriveFileId: uploaded.googleDriveFileId,

    googleDriveFolderId: uploaded.googleDriveFolderId,

    uploadedAt: new Date().toISOString(),
    metadata: {
      filename: uploaded.filename,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      googleDriveFileId: uploaded.googleDriveFileId,
      googleDriveFolderId: uploaded.googleDriveFolderId,
      uploadedAt: new Date().toISOString(),
      source: "google-drive",
      webViewLink: uploaded.webViewLink,
    },
  };
}
