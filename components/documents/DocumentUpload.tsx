"use client";

import { useState } from "react";
import { uploadDocument } from "@/lib/api/documents";
import { SurveyDocument } from "@/types";

interface DocumentUploadProps {
  onUploaded?: (document: SurveyDocument) => void;
}

export default function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const document = await uploadDocument(file);

      onUploaded?.(document);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" disabled={uploading} onChange={handleUpload} />

      {uploading && <p>Uploading...</p>}
    </div>
  );
}
