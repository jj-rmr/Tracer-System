"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { SelectField } from "@/components/forms/SelectField";
import GraduateTracerForm, {
  PendingSurveyDocuments,
} from "@/components/forms/GraduateTracerForm";
import { surveyToAnswers } from "@/lib/forms/graduate-tracer-adapter";
import { defaultSurvey } from "@/lib/surveys/defaults";
import { StudyPeriod, Survey } from "@/types";

interface ManualResponseEntryProps {
  studies: StudyPeriod[];
  onComplete?: () => void;
}

export default function ManualResponseEntry({
  studies,
  onComplete,
}: ManualResponseEntryProps) {
  const router = useRouter();
  const [studyId, setStudyId] = useState(studies[0]?.id ?? "");
  const [respondentEmail, setRespondentEmail] = useState("");
  const importTokenRef = useRef<string | null>(null);
  const uploadKeysRef = useRef(new WeakMap<File, string>());

  function getUploadKey(file: File) {
    const existingKey = uploadKeysRef.current.get(file);

    if (existingKey) return existingKey;

    const uploadKey = crypto.randomUUID();
    uploadKeysRef.current.set(file, uploadKey);
    return uploadKey;
  }

  async function saveManualResponse(
    survey: Survey,
    documents: PendingSurveyDocuments,
  ) {
    if (!studyId) {
      throw new Error("Select a study period before saving the response.");
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

    const importToken = importTokenRef.current ?? crypto.randomUUID();
    importTokenRef.current = importToken;
    let responseId: string | null = null;

    try {
      const response = await fetch(
        `/api/admin/studies/${studyId}/responses/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            respondentName,
            respondentEmail,
            answers: surveyToAnswers(survey),
            importToken,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Failed to add manual response.");
      }

      responseId = result.data?.id;
      if (typeof responseId !== "string") {
        throw new Error("The manual response was saved without a response ID.");
      }

      const uploads = [
        ...documents.employment.map((file) => ({
          file,
          type: "employment",
          uploadKey: getUploadKey(file),
        })),
        ...documents.awards.map((file) => ({
          file,
          type: "awards",
          uploadKey: getUploadKey(file),
        })),
      ];

      for (const upload of uploads) {
        const formData = new FormData();
        formData.set("file", upload.file);
        formData.set("documentType", upload.type);
        formData.set("uploadKey", upload.uploadKey);

        const uploadResponse = await fetch(
          `/api/form-responses/${responseId}/documents`,
          { method: "POST", body: formData },
        );
        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.message ?? `Failed to upload ${upload.file.name}.`,
          );
        }
      }

      const completionResponse = await fetch(
        `/api/admin/responses/${responseId}/import`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            uploadKeys: uploads.map((upload) => upload.uploadKey),
          }),
        },
      );
      const completionResult = await completionResponse.json();

      if (!completionResponse.ok) {
        throw new Error(
          completionResult.message ?? "Failed to complete the manual import.",
        );
      }

      importTokenRef.current = null;
      uploadKeysRef.current = new WeakMap<File, string>();
    } catch (error) {
      if (responseId) {
        await fetch(`/api/admin/responses/${responseId}/import`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "failed" }),
        }).catch(() => undefined);
      }

      throw error;
    }
  }

  if (studies.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Create a non-archived Graduate Tracer v1 study period before importing
        historical responses.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Import details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Record where this historical response belongs.
        </p>
        <p className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
          All response fields and supporting document uploads are optional for
          manual imports. Required markers only reflect the original alumni
          survey.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SelectField
            id="studyId"
            label="Study period *"
            value={studyId}
            onChange={setStudyId}
            options={studies.map((study) => ({
              value: study.id,
              label: `${study.academicYear} — ${study.title} (${study.status})`,
            }))}
            required
          />

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Respondent email
            </span>
            <input
              type="email"
              value={respondentEmail}
              onChange={(event) => setRespondentEmail(event.target.value)}
              placeholder="Optional"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-sm px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
          </label>
        </div>
      </section>

      <GraduateTracerForm
        initialData={{ ...defaultSurvey }}
        isNew
        requireResponses={false}
        submitLabel="Add Manual Response"
        onSave={saveManualResponse}
        onSuccess={() => {
          if (onComplete) onComplete();
          else router.push("/admin/responses");
        }}
      />
    </div>
  );
}
