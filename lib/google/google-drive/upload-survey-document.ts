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
  // Get the main graduate folder
  const graduateFolderId = await getOrCreateGraduateFolder(survey);

  // Determine the subfolder name
  const subfolderName =
    documentType === "employment" ? "Employment Documents" : "Awards";

  // Create or reuse the subfolder
  const documentFolder = await getOrCreateFolder(
    subfolderName,
    graduateFolderId,
  );

  if (!documentFolder.id) {
    throw new Error(`Failed to create or find ${subfolderName} folder`);
  }

  // Upload the file into the subfolder
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
