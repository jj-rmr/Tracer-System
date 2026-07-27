import "server-only";

import { supabase } from "@/lib/supabase/server";

export interface DirectDriveUploadSession {
  id: string;
  responseId: string;
  actorUserId: string;
  documentType: "employment" | "awards";
  uploadKey: string;
  filename: string;
  mimeType: string;
  size: number;
  driveFileId: string;
  uploadUrl: string;
  stagingFolderId: string;
  status: "initiated" | "finalizing" | "finalized" | "failed" | "expired";
  documentId: string | null;
  expiresAt: string;
}

function mapSession(row: Record<string, unknown>): DirectDriveUploadSession {
  return {
    id: String(row.id),
    responseId: String(row.response_id),
    actorUserId: String(row.actor_user_id),
    documentType: row.document_type as DirectDriveUploadSession["documentType"],
    uploadKey: String(row.upload_key),
    filename: String(row.filename),
    mimeType: String(row.mime_type),
    size: Number(row.size),
    driveFileId: String(row.drive_file_id),
    uploadUrl: String(row.upload_url),
    stagingFolderId: String(row.staging_folder_id),
    status: row.status as DirectDriveUploadSession["status"],
    documentId: typeof row.document_id === "string" ? row.document_id : null,
    expiresAt: String(row.expires_at),
  };
}

export async function createDirectDriveUploadSession(
  session: Omit<DirectDriveUploadSession, "status" | "documentId">,
) {
  const { data, error } = await supabase
    .from("direct_drive_upload_sessions")
    .insert({
      id: session.id,
      response_id: session.responseId,
      actor_user_id: session.actorUserId,
      document_type: session.documentType,
      upload_key: session.uploadKey,
      filename: session.filename,
      mime_type: session.mimeType,
      size: session.size,
      drive_file_id: session.driveFileId,
      upload_url: session.uploadUrl,
      staging_folder_id: session.stagingFolderId,
      expires_at: session.expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return mapSession(data);
}

export async function getDirectDriveUploadSession(id: string) {
  const { data, error } = await supabase
    .from("direct_drive_upload_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSession(data) : null;
}

export async function getDirectDriveUploadSessionByUploadKey(
  responseId: string,
  uploadKey: string,
) {
  const { data, error } = await supabase
    .from("direct_drive_upload_sessions")
    .select("*")
    .eq("response_id", responseId)
    .eq("upload_key", uploadKey)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSession(data) : null;
}

export async function claimDirectDriveUploadFinalization(id: string) {
  const { data, error } = await supabase
    .from("direct_drive_upload_sessions")
    .update({ status: "finalizing" })
    .eq("id", id)
    .eq("status", "initiated")
    .gt("expires_at", new Date().toISOString())
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapSession(data) : null;
}

export async function markDirectDriveUploadFinalized(
  id: string,
  documentId: string,
) {
  const { error } = await supabase
    .from("direct_drive_upload_sessions")
    .update({
      status: "finalized",
      document_id: documentId,
      finalized_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "finalizing");
  if (error) throw error;
}

export async function releaseDirectDriveUploadFinalization(id: string) {
  const { error } = await supabase
    .from("direct_drive_upload_sessions")
    .update({ status: "initiated" })
    .eq("id", id)
    .eq("status", "finalizing");
  if (error) throw error;
}

export async function markDirectDriveUploadFailed(id: string) {
  const { error } = await supabase
    .from("direct_drive_upload_sessions")
    .update({ status: "failed" })
    .eq("id", id);
  if (error) throw error;
}

export async function listExpiredDirectDriveUploadSessions() {
  const { data, error } = await supabase
    .from("direct_drive_upload_sessions")
    .select("*")
    .in("status", ["initiated", "failed"])
    .lt("expires_at", new Date().toISOString())
    .limit(50);
  if (error) throw error;
  return data.map(mapSession);
}

export async function markDirectDriveUploadExpired(id: string) {
  const { error } = await supabase
    .from("direct_drive_upload_sessions")
    .update({ status: "expired" })
    .eq("id", id);
  if (error) throw error;
}
