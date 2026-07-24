"use client";

import { useState } from "react";
import GraduateTracerForm from "@/components/forms/GraduateTracerForm";
import { Survey } from "@/types";
import { LuPlus } from "react-icons/lu";
import FormModal from "@/components/ui/FormModal";
import Modal from "@/components/ui/Modal";
import { surveyToAnswers } from "@/lib/forms/graduate-tracer-adapter";
import {
  deleteFormResponseDocument,
  uploadFormResponseDocument,
} from "@/lib/api/form-response-documents";

interface Props {
  survey: Survey;
  isNew: boolean;
  responseId?: string;
  updatedAt?: string;
  readOnly: boolean;
  studyId?: string;
}

export default function ResponseWorkspace({
  survey,
  isNew,
  responseId,
  updatedAt,
  readOnly = false,
  studyId,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  async function saveStudyResponse(
    nextSurvey: Survey,
    documents: { employment: File[]; awards: File[] },
  ) {
    if (!studyId) throw new Error("No active study is available.");

    const saveResponse = await fetch(`/api/studies/${studyId}/response`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "submitted",
        answers: surveyToAnswers(nextSurvey),
      }),
    });
    const result = await saveResponse.json();

    if (!saveResponse.ok || typeof result.data?.id !== "string") {
      throw new Error(result.message ?? "Failed to save the response.");
    }

    await Promise.all([
      ...documents.employment.map((file) =>
        uploadFormResponseDocument(result.data.id, file, "employment"),
      ),
      ...documents.awards.map((file) =>
        uploadFormResponseDocument(result.data.id, file, "awards"),
      ),
    ]);
  }

  if (isNew) {
    return (
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <h2 className="text-xl font-semibold text-slate-900">
          No Alumni Tracer Survey Found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          You haven&apos;t submitted an Alumni Tracer Survey yet. Click the button
          below to start answering the form.
        </p>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md"
        >
          <LuPlus size={16} />
          Add New Survey
        </button>

        <FormModal
          open={open}
          onClose={() => setOpen(false)}
          title="New Tracer Survey"
          width="xl"
          confirmationDescription="Your survey answers and selected documents will be discarded."
        >
          <GraduateTracerForm
            initialData={survey}
            isNew
            onSuccess={handleSuccess}
            onSave={studyId ? saveStudyResponse : undefined}
          />
        </FormModal>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full flex flex-col items-center relative">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <div className="flex flex-col gap-2 lg:flex-row justify-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Response ID</p>
            <p className="font-medium text-sm">{responseId}</p>
          </div>
          <div className="flex flex-col-reverse items-center justify-center lg:flex-row gap-4">
            <div className="text-left md:text-right inline-flex items-center gap-4 text-xs font-semibold tracking-wider uppercase">
              <div className=" text-slate-400 divide-x-2 inline-flex text-[10px] md:text-xs">
                <p className="pr-2">Updated</p>
                <p className="pl-2 whitespace-nowrap">
                  {updatedAt
                    ? new Date(updatedAt).toLocaleString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "-"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(true)}
              disabled={open}
              className="w-full rounded-2xl bg-sky-600 px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-slate-300"
            >
              {readOnly ? "View" : "Edit"} Form
            </button>
          </div>
        </div>
      </div>

      {readOnly ? (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="View Tracer Survey"
          width="xl"
        >
          <GraduateTracerForm
            initialData={survey}
            isNew={false}
            onSuccess={handleSuccess}
            readOnly
          />
        </Modal>
      ) : (
        <FormModal
          open={open}
          onClose={() => setOpen(false)}
          title="Edit Tracer Survey"
          width="xl"
          confirmationDescription="Any modifications to this survey and newly selected documents will be discarded."
        >
          <GraduateTracerForm
            initialData={survey}
            isNew={false}
            onSuccess={handleSuccess}
            onSave={studyId ? saveStudyResponse : undefined}
            onDeleteDocument={
              studyId
                ? (document) =>
                    deleteFormResponseDocument(survey.id, document.id)
                : undefined
            }
          />
        </FormModal>
      )}
    </div>
  );
}
