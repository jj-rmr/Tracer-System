import { supabase } from "@/lib/supabase/server";
import type { DriveBreadcrumb, DriveBrowserItem } from "@/types";

interface DriveItemRow {
  google_drive_file_id: string;
  root_google_drive_folder_id: string;
  parent_google_drive_folder_id: string | null;
  name: string;
  mime_type: string;
  is_folder: boolean;
  size: number | string | null;
  modified_at: string | null;
  web_view_link: string | null;
}

interface DriveAncestryRow extends DriveItemRow {
  depth: number;
}

export interface DriveIndexInput {
  id: string;
  rootId: string;
  parentId: string | null;
  name: string;
  mimeType: string;
  isFolder: boolean;
  size: number | null;
  modifiedTime: string | null;
  webViewLink: string | null;
  syncedAt: string;
}

const selectFields =
  "google_drive_file_id,root_google_drive_folder_id,parent_google_drive_folder_id,name,mime_type,is_folder,size,modified_at,web_view_link";

function mapItem(row: DriveItemRow): DriveBrowserItem {
  return {
    id: row.google_drive_file_id,
    name: row.name,
    mimeType: row.mime_type,
    isFolder: row.is_folder,
    size: row.size === null ? null : Number(row.size),
    modifiedTime: row.modified_at,
    webViewLink: row.web_view_link,
  };
}

function toRow(item: DriveIndexInput) {
  return {
    google_drive_file_id: item.id,
    root_google_drive_folder_id: item.rootId,
    parent_google_drive_folder_id: item.parentId,
    name: item.name,
    mime_type: item.mimeType,
    is_folder: item.isFolder,
    size: item.size,
    modified_at: item.modifiedTime,
    web_view_link: item.webViewLink,
    last_synced_at: item.syncedAt,
  };
}

export async function upsertDriveIndexItems(items: DriveIndexInput[]) {
  if (items.length === 0) return;

  const { error } = await supabase
    .from("google_drive_items")
    .upsert(items.map(toRow), { onConflict: "google_drive_file_id" });

  if (error) throw error;
}

export async function deleteDriveIndexItem(fileId: string) {
  const { error } = await supabase
    .from("google_drive_items")
    .delete()
    .eq("google_drive_file_id", fileId);

  if (error) throw error;
}

export async function deleteDriveIndexItemsOlderThan(
  rootId: string,
  syncedAfter: string,
) {
  const { error } = await supabase
    .from("google_drive_items")
    .delete()
    .eq("root_google_drive_folder_id", rootId)
    .lt("last_synced_at", syncedAfter);

  if (error) throw error;
}

export async function getIndexedDriveItem(fileId: string) {
  const { data, error } = await supabase
    .from("google_drive_items")
    .select(selectFields)
    .eq("google_drive_file_id", fileId)
    .maybeSingle();

  if (error) throw error;
  return data ? (data as DriveItemRow) : null;
}

export async function requireIndexedDriveBrowserItem(
  fileId: string,
  rootId: string,
) {
  const row = await getIndexedDriveItem(fileId);

  if (!row || row.root_google_drive_folder_id !== rootId) {
    throw new Error("The requested Drive item is outside the managed root.");
  }

  return mapItem(row);
}

export async function listIndexedDriveFolder({
  rootId,
  folderId,
  offset = 0,
  limit = 100,
  sort = "name",
  direction = "asc",
}: {
  rootId: string;
  folderId: string;
  offset?: number;
  limit?: number;
  sort?: "name" | "size" | "type" | "modified";
  direction?: "asc" | "desc";
}) {
  const sortColumns = {
    name: "name",
    size: "size",
    type: "mime_type",
    modified: "modified_at",
  } as const;
  const { data, error } = await supabase
    .from("google_drive_items")
    .select(selectFields)
    .eq("root_google_drive_folder_id", rootId)
    .eq("parent_google_drive_folder_id", folderId)
    .order("is_folder", { ascending: false })
    .order(sortColumns[sort], {
      ascending: direction === "asc",
      nullsFirst: false,
    })
    .order("name", { ascending: true })
    .range(offset, offset + limit);

  if (error) throw error;

  const rows = data as DriveItemRow[];
  return {
    items: rows.slice(0, limit).map(mapItem),
    nextOffset: rows.length > limit ? offset + limit : null,
  };
}

export async function searchIndexedDriveItems(
  rootId: string,
  folderId: string,
  search: string,
  sort: "name" | "size" | "type" | "modified" = "name",
  direction: "asc" | "desc" = "asc",
) {
  const escaped = search.replace(/[\\%_]/g, "\\$&");
  const sortColumns = {
    name: "name",
    size: "size",
    type: "mime_type",
    modified: "modified_at",
  } as const;
  const [matchesResult, foldersResult] = await Promise.all([
    supabase
      .from("google_drive_items")
      .select(selectFields)
      .eq("root_google_drive_folder_id", rootId)
      .ilike("name", `%${escaped}%`)
      .order("is_folder", { ascending: false })
      .order(sortColumns[sort], {
        ascending: direction === "asc",
        nullsFirst: false,
      })
      .order("name", { ascending: true })
      .limit(10000),
    supabase
      .from("google_drive_items")
      .select(
        "google_drive_file_id,root_google_drive_folder_id,parent_google_drive_folder_id,name,mime_type,is_folder,size,modified_at,web_view_link",
      )
      .eq("root_google_drive_folder_id", rootId)
      .eq("is_folder", true)
      .limit(10000),
  ]);

  if (matchesResult.error) throw matchesResult.error;
  if (foldersResult.error) throw foldersResult.error;

  const foldersById = new Map(
    (foldersResult.data as DriveItemRow[]).map((folder) => [
      folder.google_drive_file_id,
      folder,
    ]),
  );

  function isInFolderSubtree(item: DriveItemRow) {
    let parentId = item.parent_google_drive_folder_id;
    const visited = new Set<string>();

    while (parentId && !visited.has(parentId)) {
      if (parentId === folderId) return true;
      visited.add(parentId);
      parentId =
        foldersById.get(parentId)?.parent_google_drive_folder_id ?? null;
    }

    return false;
  }

  return (matchesResult.data as DriveItemRow[])
    .filter(isInFolderSubtree)
    .slice(0, 100)
    .map(mapItem);
}

export async function getIndexedDriveBreadcrumbs(
  rootId: string,
  folderId: string,
): Promise<DriveBreadcrumb[]> {
  const { data, error } = await supabase.rpc("indexed_drive_ancestry", {
    target_file_id: folderId,
    target_root_id: rootId,
  });
  if (error) throw error;

  const rows = data as DriveAncestryRow[];
  if (
    rows.length === 0 ||
    rows[0]?.google_drive_file_id !== rootId ||
    rows.some((row) => !row.is_folder)
  ) {
    throw new Error("The requested folder is outside the managed root.");
  }

  return rows.map((row) => ({
    id: row.google_drive_file_id,
    name: row.google_drive_file_id === rootId ? "Drive Root" : row.name,
  }));
}

export async function isIndexedDriveDescendant(
  fileId: string,
  ancestorId: string,
) {
  const { data, error } = await supabase.rpc("is_indexed_drive_descendant", {
    target_file_id: fileId,
    target_ancestor_id: ancestorId,
  });
  if (error) throw error;
  return data === true;
}

export async function updateIndexedDriveItem({
  fileId,
  name,
  parentId,
  modifiedTime,
}: {
  fileId: string;
  name?: string;
  parentId?: string;
  modifiedTime?: string | null;
}) {
  const updates: Record<string, string | null> = {
    last_synced_at: new Date().toISOString(),
  };

  if (name !== undefined) updates.name = name;
  if (parentId !== undefined) updates.parent_google_drive_folder_id = parentId;
  if (modifiedTime !== undefined) updates.modified_at = modifiedTime;

  const { error } = await supabase
    .from("google_drive_items")
    .update(updates)
    .eq("google_drive_file_id", fileId);

  if (error) throw error;
}

export async function listIndexedDriveDescendantIds(fileId: string) {
  const ids = [fileId];
  let frontier = [fileId];

  while (frontier.length > 0) {
    const { data, error } = await supabase
      .from("google_drive_items")
      .select("google_drive_file_id")
      .in("parent_google_drive_folder_id", frontier);

    if (error) throw error;
    frontier = data.map((item) => item.google_drive_file_id);
    ids.push(...frontier);
  }

  return ids;
}

export async function deleteIndexedDriveItems(fileIds: string[]) {
  for (let start = 0; start < fileIds.length; start += 200) {
    const { error } = await supabase
      .from("google_drive_items")
      .delete()
      .in("google_drive_file_id", fileIds.slice(start, start + 200));

    if (error) throw error;
  }
}

export async function listIndexedFolderOptions({
  rootId,
  ancestorId,
  excludeSubtreeId,
}: {
  rootId: string;
  ancestorId: string;
  excludeSubtreeId?: string;
}) {
  const { data, error } = await supabase
    .from("google_drive_items")
    .select(selectFields)
    .eq("root_google_drive_folder_id", rootId)
    .eq("is_folder", true)
    .order("name")
    .limit(10000);

  if (error) throw error;

  const rows = data as DriveItemRow[];
  const rowsById = new Map(rows.map((row) => [row.google_drive_file_id, row]));

  function pathFromAncestor(row: DriveItemRow) {
    const names: string[] = [];
    let current: DriveItemRow | undefined = row;
    const visited = new Set<string>();

    while (current && !visited.has(current.google_drive_file_id)) {
      visited.add(current.google_drive_file_id);
      names.unshift(current.name);
      if (current.google_drive_file_id === ancestorId) return names.join(" / ");
      current = current.parent_google_drive_folder_id
        ? rowsById.get(current.parent_google_drive_folder_id)
        : undefined;
    }

    return null;
  }

  function isInsideExcludedSubtree(row: DriveItemRow) {
    if (!excludeSubtreeId) return false;
    let current: DriveItemRow | undefined = row;
    const visited = new Set<string>();

    while (current && !visited.has(current.google_drive_file_id)) {
      if (current.google_drive_file_id === excludeSubtreeId) return true;
      visited.add(current.google_drive_file_id);
      current = current.parent_google_drive_folder_id
        ? rowsById.get(current.parent_google_drive_folder_id)
        : undefined;
    }

    return false;
  }

  return rows.flatMap((row) => {
    const path = pathFromAncestor(row);

    return path && !isInsideExcludedSubtree(row)
      ? [{ id: row.google_drive_file_id, name: row.name, path }]
      : [];
  });
}

export async function deleteMissingResponseDocumentRecords() {
  const { data, error } = await supabase
    .from("form_response_documents")
    .select("id, google_drive_file_id");

  if (error) throw error;

  const documentFileIds = data.map((document) => document.google_drive_file_id);
  const liveIds = new Set<string>();

  for (let start = 0; start < documentFileIds.length; start += 200) {
    const { data: indexedItems, error: indexError } = await supabase
      .from("google_drive_items")
      .select("google_drive_file_id")
      .in("google_drive_file_id", documentFileIds.slice(start, start + 200));

    if (indexError) throw indexError;
    indexedItems.forEach((item) => liveIds.add(item.google_drive_file_id));
  }

  const staleIds = data
    .filter((document) => !liveIds.has(document.google_drive_file_id))
    .map((document) => document.id);

  if (staleIds.length === 0) return 0;

  const { error: deleteError } = await supabase
    .from("form_response_documents")
    .delete()
    .in("id", staleIds);

  if (deleteError) throw deleteError;
  return staleIds.length;
}
