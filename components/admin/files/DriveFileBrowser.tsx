"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LuChevronRight,
  LuCloud,
  LuExternalLink,
  LuFile,
  LuFolder,
  LuFolderCog,
  LuImage,
  LuEllipsisVertical,
  LuInfo,
  LuMove,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuUpload,
  LuTrash2,
} from "react-icons/lu";

import { FileUploadField } from "@/components/forms/FileUploadField";
import { fieldStyles as styles } from "@/components/forms/graduate-tracer/shared";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import FormModal from "@/components/ui/FormModal";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { DriveBreadcrumb, DriveBrowserItem } from "@/types";

interface FolderPayload {
  folderId: string;
  breadcrumbs: DriveBreadcrumb[];
  items: DriveBrowserItem[];
  nextPageToken: string | null;
  uploadAllowed: boolean;
}

const googlePreviewTypes = new Set([
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
  "application/vnd.google-apps.drawing",
]);

function canPreviewInBrowser(mimeType: string) {
  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("text/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/") ||
    googlePreviewTypes.has(mimeType)
  );
}

function formatSize(size: number | null) {
  if (size === null) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(1)} MB`;
  return `${(size / 1024 ** 3).toFixed(1)} GB`;
}

const googleFileTypes: Record<string, string> = {
  "application/vnd.google-apps.document": "Google Doc",
  "application/vnd.google-apps.spreadsheet": "Google Sheet",
  "application/vnd.google-apps.presentation": "Google Slides",
  "application/vnd.google-apps.drawing": "Google Drawing",
};

function formatFileType(item: DriveBrowserItem) {
  if (item.isFolder) return "Folder";

  const googleFileType = googleFileTypes[item.mimeType];
  if (googleFileType) return googleFileType;

  const extension = item.name.match(/\.([^./]+)$/)?.[1];
  if (extension) return extension.toUpperCase();

  return item.mimeType.split("/").at(-1)?.toUpperCase() ?? "File";
}

function FileIcon({ item }: { item: DriveBrowserItem }) {
  if (item.isFolder) return <LuFolder className="text-amber-500" size={22} />;
  if (item.mimeType.startsWith("image/")) {
    return <LuImage className="text-violet-500" size={22} />;
  }
  return <LuFile className="text-sky-500" size={22} />;
}

function FileSearchField({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 200);
  const lastEmittedValueRef = useRef(debouncedValue);

  useEffect(() => {
    if (debouncedValue === lastEmittedValueRef.current) return;

    lastEmittedValueRef.current = debouncedValue;
    onSearch(debouncedValue.trim());
  }, [debouncedValue, onSearch]);

  return (
    <label className="relative block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
        Search all files
      </span>
      <LuSearch className="pointer-events-none absolute bottom-3.5 left-3 h-4 w-4 text-slate-400" />
      <input
        type="search"
        value={value}
        maxLength={100}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search file or folder name"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-9 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

export default function DriveFileBrowser() {
  const { showToast } = useToast();
  const [folder, setFolder] = useState<FolderPayload | null>(null);
  const folderIdRef = useRef<string | undefined>(undefined);
  const latestRequestIdRef = useRef(0);
  const [items, setItems] = useState<DriveBrowserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [preview, setPreview] = useState<DriveBrowserItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [renamingItem, setRenamingItem] = useState<DriveBrowserItem | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const [movingItems, setMovingItems] = useState<DriveBrowserItem[]>([]);
  const [moveBrowser, setMoveBrowser] = useState<FolderPayload | null>(null);
  const [moveAdminRootId, setMoveAdminRootId] = useState("");
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [infoItem, setInfoItem] = useState<DriveBrowserItem | null>(null);
  const [deletingItems, setDeletingItems] = useState<DriveBrowserItem[]>([]);
  const [mutating, setMutating] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  useEffect(() => {
    const requestId = ++latestRequestIdRef.current;

    async function loadInitialFolder() {
      try {
        const response = await fetch("/api/admin/files", {
          cache: "no-store",
          credentials: "include",
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message);
        if (requestId !== latestRequestIdRef.current) return;

        folderIdRef.current = result.data.folderId;
        setFolder(result.data);
        setItems(result.data.items);
      } catch (error) {
        if (requestId !== latestRequestIdRef.current) return;

        showToast({
          message:
            error instanceof Error ? error.message : "Failed to load files.",
          type: "error",
        });
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setLoading(false);
        }
      }
    }

    void loadInitialFolder();

    return () => {
      latestRequestIdRef.current += 1;
    };
  }, [showToast]);

  useEffect(() => {
    if (!activeMenuId) return;

    function closeMenu(event: MouseEvent) {
      if (!(event.target as Element).closest("[data-file-menu]")) {
        setActiveMenuId(null);
      }
    }

    window.addEventListener("mousedown", closeMenu);
    return () => window.removeEventListener("mousedown", closeMenu);
  }, [activeMenuId]);

  const loadFiles = useCallback(
    async ({
      folderId,
      searchQuery,
      pageToken,
      append = false,
    }: {
      folderId?: string;
      searchQuery?: string;
      pageToken?: string;
      append?: boolean;
    } = {}) => {
      const requestId = ++latestRequestIdRef.current;

      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const query = new URLSearchParams();
        if (folderId) query.set("folder", folderId);
        if (searchQuery) query.set("search", searchQuery);
        if (pageToken) query.set("pageToken", pageToken);

        const response = await fetch(`/api/admin/files?${query}`, {
          cache: "no-store",
          credentials: "include",
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message);
        if (requestId !== latestRequestIdRef.current) return;

        if (searchQuery) {
          setItems(result.data.items);
        } else {
          folderIdRef.current = result.data.folderId;
          setFolder(result.data);
          setItems((current) =>
            append ? [...current, ...result.data.items] : result.data.items,
          );
        }
      } catch (error) {
        if (requestId !== latestRequestIdRef.current) return;

        showToast({
          message:
            error instanceof Error ? error.message : "Failed to load files.",
          type: "error",
        });
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [showToast],
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSelectedItemIds(new Set());
      setSearchQuery(query);
      void loadFiles({
        folderId: folderIdRef.current,
        searchQuery: query || undefined,
      });
    },
    [loadFiles],
  );

  function openFolder(folderId: string) {
    setSelectedItemIds(new Set());
    setSearchQuery("");
    setSearchInputKey((current) => current + 1);
    void loadFiles({ folderId });
  }

  function openFile(item: DriveBrowserItem) {
    const useNativeMobileViewer =
      canPreviewInBrowser(item.mimeType) &&
      window.matchMedia("(max-width: 767px)").matches;

    if (useNativeMobileViewer) {
      const previewTab = window.open("", "_blank");

      if (previewTab) {
        previewTab.opener = null;
        previewTab.location.href = `/api/admin/files/${encodeURIComponent(item.id)}/content`;
        return;
      }
    }

    setPreview(item);
  }

  async function prepareFolders() {
    setPreparing(true);

    try {
      const response = await fetch("/api/admin/files/initialize", {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showToast({
        message: `Synced ${result.data.sync.items} Drive items and prepared folders for ${result.data.studies} studies.`,
        type: "success",
      });
      await loadFiles({ folderId: folderIdRef.current });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to prepare folders.",
        type: "error",
      });
    } finally {
      setPreparing(false);
    }
  }

  async function uploadAdminFiles(event: React.FormEvent) {
    event.preventDefault();

    if (uploadFiles.length === 0 || !folderIdRef.current) return;
    setUploading(true);

    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folderId", folderIdRef.current);

        const response = await fetch("/api/admin/files/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message);
      }

      showToast({
        message: `${uploadFiles.length} ${uploadFiles.length === 1 ? "file" : "files"} uploaded.`,
        type: "success",
      });
      setUploadFiles([]);
      setShowUpload(false);
      await loadFiles({ folderId: folderIdRef.current });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to upload files.",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  async function updateItem(
    item: DriveBrowserItem,
    body: Record<string, string>,
    successMessage: string,
  ) {
    setMutating(true);

    try {
      const response = await fetch(`/api/admin/files/${item.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      showToast({ message: successMessage, type: "success" });
      await loadFiles({ folderId: folderIdRef.current });
      return true;
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to update item.",
        type: "error",
      });
      return false;
    } finally {
      setMutating(false);
    }
  }

  async function renameItem(event: React.FormEvent) {
    event.preventDefault();
    if (!renamingItem || !renameValue.trim()) return;

    if (
      await updateItem(
        renamingItem,
        { action: "rename", name: renameValue },
        "Item renamed.",
      )
    ) {
      setRenamingItem(null);
    }
  }

  async function openMoveDialog(itemsToMove: DriveBrowserItem[]) {
    if (itemsToMove.length === 0) return;
    setMovingItems(itemsToMove);
    setMoveBrowser(null);
    setLoadingDestinations(true);

    try {
      const response = await fetch(
        `/api/admin/files/folders?current=${encodeURIComponent(itemsToMove[0].id)}`,
        { cache: "no-store", credentials: "include" },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMoveAdminRootId(result.data.adminRootId);
      await loadMoveFolder(
        result.data.adminRootId,
        itemsToMove.map((item) => item.id),
      );
    } catch (error) {
      setMovingItems([]);
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to load folders.",
        type: "error",
      });
    } finally {
      setLoadingDestinations(false);
    }
  }

  async function loadMoveFolder(folderId: string, excludedItemIds?: string[]) {
    setLoadingDestinations(true);

    try {
      const response = await fetch(
        `/api/admin/files?folder=${encodeURIComponent(folderId)}`,
        { cache: "no-store", credentials: "include" },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMoveBrowser({
        ...result.data,
        items: result.data.items.filter(
          (item: DriveBrowserItem) =>
            item.isFolder &&
            !(
              excludedItemIds ?? movingItems.map((movingItem) => movingItem.id)
            ).includes(item.id),
        ),
      });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to open folder.",
        type: "error",
      });
    } finally {
      setLoadingDestinations(false);
    }
  }

  async function moveItem(event: React.FormEvent) {
    event.preventDefault();
    if (movingItems.length === 0 || !moveBrowser) return;
    setMutating(true);

    try {
      for (const item of movingItems) {
        const response = await fetch(`/api/admin/files/${item.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "move",
            destinationId: moveBrowser.folderId,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
      }

      showToast({
        message: `${movingItems.length === 1 ? "Item" : "Items"} moved.`,
        type: "success",
      });
      setMovingItems([]);
      setSelectedItemIds(new Set());
      await loadFiles({ folderId: folderIdRef.current });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to move items.",
        type: "error",
      });
    } finally {
      setMutating(false);
    }
  }

  async function deleteItem() {
    if (deletingItems.length === 0) return;
    setMutating(true);

    try {
      for (const item of deletingItems) {
        const response = await fetch(`/api/admin/files/${item.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
      }

      showToast({
        message: `${deletingItems.length === 1 ? "Item" : "Items"} deleted.`,
        type: "success",
      });
      setDeletingItems([]);
      setSelectedItemIds(new Set());
      await loadFiles({ folderId: folderIdRef.current });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to delete item.",
        type: "error",
      });
    } finally {
      setMutating(false);
    }
  }

  async function createFolder(event: React.FormEvent) {
    event.preventDefault();
    if (!folderIdRef.current || !newFolderName.trim()) return;
    setCreatingFolder(true);

    try {
      const response = await fetch("/api/admin/files/folder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: folderIdRef.current,
          name: newFolderName,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setNewFolderName("");
      setShowNewFolder(false);
      showToast({ message: "Folder created.", type: "success" });
      await loadFiles({ folderId: folderIdRef.current });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to create folder.",
        type: "error",
      });
    } finally {
      setCreatingFolder(false);
    }
  }

  const isSearching = Boolean(searchQuery);
  const canUpload = !isSearching && Boolean(folder?.uploadAllowed);
  const selectedItems = items.filter((item) => selectedItemIds.has(item.id));
  const allVisibleItemsSelected =
    items.length > 0 && items.every((item) => selectedItemIds.has(item.id));
  const moveBreadcrumbs = moveBrowser
    ? moveBrowser.breadcrumbs.slice(
        Math.max(
          0,
          moveBrowser.breadcrumbs.findIndex(
            (crumb) => crumb.id === moveAdminRootId,
          ),
        ),
      )
    : [];

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Files
          </h1>
          <p className="text-slate-500">
            Browse and preview files stored in the tracer system Drive.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSyncInfo(true)}
          aria-label="About Drive synchronization"
          className="inline-flex items-center justify-center self-start rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-sky-700 md:self-auto"
        >
          <LuInfo size={19} />
        </button>
      </header>
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <FileSearchField key={searchInputKey} onSearch={handleSearch} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={!canUpload}
                onClick={() => setShowUpload(true)}
                title={
                  canUpload
                    ? "Upload files to this folder"
                    : "Open a folder inside Admin Files to upload"
                }
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-700 shadow-sm hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <LuUpload size={17} /> Upload files
              </button>
              <button
                type="button"
                disabled={!canUpload}
                onClick={() => setShowNewFolder(true)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <LuPlus size={17} /> New folder
              </button>
            </div>
          </div>

          {!isSearching && folder && (
            <nav
              aria-label="Drive folder path"
              className="mt-4 flex flex-wrap items-center gap-1 text-sm"
            >
              {folder.breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex min-w-0 items-center gap-1">
                  {index > 0 && (
                    <LuChevronRight className="shrink-0 text-slate-300" />
                  )}
                  <button
                    type="button"
                    disabled={crumb.id === folder.folderId}
                    aria-current={
                      crumb.id === folder.folderId ? "page" : undefined
                    }
                    onClick={() => openFolder(crumb.id)}
                    className={`truncate rounded-lg px-2 py-1 enabled:hover:bg-sky-50 enabled:hover:text-sky-700 ${
                      index === folder.breadcrumbs.length - 1
                        ? "cursor-default font-semibold text-slate-800"
                        : "text-slate-500"
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </nav>
          )}
        </div>

        {loading ? (
          <LoadingState
            message={isSearching ? "Searching files..." : "Loading files..."}
          />
        ) : items.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center text-slate-500">
            <LuCloud size={36} className="mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">
              {isSearching ? "No matching files found" : "This folder is empty"}
            </p>
            <p className="mt-1 text-sm">
              {isSearching
                ? "Try a different file or folder name."
                : "Files and folders added in Google Drive will appear here."}
            </p>
          </div>
        ) : (
          <div>
            {canUpload && (
              <label className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600 md:hidden">
                <input
                  type="checkbox"
                  checked={allVisibleItemsSelected}
                  onChange={(event) =>
                    setSelectedItemIds(
                      event.target.checked
                        ? new Set(items.map((item) => item.id))
                        : new Set(),
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 accent-sky-600"
                />
                Select all
              </label>
            )}
            {canUpload && selectedItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-sky-100 bg-sky-50 px-5 py-3">
                <span className="mr-auto text-sm font-semibold text-sky-900">
                  {selectedItems.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => void openMoveDialog(selectedItems)}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                >
                  <LuMove size={15} /> Move
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingItems(selectedItems)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LuTrash2 size={15} /> Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItemIds(new Set())}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                >
                  Clear
                </button>
              </div>
            )}
            <div
              className={`hidden items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:grid ${
                canUpload
                  ? "lg:grid-cols-[auto_auto_minmax(0,1fr)_7rem_9rem_11rem_auto]"
                  : "lg:grid-cols-[auto_auto_minmax(0,1fr)_7rem_9rem_11rem]"
              }`}
            >
              {canUpload ? (
                <input
                  type="checkbox"
                  aria-label="Select all files and folders"
                  checked={allVisibleItemsSelected}
                  onChange={(event) =>
                    setSelectedItemIds(
                      event.target.checked
                        ? new Set(items.map((item) => item.id))
                        : new Set(),
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 accent-sky-600"
                />
              ) : (
                <span />
              )}
              <span aria-hidden="true" className="w-5" />
              <span>Name</span>
              <span>Size</span>
              <span>File type</span>
              <span>Modified</span>
              {canUpload && <span className="w-9 text-center">Menu</span>}
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`relative grid w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-sky-50/70 ${
                    canUpload
                      ? "grid-cols-[auto_auto_minmax(0,1fr)_auto] lg:grid-cols-[auto_auto_minmax(0,1fr)_7rem_9rem_11rem_auto]"
                      : "grid-cols-[auto_auto_minmax(0,1fr)] lg:grid-cols-[auto_auto_minmax(0,1fr)_7rem_9rem_11rem]"
                  } ${activeMenuId === item.id ? "z-40" : "z-0"}`}
                >
                  {canUpload ? (
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.name}`}
                      checked={selectedItemIds.has(item.id)}
                      onChange={(event) => {
                        setSelectedItemIds((current) => {
                          const next = new Set(current);
                          if (event.target.checked) next.add(item.id);
                          else next.delete(item.id);
                          return next;
                        });
                      }}
                      className="relative z-10 h-4 w-4 rounded border-slate-300 accent-sky-600"
                    />
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      item.isFolder ? openFolder(item.id) : openFile(item)
                    }
                    aria-label={`${item.isFolder ? "Open folder" : "Open file"} ${item.name}`}
                    className="absolute inset-0 z-0 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                  />
                  <FileIcon item={item} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {item.name}
                    </span>
                  </span>
                  <span className="hidden text-sm text-slate-500 lg:block">
                    {item.isFolder ? "" : formatSize(item.size)}
                  </span>
                  <span className="hidden truncate text-sm text-slate-500 lg:block">
                    {formatFileType(item)}
                  </span>
                  <span className="hidden text-sm text-slate-500 lg:block">
                    {item.modifiedTime
                      ? new Date(item.modifiedTime).toLocaleDateString(
                          "en-PH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "—"}
                  </span>
                  {canUpload && (
                    <div
                      data-file-menu
                      className={`relative flex shrink-0 items-center ${
                        activeMenuId === item.id ? "z-50" : "z-10"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId((current) =>
                            current === item.id ? null : item.id,
                          )
                        }
                        aria-label={`Open menu for ${item.name}`}
                        aria-expanded={activeMenuId === item.id}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-sky-600"
                      >
                        <LuEllipsisVertical size={18} />
                      </button>
                      {activeMenuId === item.id && (
                        <div className="absolute top-[calc(100%+0.25rem)] right-0 z-50 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setRenameValue(item.name);
                              setRenamingItem(item);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <LuPencil size={15} /> Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              void openMoveDialog([item]);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <LuMove size={15} /> Move
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setInfoItem(item);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <LuInfo size={15} /> Info
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeletingItems([item]);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                          >
                            <LuTrash2 size={15} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && folder?.nextPageToken && (
          <div className="border-t border-slate-200 p-4 text-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() =>
                void loadFiles({
                  folderId: folder.folderId,
                  pageToken: folder.nextPageToken ?? undefined,
                  append: true,
                })
              }
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-50"
            >
              <LuRefreshCw className={loadingMore ? "animate-spin" : ""} />
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>

      <FormModal
        open={showUpload}
        onClose={() => {
          setShowUpload(false);
          setUploadFiles([]);
        }}
        title="Upload admin files"
        description={`Select up to 10 files to upload directly into “${folder?.breadcrumbs.at(-1)?.name ?? "the selected Admin Files folder"}”. They will appear in this directory after the upload finishes.`}
        width="md"
        fitContent
        showCloseButton={false}
        shouldConfirmClose={uploadFiles.length > 0}
        confirmationDescription="The selected files will be cleared."
      >
        {(requestClose) => (
          <form onSubmit={uploadAdminFiles} className="space-y-5">
            <FileUploadField
              id="admin-directory-files"
              label="Files"
              files={uploadFiles}
              onChange={setUploadFiles}
              hint="Any file type is accepted. Review the selected files below before uploading them to the current folder."
              maxFiles={10}
              disabled={uploading}
              onError={(message) => showToast({ message, type: "error" })}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={uploading}
                onClick={requestClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || uploadFiles.length === 0}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload files"}
              </button>
            </div>
          </form>
        )}
      </FormModal>

      <FormModal
        open={Boolean(renamingItem)}
        onClose={() => setRenamingItem(null)}
        title="Rename item"
        description={renamingItem?.name}
        width="md"
        fitContent
        showCloseButton={false}
        confirmationDescription="The new name will be discarded."
      >
        {(requestClose) => (
          <form onSubmit={renameItem} className="space-y-5">
            <label>
              <span className={styles.label}>New name</span>
              <input
                value={renameValue}
                maxLength={180}
                onChange={(event) => setRenameValue(event.target.value)}
                className={styles.input(false, mutating)}
                disabled={mutating}
                autoFocus
                required
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={mutating}
                onClick={requestClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutating || !renameValue.trim()}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {mutating ? "Renaming..." : "Rename"}
              </button>
            </div>
          </form>
        )}
      </FormModal>

      <FormModal
        open={movingItems.length > 0}
        onClose={() => setMovingItems([])}
        title={
          movingItems.length === 1
            ? "Move item"
            : `Move ${movingItems.length} items`
        }
        description={
          movingItems.length === 1
            ? movingItems[0]?.name
            : "Browse to the destination folder, then choose Move here."
        }
        width="lg"
        fitContent
        showCloseButton={false}
        shouldConfirmClose={false}
      >
        {(requestClose) => (
          <form onSubmit={moveItem} className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {moveBreadcrumbs.length > 0 && (
                <nav
                  aria-label="Destination folder path"
                  className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  {moveBreadcrumbs.map((crumb, index) => (
                    <div
                      key={crumb.id}
                      className="flex min-w-0 items-center gap-1"
                    >
                      {index > 0 && (
                        <LuChevronRight className="text-slate-300" />
                      )}
                      <button
                        type="button"
                        disabled={crumb.id === moveBrowser?.folderId}
                        onClick={() => void loadMoveFolder(crumb.id)}
                        className="truncate rounded-lg px-2 py-1 text-slate-600 enabled:hover:bg-white enabled:hover:text-sky-700 disabled:font-semibold disabled:text-slate-900"
                      >
                        {crumb.name}
                      </button>
                    </div>
                  ))}
                </nav>
              )}

              {loadingDestinations ? (
                <LoadingState
                  message="Loading folders..."
                  className="min-h-56"
                />
              ) : moveBrowser ? (
                <div className="max-h-80 overflow-y-auto">
                  <div className="border-b border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                    Destination:{" "}
                    <span className="font-semibold">
                      {moveBrowser.breadcrumbs.at(-1)?.name}
                    </span>
                  </div>

                  {moveBrowser.items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500">
                      This folder has no subfolders.
                    </p>
                  ) : (
                    moveBrowser.items.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => void loadMoveFolder(item.id)}
                          className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                        >
                          <LuFolder
                            className="shrink-0 text-amber-500"
                            size={21}
                          />
                          <span className="truncate text-sm font-semibold text-slate-700">
                            {item.name}
                          </span>
                          <LuChevronRight className="ml-auto shrink-0 text-slate-300" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                disabled={mutating}
                onClick={requestClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutating || loadingDestinations || !moveBrowser}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {mutating ? "Moving..." : "Move here"}
              </button>
            </div>
          </form>
        )}
      </FormModal>

      <FormModal
        open={showNewFolder}
        onClose={() => {
          setShowNewFolder(false);
          setNewFolderName("");
        }}
        title="New folder"
        description={`Enter a name for the new folder. It will be created inside “${folder?.breadcrumbs.at(-1)?.name ?? "Admin Files"}” and will become available here and in Google Drive.`}
        width="sm"
        fitContent
        showCloseButton={false}
        shouldConfirmClose={false}
      >
        {(requestClose) => (
          <form onSubmit={createFolder} className="space-y-5">
            <label className="block">
              <span className={styles.label}>Folder name *</span>
              <input
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="Folder name"
                maxLength={180}
                className={styles.input(false, creatingFolder)}
                disabled={creatingFolder}
                autoFocus
                required
              />
            </label>
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                disabled={creatingFolder}
                onClick={requestClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingFolder || !newFolderName.trim()}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {creatingFolder ? "Creating..." : "Create folder"}
              </button>
            </div>
          </form>
        )}
      </FormModal>

      <Modal
        open={showSyncInfo}
        onClose={() => setShowSyncInfo(false)}
        title="About Drive synchronization"
        width="sm"
        bodyClassName="p-5"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-600">
            To ensure real-time updates, edit files using this browser. If you
            make changes directly in Google Drive, sync it to update the tracer
            system.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={preparing}
              onClick={() => void prepareFolders()}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60"
            >
              <LuFolderCog
                className={preparing ? "animate-spin" : ""}
                size={17}
              />
              {preparing ? "Syncing Drive..." : "Sync Drive"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(infoItem)}
        onClose={() => setInfoItem(null)}
        title={infoItem?.name ?? "Item information"}
        width="sm"
        bodyClassName="p-5"
      >
        {infoItem && (
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 py-3 first:pt-0">
              <dt className="font-medium text-slate-500">File type</dt>
              <dd className="wrap-break-word text-slate-800">
                {formatFileType(infoItem)}
              </dd>
            </div>
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 py-3">
              <dt className="font-medium text-slate-500">Size</dt>
              <dd className="text-slate-800">
                {infoItem.isFolder ? "" : formatSize(infoItem.size)}
              </dd>
            </div>
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 py-3">
              <dt className="font-medium text-slate-500">Modified</dt>
              <dd className="text-slate-800">
                {infoItem.modifiedTime
                  ? new Date(infoItem.modifiedTime).toLocaleString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—"}
              </dd>
            </div>
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 py-3 last:pb-0">
              <dt className="font-medium text-slate-500">MIME type</dt>
              <dd className="break-all text-slate-800">{infoItem.mimeType}</dd>
            </div>
          </dl>
        )}
      </Modal>

      <ConfirmationDialog
        open={deletingItems.length > 0}
        onClose={() => setDeletingItems([])}
        onConfirm={() => void deleteItem()}
        title={
          deletingItems.length === 1
            ? `Delete ${deletingItems[0]?.name ?? "item"}?`
            : `Delete ${deletingItems.length} items?`
        }
        description={
          deletingItems.length > 1
            ? "This permanently deletes the selected files and folders, including everything inside selected folders."
            : deletingItems[0]?.isFolder
              ? "This permanently deletes the folder and everything inside it from Admin Files."
              : "This permanently deletes the file from Admin Files."
        }
        cancelLabel="Keep item"
        confirmLabel="Delete permanently"
        tone="danger"
        busy={mutating}
      />

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.name ?? "File preview"}
        description={
          preview
            ? `${preview.mimeType} · ${formatSize(preview.size)}`
            : undefined
        }
        width="xl"
        bodyClassName="flex min-h-0 flex-col bg-slate-100 p-3 md:p-4"
      >
        {preview && (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {canPreviewInBrowser(preview.mimeType) ? (
              <iframe
                title={`Preview ${preview.name}`}
                src={`/api/admin/files/${encodeURIComponent(preview.id)}/content`}
                className="min-h-96 w-full flex-1 rounded-xl border border-slate-200 bg-white"
              />
            ) : (
              <div className="flex min-h-96 flex-1 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
                <LuFile size={40} className="text-slate-300" />
                <p className="mt-4 font-semibold text-slate-800">
                  This format cannot be previewed securely in the browser.
                </p>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  The file remains private and is not being shared through a
                  Google Drive link.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <a
                href={`/api/admin/files/${encodeURIComponent(preview.id)}/content`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                <LuExternalLink size={16} /> Open in new tab
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
