import { supabase } from "@/lib/supabase/server";

export interface GoogleDriveFolderRecord {
  folderKey: string;
  googleDriveFolderId: string;
  name: string;
  parentGoogleDriveFolderId: string;
}

interface GoogleDriveFolderRow {
  folder_key: string;
  google_drive_folder_id: string;
  name: string;
  parent_google_drive_folder_id: string;
}

function mapFolder(row: GoogleDriveFolderRow): GoogleDriveFolderRecord {
  return {
    folderKey: row.folder_key,
    googleDriveFolderId: row.google_drive_folder_id,
    name: row.name,
    parentGoogleDriveFolderId: row.parent_google_drive_folder_id,
  };
}

export async function getRegisteredDriveFolder(folderKey: string) {
  const { data, error } = await supabase
    .from("google_drive_folders")
    .select(
      "folder_key, google_drive_folder_id, name, parent_google_drive_folder_id",
    )
    .eq("folder_key", folderKey)
    .maybeSingle();

  if (error) throw error;

  return data ? mapFolder(data as GoogleDriveFolderRow) : null;
}

export async function claimDriveFolder({
  folderKey,
  googleDriveFolderId,
  name,
  parentGoogleDriveFolderId,
}: GoogleDriveFolderRecord) {
  const { data, error } = await supabase
    .from("google_drive_folders")
    .insert({
      folder_key: folderKey,
      google_drive_folder_id: googleDriveFolderId,
      name,
      parent_google_drive_folder_id: parentGoogleDriveFolderId,
    })
    .select(
      "folder_key, google_drive_folder_id, name, parent_google_drive_folder_id",
    )
    .single();

  if (error?.code === "23505") {
    return null;
  }

  if (error) throw error;

  return mapFolder(data as GoogleDriveFolderRow);
}

export async function updateRegisteredDriveFolder({
  folderKey,
  name,
  parentGoogleDriveFolderId,
}: Pick<
  GoogleDriveFolderRecord,
  "folderKey" | "name" | "parentGoogleDriveFolderId"
>) {
  const { error } = await supabase
    .from("google_drive_folders")
    .update({
      name,
      parent_google_drive_folder_id: parentGoogleDriveFolderId,
    })
    .eq("folder_key", folderKey);

  if (error) throw error;
}

export async function listRegisteredResponseFolders(responseId: string) {
  const { data, error } = await supabase
    .from("google_drive_folders")
    .select(
      "folder_key, google_drive_folder_id, name, parent_google_drive_folder_id",
    )
    .like("folder_key", `%:response:${responseId}%`);

  if (error) throw error;

  return (data as GoogleDriveFolderRow[]).map(mapFolder);
}

export async function listRegisteredDriveFolderDescendants(
  rootFolderId: string,
) {
  const { data, error } = await supabase
    .from("google_drive_folders")
    .select(
      "folder_key, google_drive_folder_id, name, parent_google_drive_folder_id",
    );

  if (error) throw error;
  const rows = (data as GoogleDriveFolderRow[]).map(mapFolder);
  const descendantIds = new Set([rootFolderId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const folder of rows) {
      if (
        descendantIds.has(folder.parentGoogleDriveFolderId) &&
        !descendantIds.has(folder.googleDriveFolderId)
      ) {
        descendantIds.add(folder.googleDriveFolderId);
        changed = true;
      }
    }
  }

  return rows.filter((folder) => descendantIds.has(folder.googleDriveFolderId));
}

export async function deleteRegisteredDriveFolders(folderKeys: string[]) {
  if (folderKeys.length === 0) return;

  const { error } = await supabase
    .from("google_drive_folders")
    .delete()
    .in("folder_key", folderKeys);

  if (error) throw error;
}

export async function updateRegisteredDriveFolderById({
  googleDriveFolderId,
  name,
  parentGoogleDriveFolderId,
}: {
  googleDriveFolderId: string;
  name?: string;
  parentGoogleDriveFolderId?: string;
}) {
  const updates: Record<string, string> = {};
  if (name !== undefined) updates.name = name;
  if (parentGoogleDriveFolderId !== undefined) {
    updates.parent_google_drive_folder_id = parentGoogleDriveFolderId;
  }
  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from("google_drive_folders")
    .update(updates)
    .eq("google_drive_folder_id", googleDriveFolderId);

  if (error) throw error;
}

export async function deleteRegisteredDriveFoldersByIds(folderIds: string[]) {
  if (folderIds.length === 0) return;

  const { error } = await supabase
    .from("google_drive_folders")
    .delete()
    .in("google_drive_folder_id", folderIds);

  if (error) throw error;
}

export async function getRegisteredDriveFolderById(
  googleDriveFolderId: string,
) {
  const { data, error } = await supabase
    .from("google_drive_folders")
    .select(
      "folder_key, google_drive_folder_id, name, parent_google_drive_folder_id",
    )
    .eq("google_drive_folder_id", googleDriveFolderId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapFolder(data as GoogleDriveFolderRow) : null;
}

export async function rekeyRegisteredDriveFolder({
  currentFolderKey,
  nextFolderKey,
}: {
  currentFolderKey: string;
  nextFolderKey: string;
}) {
  const { error } = await supabase
    .from("google_drive_folders")
    .update({ folder_key: nextFolderKey })
    .eq("folder_key", currentFolderKey);

  if (error) throw error;
}

export async function deleteUnseenRegisteredDriveFolders(
  liveFolderIds: string[],
  olderThan: string,
) {
  const { data, error } = await supabase
    .from("google_drive_folders")
    .select("folder_key, google_drive_folder_id, updated_at")
    .lt("updated_at", olderThan);

  if (error) throw error;

  const liveIds = new Set(liveFolderIds);
  const staleKeys = (
    data as Pick<
      GoogleDriveFolderRow,
      "folder_key" | "google_drive_folder_id"
    >[]
  )
    .filter((folder) => !liveIds.has(folder.google_drive_folder_id))
    .map((folder) => folder.folder_key);

  await deleteRegisteredDriveFolders(staleKeys);
  return staleKeys.length;
}
