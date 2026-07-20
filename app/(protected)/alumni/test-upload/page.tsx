"use client";

import { useState } from "react";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setLoading(true);
    setMessage("Uploading...");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/alumni/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed.");
      }

      setMessage(`Successfully uploaded: ${result.document.filename}`);

      console.log("UPLOADED DOCUMENT:", result.document);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">Test Document Upload</h1>

        <input
          type="file"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
          }}
        />

        {file && <p>Selected: {file.name}</p>}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className="rounded bg-sky-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
