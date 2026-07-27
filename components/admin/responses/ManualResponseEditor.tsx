"use client";

import { Input } from "@/components/ui/input";

import { useRef, useState } from "react";

import GraduateTracerForm, {
  type PendingSurveyDocuments,
} from "@/components/forms/GraduateTracerForm";
import { surveyToAnswers } from "@/lib/forms/graduate-tracer-adapter";
import { uploadFormResponseDocument } from "@/lib/api/form-response-documents";
import type { Survey, SurveyDocument, SurveyDocumentType } from "@/types";

interface ManualResponseEditorProps {
  responseId: string;
  initialData: Survey;
  initialRespondentEmail: string;
  onComplete: () => void;
}

export default function ManualResponseEditor({
  responseId,
  initialData,
  initialRespondentEmail,
  onComplete,
}: ManualResponseEditorProps) {
  const [respondentEmail, setRespondentEmail] = useState(
    initialRespondentEmail,
  );
  const uploadKeysRef = useRef(new WeakMap<File, string>());

  function getUploadKey(file: File) {
    const existing = uploadKeysRef.current.get(file);
    if (existing) return existing;
    const key = crypto.randomUUID();
    uploadKeysRef.current.set(file, key);
    return key;
  }

  async function uploadDocument(
    _response: Survey,
    file: File,
    documentType: SurveyDocumentType,
    onProgress: (percentage: number) => void = () => undefined,
  ) {
    return uploadFormResponseDocument(responseId, file, documentType, {
      onProgress,
      uploadKey: getUploadKey(file),
    });
  }

  async function deleteDocument(document: SurveyDocument) {
    const response = await fetch(
      `/api/form-responses/${responseId}/documents/${document.id}`,
      { method: "DELETE" },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message ?? "Failed to delete the document.");
    }
  }

  async function saveResponse(
    survey: Survey,
    pendingDocuments: PendingSurveyDocuments,
  ) {
    for (const [documentType, files] of [
      ["employment", pendingDocuments.employment],
      ["awards", pendingDocuments.awards],
    ] as const) {
      for (const file of files) {
        await uploadDocument(survey, file, documentType);
      }
    }

    const respondentName = [
      survey.firstName,
      survey.middleName,
      survey.lastName,
      survey.extensionName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    const response = await fetch(`/api/admin/responses/${responseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        respondentName,
        respondentEmail,
        answers: surveyToAnswers(survey),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message ?? "Failed to edit the manual response.");
    }
  }

  return (
    <div className="space-y-6">
      <label className="block space-y-2 text-sm font-medium text-foreground">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Respondent email
        </span>
        <Input
          type="email"
          value={respondentEmail}
          onChange={(event) => setRespondentEmail(event.target.value)}
          placeholder="Optional"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/30"
        />
      </label>
      <GraduateTracerForm
        initialData={initialData}
        isNew={false}
        requireResponses={false}
        submitLabel="Save Changes"
        onInstantDocumentUpload={uploadDocument}
        onDeleteDocument={deleteDocument}
        onSave={saveResponse}
        onSuccess={onComplete}
      />
    </div>
  );
}
