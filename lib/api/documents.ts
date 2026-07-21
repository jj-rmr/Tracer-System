import { SurveyDocument } from "@/types";

export type SurveyDocumentType = "employment" | "awards";

export async function uploadDocument(
  file: File,
  surveyId: string,
  documentType: SurveyDocumentType,
): Promise<SurveyDocument> {
  const MAX_SIZE = 10 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds 10MB limit");
  }

  // 1. Ask your server to create a Google Drive upload session
  const sessionResponse = await fetch("/api/alumni/documents/upload-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      surveyId,
      documentType,
    }),
  });

  const sessionResult = await sessionResponse.json();

  if (!sessionResponse.ok) {
    throw new Error(sessionResult.message || "Failed to create upload session");
  }

  const { uploadUrl } = sessionResult;

  // 2. Upload the actual file directly to Google Drive
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "Content-Length": String(file.size),
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();

    throw new Error(`Google Drive upload failed: ${errorText}`);
  }

  const uploadedFile = await uploadResponse.json();

  // 3. Tell your server about the uploaded Google Drive file
  const completeResponse = await fetch("/api/alumni/documents/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      surveyId,
      documentType,
      filename: uploadedFile.name,
      mimeType: uploadedFile.mimeType,
      size: Number(uploadedFile.size),
      googleDriveFileId: uploadedFile.id,
      googleDriveFolderId: sessionResult.folderId,
      webViewLink: uploadedFile.webViewLink,
    }),
  });

  const completeResult = await completeResponse.json();

  if (!completeResponse.ok) {
    throw new Error(completeResult.message || "Failed to save document");
  }

  return completeResult.document;
}

// import { SurveyDocument } from "@/types";

// export type SurveyDocumentType = "employment" | "awards";

// export async function uploadDocument(
//   file: File,
//   surveyId: string,
//   documentType: SurveyDocumentType,
// ): Promise<SurveyDocument> {
//   const formData = new FormData();

//   formData.append("file", file);
//   formData.append("surveyId", surveyId);
//   formData.append("documentType", documentType);

//   const response = await fetch("/api/alumni/documents/upload", {
//     method: "POST",
//     body: formData,
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(result.message || "Failed to upload document");
//   }

//   return result.document;
// }

export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`/api/alumni/documents/${documentId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete document");
  }
}
