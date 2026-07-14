"use client";

import { useState } from "react";
import SurveyForm from "./SurveyForm";
import { Survey } from "@/types/survey";

interface Props {
  survey: Survey;
  isNew: boolean;
  surveyId?: string;
  updatedAt?: string;
}

export default function SurveyContainer({
  survey,
  isNew,
  surveyId,
  updatedAt,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleConfirmCancel = () => {
    setOpen(false);
    setShowCancelModal(false); // Close the confirmation modal
  };

  if (isNew) {
    return (
      <div className="space-y-6">
        {!open ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg shadow-sky-100">
            <h2 className="text-xl font-semibold">Tracer Survey</h2>
            <p className="mt-2 text-sm text-slate-500">
              You haven't submitted your tracer survey yet.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-6 rounded-lg bg-sky-600 px-5 py-2 text-white hover:bg-sky-700"
            >
              Create Survey
            </button>
          </div>
        ) : (
          <SurveyForm initialData={survey} isNew onSuccess={handleSuccess} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full flex flex-col items-center relative">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-5 text-left shadow-lg shadow-sky-100">
        <div className="flex flex-col gap-2 lg:flex-row justify-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Survey ID</p>
            <p className="font-medium text-sm">{surveyId}</p>
          </div>
          <div className="flex flex-col-reverse items-center justify-center lg:flex-row gap-4">
            <div className="text-left md:text-right inline-flex items-center gap-4 text-xs font-semibold tracking-wider uppercase">
              <div className=" text-slate-400 divide-x-2 inline-flex">
                <p className="pr-2">Updated</p>
                <p className="pl-2 whitespace-nowrap">
                  {updatedAt
                    ? new Date(updatedAt).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
            {open ? (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 whitespace-nowrap bg-red-500 text-white w-full text-sm rounded-xl font-semibold cursor-pointer hover:bg-red-700 transition-colors duration-300"
              >
                Cancel Changes
              </button>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 whitespace-nowrap bg-sky-500 text-white w-full text-sm rounded-xl font-semibold cursor-pointer hover:bg-sky-700 transition-colors duration-300"
              >
                Edit Form
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <SurveyForm
          initialData={survey}
          isNew={false}
          onSuccess={handleSuccess}
        />
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Discard unsaved changes?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to cancel? Any modifications you made to
              this survey form will be permanently lost.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-700 transition-colors"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
