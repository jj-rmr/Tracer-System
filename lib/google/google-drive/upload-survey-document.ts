import { Survey, SurveyDocument } from "@/types";
import { getOrCreateGraduateFolder } from "./graduate-folder";
import { getOrCreateFolder } from "./folders";
import { uploadToDrive } from "./upload";

export type SurveyDocumentType = "employment" | "awards";

export async function uploadSurveyDocument(
  survey: Survey,
  file: File,
  documentType: SurveyDocumentType,
): Promise<SurveyDocument> {
  const graduateFolderId = await getOrCreateGraduateFolder(survey);

  const subfolderName =
    documentType === "employment" ? "Employment Documents" : "Awards";

  const documentFolder = await getOrCreateFolder(
    subfolderName,
    graduateFolderId,
  );

  if (!documentFolder.id) {
    throw new Error(`Failed to create or find ${subfolderName} folder`);
  }

  const uploaded = await uploadToDrive(file, documentFolder.id);

  return {
    id: crypto.randomUUID(),
    filename: uploaded.filename,
    mimeType: uploaded.mimeType,
    size: uploaded.size,
    googleDriveFileId: uploaded.googleDriveFileId,
    googleDriveFolderId: uploaded.googleDriveFolderId,
    uploadedAt: new Date().toISOString(),
    documentType,
    metadata: {
      source: "google-drive",
      webViewLink: uploaded.webViewLink,
    },
  };
}
