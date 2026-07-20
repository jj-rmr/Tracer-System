import { SurveyDocument } from "@/types";

export async function uploadDocument(
  file: File,
  surveyId: string,
): Promise<SurveyDocument> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("surveyId", surveyId);

  const response = await fetch("/api/alumni/documents/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to upload document");
  }

  return result.document;
}
export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`/api/alumni/documents/${documentId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete document");
  }
}
