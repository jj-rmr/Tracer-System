export interface SurveyDocument {
  id: string;

  filename: string;
  mimeType: string;
  size: number;

  googleDriveFileId: string;
  googleDriveFolderId: string;

  uploadedAt: string;
  metadata?: Record<string, unknown>;
}
