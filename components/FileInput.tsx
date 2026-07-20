"use client";

import { SurveyDocument } from "@/types/survey-document";
import { useEffect, useRef, useState } from "react";
import { LuCloudUpload, LuFileText, LuFileType2, LuX } from "react-icons/lu";

interface FileInputProps {
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
}

const styles = {
  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600",

  input: (
    err: boolean,
    disabled: boolean,
    isDragActive: boolean,
    hasFile: boolean,
  ) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 shadow-none"
      : isDragActive
        ? "border-sky-400 bg-sky-50"
        : hasFile
          ? "border-sky-400 bg-sky-50"
          : "border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-white";

    return `flex min-h-32 w-full cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-5 py-5 text-sm transition duration-200 ${
      err && !disabled ? "border-rose-400 focus:ring-4 focus:ring-rose-100" : ""
    } ${stateClass}`;
  },

  removeButton:
    "shrink-0 rounded-xl p-2 text-slate-400 transition duration-200 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100",
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

export function FileInput({
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
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILE_SIZE_LABEL = "10 MB";

  const totalFiles = existingDocuments.length + files.length;
  const hasFile = totalFiles > 0;

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

  useEffect(() => {
    if (disabled) {
      setIsDragActive(false);
    }
  }, [disabled]);

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

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    if (disabled) return;

    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    if (disabled) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    if (disabled) return;

    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
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

      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={styles.input(hasError, disabled, isDragActive, hasFile)}
      >
        <LuCloudUpload
          size={36}
          className={`shrink-0 ${
            disabled
              ? "text-slate-400"
              : isDragActive || hasFile
                ? "text-sky-500"
                : "text-slate-400"
          }`}
        />

        <div className="min-w-0 flex-1">
          <h4
            className={`text-base font-semibold ${
              disabled ? "text-slate-500" : "text-slate-900"
            }`}
          >
            {isDragActive ? "Drop files here" : `Choose ${label.toLowerCase()}`}
          </h4>

          {hint && <span className="text-xs text-slate-400">{hint}</span>}

          <p className="mt-1 text-xs text-slate-400">
            {totalFiles}/{maxFiles} files selected
          </p>
        </div>

        <input
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
      </label>

      {/* Existing uploaded files */}
      {existingDocuments.length > 0 && (
        <div className="mt-3 space-y-2">
          {existingDocuments.map((document) => {
            const FileIcon = getFileIcon(document.mimeType, document.filename);

            return (
              <div
                key={document.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileIcon size={24} className="shrink-0 text-sky-500" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {document.filename}
                    </p>

                    <p className="text-xs font-medium text-emerald-600">
                      {getFileType(document.mimeType, document.filename)} •{" "}
                      {formatFileSize(document.size)} • Uploaded
                    </p>
                  </div>
                </div>

                {!disabled && onRequestDeleteDocument && (
                  <button
                    type="button"
                    onClick={() => onRequestDeleteDocument(document)}
                    className={styles.removeButton}
                    aria-label={`Remove ${document.filename}`}
                  >
                    <LuX size={18} />
                  </button>
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

            return (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileIcon size={24} className="shrink-0 text-sky-500" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {file.name}
                    </p>

                    <p className="text-xs text-sky-600">
                      {getFileType(file.type, file.name)} •{" "}
                      {formatFileSize(file.size)} • Ready to upload
                    </p>
                  </div>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className={styles.removeButton}
                    aria-label={`Remove ${file.name}`}
                  >
                    <LuX size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-400">
        Maximum file size: {MAX_FILE_SIZE_LABEL}
        {accept && ` • Accepted file types: ${accept}`}
      </p>
    </div>
  );
}
