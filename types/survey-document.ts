export type SurveyDocumentType = "employment" | "awards";

export interface SurveyDocument {
  id: string;

  filename: string;
  mimeType: string;
  size: number;

  googleDriveFileId: string;
  googleDriveFolderId: string;

  documentType?: SurveyDocumentType;

  uploadedAt: string;
  metadata?: Record<string, unknown>;
}
