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
}

const styles = {
  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground",

  input: (
    err: boolean,
    disabled: boolean,
    isDragActive: boolean,
    hasFile: boolean,
  ) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-border bg-secondary text-muted-foreground shadow-none"
      : err
        ? "border-destructive bg-destructive/10 text-foreground focus-within:ring-4 focus-within:ring-destructive/20"
        : isDragActive
          ? "border-ring bg-muted"
          : hasFile
            ? "border-ring bg-muted"
            : "border-border bg-muted hover:border-ring hover:bg-card";

    return `flex min-h-32 w-full cursor-default items-center gap-3 rounded-2xl border border-dashed px-5 py-5 text-sm transition duration-200 ${stateClass}`;
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
    if (disabled) return;

    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    setIsDragActive(false);

    handleFiles(event.dataTransfer.files);
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
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={styles.input(hasError, disabled, dragActive, hasFile)}
      >
        <LuCloudUpload
          size={36}
          className={`shrink-0 pointer-events-none ${
            disabled
              ? "text-muted-foreground"
              : dragActive || hasFile
                ? "text-muted-foreground"
                : "text-muted-foreground"
          }`}
        />

        <div className="min-w-0 flex-1 pointer-events-none">
          <h4
            className={`text-base font-semibold ${
              disabled ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {dragActive ? "Drop files here" : `Choose ${label.toLowerCase()}`}
          </h4>

          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            {totalFiles}/{maxFiles} files selected
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || totalFiles >= maxFiles}
          onClick={() => inputRef.current?.click()}
          className="shrink-0"
        >
          Choose files
        </Button>

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
          onChange={(event) => {
            if (event.target.files) {
              handleFiles(event.target.files);
            }
          }}
        />
      </div>

      {/* Existing uploaded files */}
      {existingDocuments.length > 0 && (
        <div className="mt-3 space-y-2">
          {existingDocuments.map((document) => {
            const FileIcon = getFileIcon(document.mimeType, document.filename);

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
                    onClick={() => onRequestDeleteDocument(document)}
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
        <div className="mt-3 space-y-2">
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
                          className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
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
                    onClick={() => removeFile(index)}
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

      <p className="mt-2 text-xs text-muted-foreground">
        Maximum file size: {MAX_FILE_SIZE_LABEL}
        {accept && ` • Accepted file types: ${accept}`}
      </p>
    </div>
  );
}
