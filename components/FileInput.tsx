"use client";

import { useEffect, useRef, useState } from "react";
import { LuCloudUpload, LuX } from "react-icons/lu";

interface FileInputProps {
  id: string;
  name?: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

const styles = {
  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600",

  input: (
    err: boolean,
    disabled: boolean,
    isDragActive: boolean,
    file: File | null,
  ) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 shadow-none"
      : isDragActive
        ? "border-sky-400 bg-sky-50"
        : file
          ? "border-sky-400 bg-sky-50"
          : "border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-white";

    return `flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-3 text-sm transition duration-200 ${
      err && !disabled ? "border-rose-400 focus:ring-4 focus:ring-rose-100" : ""
    } ${stateClass}`;
  },

  removeButton:
    "rounded-xl p-2 text-slate-400 transition duration-200 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100",
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

export function FileInput({
  id,
  name = "doc",
  label,
  file,
  onChange,
  accept = "",
  hint,
  required = false,
  disabled = false,
  hasError = false,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILE_SIZE_LABEL = "10 MB";

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!file) {
      resetInput();
    }
  }, [file]);

  useEffect(() => {
    if (disabled) {
      setIsDragActive(false);
    }
  }, [disabled]);

  const handleFile = (selectedFile: File | null) => {
    if (disabled) return;

    if (!selectedFile) {
      resetInput();
      onChange(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      resetInput();
      onChange(null);
      return;
    }

    if (!isAcceptedFile(selectedFile, accept)) {
      resetInput();
      onChange(null);
      return;
    }

    onChange(selectedFile);
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

    const droppedFile = event.dataTransfer.files?.[0] || null;
    handleFile(droppedFile);
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
        className={styles.input(hasError, disabled, isDragActive, file)}
      >
        <LuCloudUpload
          size={28}
          className={`shrink-0 ${
            disabled
              ? "text-slate-400"
              : file || isDragActive
                ? "text-sky-500"
                : "text-slate-400"
          }`}
        />

        <div className="min-w-0 flex-1">
          <h4
            className={`truncate text-sm font-semibold ${
              disabled ? "text-slate-500" : "text-slate-900"
            }`}
          >
            {file ? file.name : `Choose ${label.toLowerCase()}`}
          </h4>

          {!file && hint && (
            <span
              className={`text-xs ${
                disabled ? "text-slate-400" : "text-slate-400"
              }`}
            >
              {isDragActive ? "Drop the document here" : hint}
            </span>
          )}
        </div>

        {file && !disabled && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleFile(null);
            }}
            className={styles.removeButton}
            aria-label={`Remove ${file.name}`}
          >
            <LuX size={18} />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          id={id}
          name={name}
          accept={accept}
          hidden
          required={required}
          disabled={disabled}
          onChange={(event) => handleFile(event.target.files?.[0] || null)}
        />
      </label>
      <p className="mt-2 text-xs text-slate-400">
        Maximum file size: {MAX_FILE_SIZE_LABEL}
        {accept && ` • Accepted file types: ${accept}`}
      </p>
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState, type DragEvent } from "react";
// import { LuCloudUpload, LuX } from "react-icons/lu";

// interface FileInputProps {
//   id: string;
//   name?: string;
//   label: string;
//   file: File | null;
//   onChange: (file: File | null) => void;
//   accept?: string;
//   hint?: string;
//   required?: boolean;
// }

// function isAcceptedFile(file: File, accept: string) {
//   const acceptedTypes = accept
//     .split(",")
//     .map((item) => item.trim().toLowerCase())
//     .filter(Boolean);

//   if (acceptedTypes.length === 0) {
//     return true;
//   }

//   return acceptedTypes.some((accepted) => {
//     if (accepted.startsWith(".")) {
//       return file.name.toLowerCase().endsWith(accepted);
//     }
//     return file.type === accepted;
//   });
// }

// export function FileInput({
//   id,
//   name = "doc",
//   label,
//   file,
//   onChange,
//   accept = "",
//   hint,
//   required = false,
// }: FileInputProps) {
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [isDragActive, setIsDragActive] = useState(false);

//   const resetInput = () => {
//     if (inputRef.current) {
//       inputRef.current.value = "";
//     }
//   };

//   useEffect(() => {
//     if (!file) {
//       resetInput();
//     }
//   }, [file]);

//   const handleFile = (selectedFile: File | null) => {
//     if (!selectedFile) {
//       resetInput();
//       onChange(null);
//       return;
//     }

//     if (!isAcceptedFile(selectedFile, accept)) {
//       return;
//     }

//     onChange(selectedFile);
//   };

//   const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
//     event.preventDefault();
//     setIsDragActive(true);
//   };

//   const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = "copy";
//     setIsDragActive(true);
//   };

//   const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
//     event.preventDefault();
//     setIsDragActive(false);
//   };

//   const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
//     event.preventDefault();
//     setIsDragActive(false);
//     const droppedFile = event.dataTransfer.files?.[0] || null;
//     handleFile(droppedFile);
//   };

//   return (
//     <div className="relative flex flex-col gap-1 w-full">
//       <label
//         htmlFor={id}
//         onDragEnter={handleDragEnter}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         className={`overflow-hidden flex flex-col md:flex-row items-center p-4 gap-3 rounded-3xl border border-dashed transition-[colors, transform] duration-300 cursor-pointer  ${
//           isDragActive
//             ? "border-sky-400 bg-sky-50"
//             : file
//             ? "border-solid bg-sky-100 border-sky-400 text-sky-400"
//             : "border-sky-200 text-foreground/50 hover:border-sky-400 hover:bg-sky-100 active:border-sky-400 active:bg-sky-100 active:scale-95"
//         }`}
//       >
//         <LuCloudUpload
//           size={32}
//           className={`pointer-events-none shrink-0 ${
//             file || isDragActive ? "text-sky-400" : "text-foreground opacity-50"
//           }`}
//         />
//         <div className="pointer-events-none">
//           <h4 className="text-sm md:text-base font-semibold">
//             {file ? file.name : label}
//           </h4>
//           <span className={`text-xs md:text-sm ${file ? "hidden" : ""}`}>
//             {isDragActive ? "Drop the document here" : hint}
//           </span>
//         </div>
//         <input
//           ref={inputRef}
//           type="file"
//           id={id}
//           name={name}
//           accept={accept}
//           hidden
//           required={required}
//           onChange={(event) => handleFile(event.target.files?.[0] || null)}
//         />
//       </label>
//       <button
//         className={`absolute top-3 right-3 md:top-1/2 md:-translate-y-1/2 p-1 rounded-lg text-sky-400 hover:bg-sky-100 transition-colors duration-300 cursor-pointer ${
//           file ? "" : "hidden"
//         }`}
//         type="button"
//         onClick={() => handleFile(null)}
//       >
//         <LuX className="shrink-0 size-4 " />
//       </button>
//     </div>
//   );
// }
