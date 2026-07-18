import { SurveyDocument } from "@/types";

export async function uploadDocument(file: File): Promise<SurveyDocument> {
  const formData = new FormData();

  formData.append("file", file);

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
