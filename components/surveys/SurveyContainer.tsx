"use client";

import { useState } from "react";
import SurveyForm from "./SurveyForm";
import { Survey } from "@/types/survey";
import ScrollProvider from "@/components/ScrollProvider";
import { LuPlus, LuX } from "react-icons/lu";

interface Props {
  survey: Survey;
  isNew: boolean;
  surveyId?: string;
  updatedAt?: string;
  readOnly: boolean;
}

export default function SurveyContainer({
  survey,
  isNew,
  surveyId,
  updatedAt,
  readOnly = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleConfirmCancel = () => {
    setOpen(false);
    setShowCancelModal(false);
  };

  if (isNew) {
    return (
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <h2 className="text-xl font-semibold text-slate-900">
          No Alumni Tracer Survey Found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          You haven't submitted an Alumni Tracer Survey yet. Click the button
          below to start answering the form.
        </p>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md"
        >
          <LuPlus size={16} />
          Add New Survey
        </button>

        {open && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
            <div className="flex h-full w-full items-center justify-center p-6">
              <div className="relative h-[95svh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-sky-100 px-6 py-4">
                  <h2 className="text-lg font-semibold">New Tracer Survey</h2>

                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-200"
                  >
                    <LuX size={24} />
                  </button>
                </div>

                <ScrollProvider className="h-[calc(95vh-73px)] overflow-y-auto p-6">
                  <SurveyForm
                    initialData={survey}
                    isNew={true}
                    onSuccess={handleSuccess}
                  />
                </ScrollProvider>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full flex flex-col items-center relative">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <div className="flex flex-col gap-2 lg:flex-row justify-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Survey ID</p>
            <p className="font-medium text-sm">{surveyId}</p>
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

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="flex h-full w-full items-center justify-center p-6">
            <div className="relative h-[95vh] w-fit overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold">Edit Tracer Survey</h2>

                <button
                  onClick={() => {
                    readOnly ? setOpen(false) : setShowCancelModal(true);
                  }}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-200"
                >
                  <LuX size={24} />
                </button>
              </div>
              <ScrollProvider className="h-[calc(95vh-73px)] w-5xl max-w-full overflow-y-auto p-6">
                <SurveyForm
                  initialData={survey}
                  isNew={false}
                  onSuccess={handleSuccess}
                  readOnly={readOnly}
                />
              </ScrollProvider>
            </div>
          </div>
        </div>
      )}

      {!readOnly && showCancelModal && (
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
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
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
