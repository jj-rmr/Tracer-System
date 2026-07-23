import { supabase } from "@/lib/supabase/server";
import {
  FormResponse,
  FormResponseSource,
  FormResponseStatus,
} from "@/types";

interface FormResponseRow {
  id: string;
  study_period_id: string;
  user_id: string | null;
  source: FormResponseSource;
  respondent_name: string | null;
  respondent_email: string | null;
  entered_by_user_id: string | null;
  status: FormResponseStatus;
  answers: Record<string, unknown>;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapFormResponse(row: FormResponseRow): FormResponse {
  return {
    id: row.id,
    studyPeriodId: row.study_period_id,
    userId: row.user_id,
    source: row.source,
    respondentName: row.respondent_name,
    respondentEmail: row.respondent_email,
    enteredByUserId: row.entered_by_user_id,
    status: row.status,
    answers: row.answers,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getFormResponse(
  studyPeriodId: string,
  userId: string,
): Promise<FormResponse | null> {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("study_period_id", studyPeriodId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function getFormResponseById(
  responseId: string,
): Promise<FormResponse | null> {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("id", responseId)
    .maybeSingle();

  if (error) throw error;

  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function listFormResponses() {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as FormResponseRow[]).map(mapFormResponse);
}

export async function listFormResponsesByUser(userId: string) {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as FormResponseRow[]).map(mapFormResponse);
}

export async function deleteFormResponse(responseId: string) {
  const { error } = await supabase
    .from("form_responses")
    .delete()
    .eq("id", responseId);

  if (error) throw error;
}

export async function createFormResponseDocument({
  responseId,
  documentType,
  filename,
  mimeType,
  size,
  googleDriveFileId,
  googleDriveFolderId,
  webViewLink,
}: {
  responseId: string;
  documentType: "employment" | "awards";
  filename: string;
  mimeType: string;
  size: number;
  googleDriveFileId: string;
  googleDriveFolderId: string;
  webViewLink?: string;
}) {
  const { data, error } = await supabase
    .from("form_response_documents")
    .insert({
      response_id: responseId,
      document_type: documentType,
      filename,
      mime_type: mimeType,
      size,
      google_drive_file_id: googleDriveFileId,
      google_drive_folder_id: googleDriveFolderId,
      metadata: { source: "google-drive", webViewLink },
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getFormResponseDocuments(
  responseId: string,
): Promise<import("@/types").SurveyDocument[]> {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("*")
    .eq("response_id", responseId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    size: Number(row.size),
    googleDriveFileId: row.google_drive_file_id,
    googleDriveFolderId: row.google_drive_folder_id,
    documentType: row.document_type,
    uploadedAt: row.uploaded_at,
    metadata: row.metadata ?? {},
  }));
}

export async function getFormResponseDocument(documentId: string) {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteFormResponseDocument(documentId: string) {
  const { data, error } = await supabase
    .from("form_response_documents")
    .delete()
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveFormResponse({
  studyPeriodId,
  userId,
  status,
  answers,
}: {
  studyPeriodId: string;
  userId: string;
  status: FormResponseStatus;
  answers: Record<string, unknown>;
}): Promise<FormResponse> {
  const { data, error } = await supabase
    .from("form_responses")
    .upsert(
      {
        study_period_id: studyPeriodId,
        user_id: userId,
        status,
        answers,
        submitted_at: status === "submitted" ? new Date().toISOString() : null,
      },
      {
        onConflict: "study_period_id,user_id",
      },
    )
    .select()
    .single();

  if (error) throw error;

  return mapFormResponse(data as FormResponseRow);
}

export async function createManualFormResponse({
  studyPeriodId,
  enteredByUserId,
  respondentName,
  respondentEmail,
  answers,
}: {
  studyPeriodId: string;
  enteredByUserId: string;
  respondentName?: string;
  respondentEmail?: string;
  answers: Record<string, unknown>;
}): Promise<FormResponse> {
  const { data, error } = await supabase
    .from("form_responses")
    .insert({
      study_period_id: studyPeriodId,
      user_id: null,
      source: "admin_import",
      respondent_name: respondentName?.trim() || null,
      respondent_email: respondentEmail?.trim().toLowerCase() || null,
      entered_by_user_id: enteredByUserId,
      status: "submitted",
      answers,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return mapFormResponse(data as FormResponseRow);
}
