import { SurveyDocument, SurveyDocumentType } from "@/types";

export async function uploadFormResponseDocument(
  responseId: string,
  file: File,
  documentType: SurveyDocumentType,
): Promise<SurveyDocument> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("documentType", documentType);

  const response = await fetch(`/api/form-responses/${responseId}/documents`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? `Failed to upload ${file.name}.`);
  }

  return result.document;
}

export async function deleteFormResponseDocument(
  responseId: string,
  documentId: string,
) {
  const response = await fetch(
    `/api/form-responses/${responseId}/documents/${documentId}`,
    { method: "DELETE" },
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? "Failed to delete document.");
  }
}
