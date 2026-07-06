"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
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
}

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
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

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

  const handleFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      resetInput();
      onChange(null);
      return;
    }

    if (!isAcceptedFile(selectedFile, accept)) {
      return;
    }

    onChange(selectedFile);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0] || null;
    handleFile(droppedFile);
  };

  return (
    <div className="relative flex flex-col gap-1 w-full">
      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`overflow-hidden flex flex-col md:flex-row items-center p-4 gap-3 rounded-3xl border border-dashed transition-[colors, transform] duration-300 cursor-pointer  ${
          isDragActive
            ? "border-sky-400 bg-sky-50"
            : file
            ? "border-solid bg-sky-100 border-sky-400 text-sky-400"
            : "border-sky-200 text-foreground/50 hover:border-sky-400 hover:bg-sky-100 active:border-sky-400 active:bg-sky-100 active:scale-95"
        }`}
      >
        <LuCloudUpload
          size={32}
          className={`pointer-events-none shrink-0 ${
            file || isDragActive ? "text-sky-400" : "text-foreground opacity-50"
          }`}
        />
        <div className="pointer-events-none">
          <h4 className="text-sm md:text-base font-semibold">
            {file ? file.name : label}
          </h4>
          <span className={`text-xs md:text-sm ${file ? "hidden" : ""}`}>
            {isDragActive ? "Drop the document here" : hint}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          id={id}
          name={name}
          accept={accept}
          hidden
          required={required}
          onChange={(event) => handleFile(event.target.files?.[0] || null)}
        />
      </label>
      <button
        className={`absolute top-3 right-3 md:top-1/2 md:-translate-y-1/2 p-1 rounded-lg text-sky-400 hover:bg-sky-100 transition-colors duration-300 cursor-pointer ${
          file ? "" : "hidden"
        }`}
        type="button"
        onClick={() => handleFile(null)}
      >
        <LuX className="shrink-0 size-4 " />
      </button>
    </div>
  );
}
