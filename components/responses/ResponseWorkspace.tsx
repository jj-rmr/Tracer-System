"use client";

import { useCallback, useRef, useState } from "react";
import GraduateTracerForm from "@/components/forms/GraduateTracerForm";
import {
  FormResponseStatus,
  Survey,
  SurveyDocument,
  SurveyDocumentType,
} from "@/types";
import { LuLoaderCircle, LuPlus, LuTrash2 } from "react-icons/lu";
import { useRouter } from "next/navigation";
import FormModal from "@/components/ui/FormModal";
import Modal from "@/components/ui/Modal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/components/ui/Toast";
import { surveyToAnswers } from "@/lib/forms/graduate-tracer-adapter";
import { defaultSurvey } from "@/lib/surveys/defaults";
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
  responseStatus?: FormResponseStatus;
}

export default function ResponseWorkspace({
  survey,
  isNew,
  responseId,
  updatedAt,
  readOnly = false,
  studyId,
  responseStatus = "draft",
}: Props) {
  const [open, setOpen] = useState(false);
  const [showDraftCloseModal, setShowDraftCloseModal] = useState(false);
  const [showDeleteResponseModal, setShowDeleteResponseModal] = useState(false);
  const [draftCloseAction, setDraftCloseAction] = useState<
    "saving" | "discarding" | null
  >(null);
  const [currentSurvey, setCurrentSurvey] = useState(survey);
  const latestSurveyRef = useRef(survey);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const documentOperationsRef = useRef(new Set<Promise<unknown>>());
  const responseIdRef = useRef(responseId);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
  };

  const rememberLatestSurvey = useCallback((nextSurvey: Survey) => {
    latestSurveyRef.current = structuredClone(nextSurvey);
  }, []);

  function trackDocumentOperation<T>(operation: Promise<T>) {
    const tracked = operation.finally(() => {
      documentOperationsRef.current.delete(tracked);
    });
    documentOperationsRef.current.add(tracked);
    return tracked;
  }

  function enqueueStudySave(
    nextSurvey: Survey,
    status: FormResponseStatus,
  ): Promise<{ id: string; updatedAt?: string }> {
    if (!studyId) throw new Error("No active study is available.");
    const answers = surveyToAnswers(nextSurvey);

    const operation = saveQueueRef.current.then(async () => {
      const saveResponse = await fetch(`/api/studies/${studyId}/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          answers,
        }),
      });
      const result = await saveResponse.json();

      if (!saveResponse.ok || typeof result.data?.id !== "string") {
        throw new Error(result.message ?? "Failed to save the response.");
      }

      responseIdRef.current = result.data.id;
      return result.data as { id: string; updatedAt?: string };
    });

    saveQueueRef.current = operation.then(
      () => undefined,
      () => undefined,
    );

    return operation;
  }

  async function saveStudyDraft(nextSurvey: Survey) {
    const response = await enqueueStudySave(nextSurvey, "draft");
    setCurrentSurvey(structuredClone(nextSurvey));
    return response.updatedAt;
  }

  async function saveStudyResponse(
    nextSurvey: Survey,
    documents: { employment: File[]; awards: File[] },
  ) {
    const response = await enqueueStudySave(nextSurvey, "submitted");
    const uploadedDocuments: SurveyDocument[] = [];

    try {
      for (const file of documents.employment) {
        uploadedDocuments.push(
          await uploadFormResponseDocument(response.id, file, "employment"),
        );
      }
      for (const file of documents.awards) {
        uploadedDocuments.push(
          await uploadFormResponseDocument(response.id, file, "awards"),
        );
      }
    } catch (error) {
      await Promise.allSettled(
        uploadedDocuments.map((document) =>
          deleteFormResponseDocument(response.id, document.id),
        ),
      );
      throw error;
    }

    setCurrentSurvey(structuredClone(nextSurvey));
  }

  async function uploadStudyDocument(
    nextSurvey: Survey,
    file: File,
    documentType: SurveyDocumentType,
  ) {
    const id =
      responseIdRef.current ?? (await enqueueStudySave(nextSurvey, "draft")).id;
    const document = await trackDocumentOperation(
      uploadFormResponseDocument(id, file, documentType),
    );
    setCurrentSurvey((current) => ({
      ...current,
      documents: [...current.documents, document],
    }));
    return document;
  }

  async function deleteStudyDocument(documentId: string) {
    const id = responseIdRef.current;
    if (!id) throw new Error("The response has not been saved yet.");

    await trackDocumentOperation(deleteFormResponseDocument(id, documentId));
    setCurrentSurvey((current) => ({
      ...current,
      documents: current.documents.filter((item) => item.id !== documentId),
    }));
  }

  function requestDraftClose() {
    setShowDraftCloseModal(true);
  }

  async function saveDraftAndClose() {
    setDraftCloseAction("saving");
    try {
      await saveStudyDraft(latestSurveyRef.current);
      await Promise.allSettled([...documentOperationsRef.current]);
      setShowDraftCloseModal(false);
      setOpen(false);
      showToast({ message: "Draft saved.", type: "success" });
      router.refresh();
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to save draft.",
        type: "error",
      });
    } finally {
      setDraftCloseAction(null);
    }
  }

  async function discardDraft() {
    if (!studyId) {
      setShowDraftCloseModal(false);
      setOpen(false);
      return;
    }

    setDraftCloseAction("discarding");
    try {
      await saveQueueRef.current;
      await Promise.allSettled([...documentOperationsRef.current]);

      const response = await fetch(`/api/studies/${studyId}/response`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Failed to discard draft.");
      }

      responseIdRef.current = undefined;
      const clearedSurvey = {
        ...structuredClone(defaultSurvey),
        userId: survey.userId,
      };
      setCurrentSurvey(clearedSurvey);
      latestSurveyRef.current = structuredClone(clearedSurvey);
      saveQueueRef.current = Promise.resolve();
      documentOperationsRef.current.clear();
      setShowDraftCloseModal(false);
      setOpen(false);
      setShowDeleteResponseModal(false);
      showToast({
        message:
          responseStatus === "draft" ? "Draft discarded." : "Response deleted.",
        type: "success",
      });
      router.refresh();
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to discard draft.",
        type: "error",
      });
    } finally {
      setDraftCloseAction(null);
    }
  }

  const draftCloseDialog = (
    <Modal
      open={showDraftCloseModal}
      onClose={
        draftCloseAction ? () => undefined : () => setShowDraftCloseModal(false)
      }
      title="Close tracer form?"
      width="md"
      layer="nested"
      bodyClassName="p-6"
      showCloseButton={false}
    >
      <p className="text-sm leading-6 text-slate-500">
        Save your latest answers as a draft, continue editing, or permanently
        discard this form and its uploaded documents.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={draftCloseAction !== null}
          onClick={() => setShowDraftCloseModal(false)}
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 whitespace-nowrap hover:bg-slate-100 disabled:opacity-50"
        >
          Keep Editing
        </button>
        <button
          type="button"
          disabled={draftCloseAction !== null}
          onClick={() => void discardDraft()}
          className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white whitespace-nowrap hover:bg-rose-600 disabled:opacity-50"
        >
          {draftCloseAction === "discarding" ? (
            <LuLoaderCircle size={18} className="animate-spin" />
          ) : (
            <LuTrash2 size={18} />
          )}
        </button>
        <button
          type="button"
          disabled={draftCloseAction !== null}
          onClick={() => void saveDraftAndClose()}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap hover:bg-sky-700 disabled:opacity-50"
        >
          {draftCloseAction === "saving" ? "Saving..." : "Save as Draft"}
        </button>
      </div>
    </Modal>
  );

  if (isNew) {
    return (
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <h2 className="text-xl font-semibold text-slate-900">
          No Alumni Tracer Response Found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          You haven&apos;t submitted an Alumni Tracer Response yet. Click the
          button below to start answering the form.
        </p>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md"
        >
          <LuPlus size={16} />
          Add New Response
        </button>

        <FormModal
          open={open}
          onClose={() => setOpen(false)}
          onCloseRequest={requestDraftClose}
          title="New Tracer Response"
          width="xl"
          showCloseButton={responseStatus !== "draft"}
          confirmationDescription="Your response answers and selected documents will be discarded."
        >
          <GraduateTracerForm
            initialData={currentSurvey}
            isNew
            onSuccess={handleSuccess}
            onSave={studyId ? saveStudyResponse : undefined}
            onDraftSave={studyId ? saveStudyDraft : undefined}
            onInstantDocumentUpload={studyId ? uploadStudyDocument : undefined}
            onDeleteDocument={(document) => deleteStudyDocument(document.id)}
            onValuesChange={rememberLatestSurvey}
            onRequestClose={requestDraftClose}
          />
        </FormModal>
        {draftCloseDialog}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full flex flex-col items-center relative">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <div className="flex flex-col gap-2 lg:flex-row justify-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase text-slate-500">Response ID</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  responseStatus === "draft"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {responseStatus}
              </span>
            </div>
            <p className="mt-1 font-medium text-sm">{responseId}</p>
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

            <div className="flex w-full items-center gap-2 lg:w-auto">
              <button
                onClick={() => setOpen(true)}
                disabled={open}
                className="w-full rounded-2xl bg-sky-600 px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-slate-300"
              >
                {readOnly ? "View" : "Edit"} Form
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setShowDeleteResponseModal(true)}
                  aria-label="Delete response"
                  title="Delete response"
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-rose-100 p-3 text-rose-600 transition-colors hover:bg-rose-200 focus:outline-none focus:ring-4 focus:ring-rose-100"
                >
                  <LuTrash2 aria-hidden="true" size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {readOnly ? (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="View Tracer Response"
          width="xl"
        >
          <GraduateTracerForm
            initialData={currentSurvey}
            isNew={false}
            onSuccess={handleSuccess}
            readOnly
          />
        </Modal>
      ) : (
        <FormModal
          open={open}
          onClose={() => setOpen(false)}
          onCloseRequest={
            responseStatus === "draft" ? requestDraftClose : undefined
          }
          title="Edit Tracer Response"
          width="xl"
          showCloseButton={responseStatus !== "draft"}
          confirmationDescription="Any modifications to this response and newly selected documents will be discarded."
        >
          <GraduateTracerForm
            initialData={currentSurvey}
            isNew={false}
            onSuccess={handleSuccess}
            onSave={studyId ? saveStudyResponse : undefined}
            onDraftSave={
              studyId && responseStatus === "draft" ? saveStudyDraft : undefined
            }
            onInstantDocumentUpload={studyId ? uploadStudyDocument : undefined}
            initialSavedAt={updatedAt}
            onDeleteDocument={
              studyId
                ? (document) => deleteStudyDocument(document.id)
                : undefined
            }
            onValuesChange={rememberLatestSurvey}
            onRequestClose={
              responseStatus === "draft" ? requestDraftClose : undefined
            }
          />
        </FormModal>
      )}
      {draftCloseDialog}
      <ConfirmationDialog
        open={showDeleteResponseModal}
        onClose={() => setShowDeleteResponseModal(false)}
        onConfirm={() => void discardDraft()}
        title="Delete response?"
        description="This response and its uploaded documents will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Response"
        busy={draftCloseAction === "discarding"}
        tone="danger"
        showCloseButton={false}
      />
    </div>
  );
}
