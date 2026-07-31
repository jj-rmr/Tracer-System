import { supabase } from "@/lib/supabase/server";
import {
  FormResponse,
  FormResponseSource,
  FormResponseStatus,
  DriveOrganizationStatus,
  ResponseDeletionStatus,
  SurveyDocument,
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
  drive_organization_status: DriveOrganizationStatus;
  drive_organization_error: string | null;
  drive_organized_at: string | null;
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
    driveOrganizationStatus: row.drive_organization_status,
    driveOrganizationError: row.drive_organization_error,
    driveOrganizedAt: row.drive_organized_at,
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

export async function listDraftResponsesOwnedByAccount(accountId: string) {
  const [alumniDrafts, manualDrafts] = await Promise.all([
    supabase
      .from("form_responses")
      .select("*")
      .eq("user_id", accountId)
      .eq("status", "draft")
      .eq("deletion_status", "active"),
    supabase
      .from("form_responses")
      .select("*")
      .eq("entered_by_user_id", accountId)
      .eq("source", "admin_import")
      .eq("status", "draft")
      .eq("deletion_status", "active"),
  ]);

  if (alumniDrafts.error) throw alumniDrafts.error;
  if (manualDrafts.error) throw manualDrafts.error;

  const rows = [
    ...alumniDrafts.data,
    ...manualDrafts.data,
  ] as FormResponseRow[];
  return [...new Map(rows.map((row) => [row.id, row])).values()].map(
    mapFormResponse,
  );
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
    .neq("drive_organization_status", "organizing")
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
  uploadStatus = "ready",
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
  uploadStatus?: "staged" | "ready";
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
      upload_status: uploadStatus,
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
    .eq("upload_status", "ready")
    .maybeSingle();

  if (error) throw error;
  return data ? mapFormResponseDocument(data) : null;
}

export async function getFormResponseForDeletion(
  responseId: string,
): Promise<FormResponse | null> {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("id", responseId)
    .in("deletion_status", ["active", "deleting", "delete_failed"])
    .maybeSingle();

  if (error) throw error;
  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function getFormResponseForUserDeletion(
  studyPeriodId: string,
  userId: string,
): Promise<FormResponse | null> {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("study_period_id", studyPeriodId)
    .eq("user_id", userId)
    .in("deletion_status", ["active", "deleting", "delete_failed"])
    .maybeSingle();

  if (error) throw error;
  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function getFormResponseDocuments(
  responseId: string,
): Promise<import("@/types").SurveyDocument[]> {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("*")
    .eq("response_id", responseId)
    .eq("upload_status", "ready")
    .order("uploaded_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => mapFormResponseDocument(row));
}

export async function getAllFormResponseDocuments(
  responseId: string,
): Promise<SurveyDocument[]> {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("*")
    .eq("response_id", responseId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data.map((row) => mapFormResponseDocument(row));
}

export async function markFormResponseDocumentReady(documentId: string) {
  const { data, error } = await supabase
    .from("form_response_documents")
    .update({ upload_status: "ready" })
    .eq("id", documentId)
    .eq("upload_status", "staged")
    .select()
    .single();

  if (error) throw error;
  return mapFormResponseDocument(data);
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
  expectedUpdatedAt,
}: {
  studyPeriodId: string;
  userId: string;
  status: FormResponseStatus;
  answers: Record<string, unknown>;
  expectedUpdatedAt?: string;
}): Promise<{ response: FormResponse; shouldOrganize: boolean }> {
  const { data, error } = await supabase.rpc("save_alumni_form_response", {
    target_study_period_id: studyPeriodId,
    target_user_id: userId,
    next_status: status,
    next_answers: answers,
    expected_content_updated_at: expectedUpdatedAt ?? null,
  });

  if (error?.message.includes("STALE_FORM_RESPONSE")) {
    throw new StaleFormResponseError();
  }
  if (error) throw error;

  const result = data as {
    response: FormResponseRow;
    shouldOrganize: boolean;
  };
  return {
    response: mapFormResponse(result.response),
    shouldOrganize: result.shouldOrganize,
  };
}

export class StaleFormResponseError extends Error {
  constructor() {
    super("The response was updated elsewhere.");
    this.name = "StaleFormResponseError";
  }
}

function mapFormResponseDocument(row: Record<string, unknown>): SurveyDocument {
  return {
    id: String(row.id),
    filename: String(row.filename),
    mimeType: String(row.mime_type),
    size: Number(row.size),
    googleDriveFileId: String(row.google_drive_file_id),
    googleDriveFolderId: String(row.google_drive_folder_id),
    documentType: row.document_type as SurveyDocument["documentType"],
    uploadKey: typeof row.upload_key === "string" ? row.upload_key : undefined,
    uploadedAt: String(row.uploaded_at),
    metadata: (row.metadata as Record<string, unknown> | null) ?? {},
  };
}

export async function getFormResponseDocumentByDriveFileId(fileId: string) {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("*")
    .eq("google_drive_file_id", fileId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapFormResponseDocument(data) : null;
}

export async function listStagedFormResponseDocumentsOlderThan(
  olderThan: string,
) {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("id,google_drive_file_id")
    .eq("upload_status", "staged")
    .lt("uploaded_at", olderThan);

  if (error) throw error;
  return data as { id: string; google_drive_file_id: string }[];
}

export async function markResponseDriveOrganizationStarted(responseId: string) {
  const { data, error } = await supabase
    .from("form_responses")
    .update({
      drive_organization_status: "organizing",
      drive_organization_error: null,
    })
    .eq("id", responseId)
    .eq("deletion_status", "active")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function markResponseDriveOrganized(responseId: string) {
  const { error } = await supabase
    .from("form_responses")
    .update({
      drive_organization_status: "organized",
      drive_organization_error: null,
      drive_organized_at: new Date().toISOString(),
    })
    .eq("id", responseId)
    .eq("deletion_status", "active");

  if (error) throw error;
}

export async function markResponseDriveOrganizationFailed(
  responseId: string,
  message: string,
) {
  const { error } = await supabase
    .from("form_responses")
    .update({
      drive_organization_status: "failed",
      drive_organization_error: message.slice(0, 1000),
    })
    .eq("id", responseId)
    .eq("deletion_status", "active");

  if (error) throw error;
}

export async function createManualFormResponse({
  studyPeriodId,
  enteredByUserId,
  respondentName,
  respondentEmail,
  answers,
  importToken,
  status = "submitted",
}: {
  studyPeriodId: string;
  enteredByUserId: string;
  respondentName?: string;
  respondentEmail?: string;
  answers: Record<string, unknown>;
  importToken: string;
  status?: FormResponseStatus;
}): Promise<{ response: FormResponse; importToken: string }> {
  const values = {
    study_period_id: studyPeriodId,
    user_id: null,
    source: "admin_import" as const,
    respondent_name: respondentName?.trim() || null,
    respondent_email: respondentEmail?.trim().toLowerCase() || null,
    entered_by_user_id: enteredByUserId,
    status,
    answers,
    submitted_at: status === "submitted" ? new Date().toISOString() : null,
    import_status: "processing" as const,
    import_token: importToken,
    drive_organization_status: "pending" as const,
    drive_organization_error: null,
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
    return {
      response: mapFormResponse(data as FormResponseRow),
      importToken,
    };
  }

  const resumableDraft = await getManualDraftForAdminStudy(
    enteredByUserId,
    studyPeriodId,
  );

  if (resumableDraft) {
    const { data, error } = await supabase
      .from("form_responses")
      .update({ ...values, import_token: resumableDraft.importToken })
      .eq("id", resumableDraft.response.id)
      .eq("deletion_status", "active")
      .select()
      .single();

    if (error) throw error;
    return {
      response: mapFormResponse(data as FormResponseRow),
      importToken: resumableDraft.importToken,
    };
  }

  const { data, error } = await supabase
    .from("form_responses")
    .insert(values)
    .select()
    .single();

  if (error?.code === "23505") {
    const concurrentResponse =
      await getManualFormResponseByImportToken(importToken);

    if (concurrentResponse) {
      return { response: concurrentResponse, importToken };
    }

    const existingDraft = await getManualDraftForAdminStudy(
      enteredByUserId,
      studyPeriodId,
    );

    if (existingDraft) {
      const { data: updatedDraft, error: updateError } = await supabase
        .from("form_responses")
        .update({ ...values, import_token: existingDraft.importToken })
        .eq("id", existingDraft.response.id)
        .eq("deletion_status", "active")
        .select()
        .single();

      if (updateError) throw updateError;
      return {
        response: mapFormResponse(updatedDraft as FormResponseRow),
        importToken: existingDraft.importToken,
      };
    }
  }

  if (error) throw error;

  return {
    response: mapFormResponse(data as FormResponseRow),
    importToken,
  };
}

async function getManualDraftForAdminStudy(
  enteredByUserId: string,
  studyPeriodId: string,
) {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("source", "admin_import")
    .eq("entered_by_user_id", enteredByUserId)
    .eq("study_period_id", studyPeriodId)
    .eq("status", "draft")
    .eq("import_status", "processing")
    .eq("deletion_status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as FormResponseRow & { import_token: string };
  return { response: mapFormResponse(row), importToken: row.import_token };
}

export async function updateManualFormResponse({
  responseId,
  respondentName,
  respondentEmail,
  answers,
}: {
  responseId: string;
  respondentName?: string;
  respondentEmail?: string;
  answers: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from("form_responses")
    .update({
      respondent_name: respondentName?.trim() || null,
      respondent_email: respondentEmail?.trim().toLowerCase() || null,
      answers,
      drive_organization_status: "pending",
      drive_organization_error: null,
    })
    .eq("id", responseId)
    .eq("source", "admin_import")
    .eq("deletion_status", "active")
    .select()
    .maybeSingle();

  if (error) throw error;
  return data ? mapFormResponse(data as FormResponseRow) : null;
}

export async function listManualDraftsForAdmin(enteredByUserId: string) {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("source", "admin_import")
    .eq("entered_by_user_id", enteredByUserId)
    .eq("status", "draft")
    .eq("import_status", "processing")
    .eq("deletion_status", "active")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as Array<FormResponseRow & { import_token: string }>).map(
    (row) => ({
      response: mapFormResponse(row),
      importToken: row.import_token,
    }),
  );
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
