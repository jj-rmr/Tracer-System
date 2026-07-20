import { supabase } from "@/lib/supabase/server";
import { SurveyDocument } from "@/types";

function toDb(document: Partial<SurveyDocument>, surveyId: string) {
  const safeFilename = document.filename?.trim() || "untitled-file";
  const safeMimeType = document.mimeType?.trim() || "application/octet-stream";
  const safeDriveFileId =
    document.googleDriveFileId?.trim() || "unknown-file-id";
  const safeDriveFolderId =
    document.googleDriveFolderId?.trim() || "unknown-folder-id";

  const metadata = {
    ...(document.metadata ?? {}),
    filename: safeFilename,
    mimeType: safeMimeType,
    size: document.size ?? 0,
    googleDriveFileId: safeDriveFileId,
    googleDriveFolderId: safeDriveFolderId,
    uploadedAt: document.uploadedAt ?? null,
  };

  return {
    survey_id: surveyId,

    filename: safeFilename,

    mime_type: safeMimeType,

    size: document.size ?? 0,

    google_drive_file_id: safeDriveFileId,

    google_drive_folder_id: safeDriveFolderId,

    metadata,
  };
}

function fromDb(row: any): SurveyDocument {
  return {
    id: row.id,

    filename: row.filename,

    mimeType: row.mime_type,

    size: Number(row.size),

    googleDriveFileId: row.google_drive_file_id,

    googleDriveFolderId: row.google_drive_folder_id,

    uploadedAt: row.uploaded_at,
    metadata: row.metadata ?? {},
  };
}

export async function createSurveyDocument(
  surveyId: string,
  document: Partial<SurveyDocument>,
) {
  const payload = toDb(document, surveyId);

  const { data, error } = await supabase
    .from("survey_documents")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return fromDb(data);
}

export async function getSurveyDocuments(surveyId: string) {
  const { data, error } = await supabase
    .from("survey_documents")
    .select("*")
    .eq("survey_id", surveyId)
    .order("uploaded_at", {
      ascending: false,
    });

  if (error) throw error;

  return data.map(fromDb);
}

export async function getSurveyDocumentById(documentId: string) {
  const { data, error } = await supabase
    .from("survey_documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (error) throw error;

  return data ? fromDb(data) : null;
}

export async function getSurveyDocumentWithSurveyId(documentId: string) {
  const { data, error } = await supabase
    .from("survey_documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  return {
    document: fromDb(data),
    surveyId: data.survey_id,
  };
}

export async function deleteSurveyDocument(documentId: string) {
  const { data, error } = await supabase
    .from("survey_documents")
    .delete()
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;

  return fromDb(data);
}
