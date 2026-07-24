import { supabase } from "@/lib/supabase/server";
import {
  FormResponse,
  FormResponseSource,
  FormResponseStatus,
  ResponseDeletionStatus,
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
  deletion_status: ResponseDeletionStatus;
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
    deletionStatus: row.deletion_status,
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
    .eq("deletion_status", "active")
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
    .eq("deletion_status", "active")
    .maybeSingle();

  if (error) throw error;

  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function listFormResponses() {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("deletion_status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as FormResponseRow[]).map(mapFormResponse);
}

export async function listFormResponsesByIds(responseIds: string[]) {
  if (responseIds.length === 0) return [];

  const rows: FormResponseRow[] = [];
  const chunkSize = 200;

  for (let index = 0; index < responseIds.length; index += chunkSize) {
    const chunk = responseIds.slice(index, index + chunkSize);
    const { data, error } = await supabase
      .from("form_responses")
      .select("*")
      .eq("deletion_status", "active")
      .in("id", chunk);

    if (error) throw error;
    rows.push(...(data as FormResponseRow[]));
  }

  const responseOrder = new Map(
    responseIds.map((responseId, index) => [responseId, index]),
  );

  return rows
    .sort(
      (left, right) =>
        (responseOrder.get(left.id) ?? 0) - (responseOrder.get(right.id) ?? 0),
    )
    .map(mapFormResponse);
}

export async function listFormResponsesByUser(userId: string) {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("user_id", userId)
    .eq("deletion_status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as FormResponseRow[]).map(mapFormResponse);
}

export async function deleteFormResponse(responseId: string) {
  const { error } = await supabase
    .from("form_responses")
    .delete()
    .eq("id", responseId)
    .eq("deletion_status", "deleting");

  if (error) throw error;
}

export async function claimFormResponseDeletion(responseId: string) {
  const { data, error } = await supabase
    .from("form_responses")
    .update({ deletion_status: "deleting" })
    .eq("id", responseId)
    .in("deletion_status", ["active", "delete_failed"])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function markFormResponseDeletionFailed(responseId: string) {
  const { error } = await supabase
    .from("form_responses")
    .update({ deletion_status: "delete_failed" })
    .eq("id", responseId)
    .eq("deletion_status", "deleting");

  if (error) throw error;
}

export async function getFormResponseDeletionStatus(responseId: string) {
  const { data, error } = await supabase
    .from("form_responses")
    .select("deletion_status")
    .eq("id", responseId)
    .maybeSingle();

  if (error) throw error;
  return (data?.deletion_status as ResponseDeletionStatus | undefined) ?? null;
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
  uploadKey,
}: {
  responseId: string;
  documentType: "employment" | "awards";
  filename: string;
  mimeType: string;
  size: number;
  googleDriveFileId: string;
  googleDriveFolderId: string;
  webViewLink?: string;
  uploadKey?: string;
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
      upload_key: uploadKey ?? null,
      metadata: { source: "google-drive", webViewLink },
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getFormResponseDocumentByUploadKey(
  responseId: string,
  uploadKey: string,
) {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("*")
    .eq("response_id", responseId)
    .eq("upload_key", uploadKey)
    .maybeSingle();

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
    uploadKey: row.upload_key ?? undefined,
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
  importToken,
}: {
  studyPeriodId: string;
  enteredByUserId: string;
  respondentName?: string;
  respondentEmail?: string;
  answers: Record<string, unknown>;
  importToken: string;
}): Promise<FormResponse> {
  const values = {
    study_period_id: studyPeriodId,
    user_id: null,
    source: "admin_import" as const,
    respondent_name: respondentName?.trim() || null,
    respondent_email: respondentEmail?.trim().toLowerCase() || null,
    entered_by_user_id: enteredByUserId,
    status: "submitted" as const,
    answers,
    submitted_at: new Date().toISOString(),
    import_status: "processing" as const,
    import_token: importToken,
  };
  const existing = await getManualFormResponseByImportToken(importToken);

  if (existing) {
    const { data, error } = await supabase
      .from("form_responses")
      .update(values)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return mapFormResponse(data as FormResponseRow);
  }

  const { data, error } = await supabase
    .from("form_responses")
    .insert(values)
    .select()
    .single();

  if (error?.code === "23505") {
    const concurrentResponse = await getManualFormResponseByImportToken(
      importToken,
    );

    if (concurrentResponse) return concurrentResponse;
  }

  if (error) throw error;

  return mapFormResponse(data as FormResponseRow);
}

async function getManualFormResponseByImportToken(importToken: string) {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("source", "admin_import")
    .eq("import_token", importToken)
    .maybeSingle();

  if (error) throw error;
  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function setManualImportStatus(
  responseId: string,
  importStatus: "processing" | "completed" | "failed",
) {
  const { data, error } = await supabase
    .from("form_responses")
    .update({ import_status: importStatus })
    .eq("id", responseId)
    .eq("source", "admin_import")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
