"use client";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { SurveyDocument } from "@/types";
import { useEffect, useRef, useState } from "react";
import {
  LuCloudUpload,
  LuFileText,
  LuFileType2,
  LuX,
} from "@/components/ui/icons";

interface FileUploadFieldProps {
  id: string;
  name?: string;
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  existingDocuments?: SurveyDocument[];
  onRequestDeleteDocument?: (document: SurveyDocument) => void;
  accept?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  maxFiles?: number;
  onError?: (message: string) => void;
  uploadingFiles?: File[];
  uploadProgress?: ReadonlyMap<File, number>;
  variant?: "small" | "large";
}

const styles = {
  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground",

  input: (
    err: boolean,
    disabled: boolean,
    isDragActive: boolean,
    hasFile: boolean,
    variant: "small" | "large",
  ) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-border bg-card text-muted-foreground shadow-none"
      : err
        ? "border-destructive bg-destructive/10 text-foreground focus-within:ring-4 focus-within:ring-destructive/20"
        : isDragActive
          ? "border-ring bg-muted"
          : hasFile
            ? "border-ring bg-card"
            : "border-border bg-card hover:border-ring";

    const sizeClass = variant === "large" ? "min-h-52 p-6" : "min-h-32 p-4";

    return `w-full overflow-hidden rounded-2xl border border-dashed text-left text-sm transition duration-200 ${disabled ? "" : "cursor-pointer"} ${sizeClass} ${stateClass}`;
  },
};

function isAcceptedFile(file: File, accept: string) {
  const acceptedTypes = accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (acceptedTypes.length === 0) {
    return true;
  }

  return acceptedTypes.some((accepted) => {
    if (accepted.startsWith(".")) {
      return file.name.toLowerCase().endsWith(accepted);
    }

    return file.type === accepted;
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(mimeType: string, filename: string) {
  const isPdf =
    mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

  return isPdf ? LuFileType2 : LuFileText;
}

function getFileType(mimeType: string, filename: string) {
  const isPdf =
    mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

  if (isPdf) return "PDF";

  const extension = filename.split(".").pop()?.toUpperCase();

  return extension || "Document";
}

export function FileUploadField({
  id,
  name = "doc",
  label,
  files,
  onChange,
  existingDocuments = [],
  onRequestDeleteDocument,
  accept = "",
  hint,
  required = false,
  disabled = false,
  hasError = false,
  maxFiles = 5,
  onError,
  uploadingFiles = [],
  uploadProgress = new Map(),
  variant = "large",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILE_SIZE_LABEL = "10 MB";

  const totalFiles = existingDocuments.length + files.length;
  const hasFile = totalFiles > 0;
  const dragActive = isDragActive && !disabled;

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (files.length === 0) {
      resetInput();
    }
  }, [files]);

  const showError = (message: string) => {
    onError?.(message);
  };

  const handleFiles = (selectedFiles: FileList | File[]) => {
    if (disabled) return;

    const incomingFiles = Array.from(selectedFiles);

    if (incomingFiles.length === 0) {
      return;
    }

    const acceptedFiles: File[] = [];

    for (const selectedFile of incomingFiles) {
      if (
        existingDocuments.length + files.length + acceptedFiles.length >=
        maxFiles
      ) {
        showError(`You can upload a maximum of ${maxFiles} files.`);
        break;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        showError(
          `"${selectedFile.name}" exceeds the maximum file size of ${MAX_FILE_SIZE_LABEL}.`,
        );
        continue;
      }

      if (!isAcceptedFile(selectedFile, accept)) {
        showError(`"${selectedFile.name}" is not an accepted file type.`);
        continue;
      }

      const alreadyExists = [...files, ...acceptedFiles].some(
        (file) =>
          file.name === selectedFile.name &&
          file.size === selectedFile.size &&
          file.lastModified === selectedFile.lastModified,
      );

      if (alreadyExists) {
        showError(`"${selectedFile.name}" has already been selected.`);
        continue;
      }

      acceptedFiles.push(selectedFile);
    }

    if (acceptedFiles.length > 0) {
      onChange([...files, ...acceptedFiles]);
    }

    resetInput();
  };

  const removeFile = (index: number) => {
    if (disabled) return;

    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (
      disabled ||
      (event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget))
    ) {
      return;
    }
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (disabled) return;

    handleFiles(event.dataTransfer.files);
  };

  const openFilePicker = () => {
    if (!disabled && totalFiles < maxFiles) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && " *"}
      </label>

      <div
        data-input-surface
        data-invalid={hasError || undefined}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || totalFiles >= maxFiles}
        aria-describedby={`${id}-requirements`}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={styles.input(
          hasError,
          disabled,
          dragActive,
          hasFile,
          variant,
        )}
      >
        <div
          className={`pointer-events-none flex items-center ${
            variant === "large"
              ? "min-h-32 flex-col justify-center gap-3 text-center"
              : "gap-3"
          }`}
        >
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors
            ${dragActive ? "animate-bounce" : ""}`}
          >
            <LuCloudUpload size={24} />
          </div>

          <div className="min-w-0">
            <h4
              className={`font-semibold ${
                variant === "large"
                  ? dragActive
                    ? "text-2xl"
                    : "text-base"
                  : dragActive
                    ? "text-base"
                    : "text-sm"
              } ${disabled ? "text-muted-foreground" : "text-foreground"}`}
            >
              {dragActive
                ? "Drop files here"
                : totalFiles >= maxFiles
                  ? "File limit reached"
                  : "Drop files here or click to browse"}
            </h4>

            {hint && !dragActive && (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
        </div>

        <Input
          ref={inputRef}
          type="file"
          id={id}
          name={name}
          accept={accept}
          hidden
          multiple
          required={required && totalFiles === 0}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            if (event.target.files) {
              handleFiles(event.target.files);
            }
          }}
        />
        {/* Existing uploaded files */}
        {existingDocuments.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {existingDocuments.map((document) => {
              const FileIcon = getFileIcon(
                document.mimeType,
                document.filename,
              );

              return (
                <div
                  key={document.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon
                      size={24}
                      className="shrink-0 text-muted-foreground"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {document.filename}
                      </p>

                      <p className="text-xs font-medium text-success">
                        {getFileType(document.mimeType, document.filename)} •{" "}
                        {formatFileSize(document.size)} • Uploaded
                      </p>
                    </div>
                  </div>

                  {!disabled && onRequestDeleteDocument && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRequestDeleteDocument(document);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      aria-label={`Remove ${document.filename}`}
                    >
                      <LuX size={18} animated />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.type, file.name);
              const isUploading = uploadingFiles.includes(file);
              const percentage = uploadProgress.get(file) ?? 0;

              return (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon
                      size={24}
                      className="shrink-0 text-muted-foreground"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {file.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {getFileType(file.type, file.name)} •{" "}
                        {formatFileSize(file.size)} •{" "}
                        {isUploading
                          ? percentage < 100
                            ? `Uploading ${percentage}%`
                            : "Upload complete. Verifying..."
                          : "Ready to upload"}
                      </p>
                      {isUploading && (
                        <div
                          role="progressbar"
                          aria-label={`Uploading ${file.name}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={percentage}
                          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                        >
                          <div
                            className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out animate-pulse"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile(index);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      aria-label={`Remove ${file.name}`}
                    >
                      <LuX size={18} animated />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p
          id={`${id}-requirements`}
          className="pointer-events-none mt-4 border-t border-border pt-3 text-xs text-muted-foreground"
        >
          {totalFiles}/{maxFiles} files selected • Maximum file size:{" "}
          {MAX_FILE_SIZE_LABEL}
          {accept && ` • Accepted file types: ${accept}`}
        </p>
      </div>
    </div>
  );
}
