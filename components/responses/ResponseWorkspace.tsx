"use client";

import { Button } from "@/components/ui/button";

import { useCallback, useRef, useState } from "react";
import GraduateTracerForm from "@/components/forms/GraduateTracerForm";
import ReadOnlyResponseDetails, {
  TracerResponseModalHeader,
} from "@/components/responses/ReadOnlyResponseDetails";
import {
  FormResponseStatus,
  Survey,
  SurveyDocument,
  SurveyDocumentType,
} from "@/types";
import { LuPlus, LuTrash2 } from "@/components/ui/icons";
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
import { friendlyRequestMessage, readApiJson } from "@/lib/api/client-errors";

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
  const [formDirty, setFormDirty] = useState(false);
  const [showDeleteResponseModal, setShowDeleteResponseModal] = useState(false);
  const [confirmingDraftClose, setConfirmingDraftClose] = useState(false);
  const [draftCloseAction, setDraftCloseAction] = useState<
    "saving" | "discarding" | null
  >(null);
  const [currentSurvey, setCurrentSurvey] = useState(survey);
  const latestSurveyRef = useRef(survey);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingDraftRef = useRef<{
    survey: Survey;
    waiters: Array<{
      resolve: (value: { id: string; updatedAt?: string }) => void;
      reject: (reason?: unknown) => void;
    }>;
  } | null>(null);
  const draftDrainScheduledRef = useRef(false);
  const documentOperationsRef = useRef(new Set<Promise<unknown>>());
  const responseIdRef = useRef(responseId);
  const updatedAtRef = useRef(updatedAt);
  const refreshAfterModalExitRef = useRef(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSuccess = () => {
    refreshAfterModalExitRef.current = true;
    setOpen(false);
  };

  function handleModalExitComplete() {
    if (!refreshAfterModalExitRef.current) return;
    refreshAfterModalExitRef.current = false;
    router.refresh();
  }

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

  async function sendStudySave(
    nextSurvey: Survey,
    status: FormResponseStatus,
  ): Promise<{ id: string; updatedAt?: string }> {
    if (!studyId) throw new Error("No active study is available.");
    const answers = surveyToAnswers(nextSurvey);
    const saveResponse = await fetch(`/api/studies/${studyId}/response`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        answers,
        expectedUpdatedAt: updatedAtRef.current,
      }),
    });
    const result = await readApiJson<{
      data?: { id?: string; updatedAt?: string };
    }>(saveResponse, "Your draft could not be saved.");

    if (typeof result.data?.id !== "string") {
      throw new Error("Your draft could not be saved.");
    }

    responseIdRef.current = result.data.id;
    updatedAtRef.current = result.data.updatedAt;
    return result.data as { id: string; updatedAt?: string };
  }

  function queueSerializedSave(nextSurvey: Survey, status: FormResponseStatus) {
    const operation = saveQueueRef.current.then(() =>
      sendStudySave(nextSurvey, status),
    );

    saveQueueRef.current = operation.then(
      () => undefined,
      () => undefined,
    );

    return operation;
  }

  function drainLatestDraft() {
    draftDrainScheduledRef.current = false;
    const pending = pendingDraftRef.current;
    pendingDraftRef.current = null;
    if (!pending) return;

    void queueSerializedSave(pending.survey, "draft").then(
      (result) => pending.waiters.forEach(({ resolve }) => resolve(result)),
      (error) => pending.waiters.forEach(({ reject }) => reject(error)),
    );
  }

  function enqueueStudySave(
    nextSurvey: Survey,
    status: FormResponseStatus,
  ): Promise<{ id: string; updatedAt?: string }> {
    if (status === "submitted") {
      const pending = pendingDraftRef.current;
      pendingDraftRef.current = null;
      const submission = queueSerializedSave(nextSurvey, status);
      if (pending) {
        void submission.then(
          (result) => pending.waiters.forEach(({ resolve }) => resolve(result)),
          (error) => pending.waiters.forEach(({ reject }) => reject(error)),
        );
      }
      return submission;
    }

    return new Promise((resolve, reject) => {
      const pending = pendingDraftRef.current;
      pendingDraftRef.current = {
        survey: structuredClone(nextSurvey),
        waiters: [...(pending?.waiters ?? []), { resolve, reject }],
      };
      if (!draftDrainScheduledRef.current) {
        draftDrainScheduledRef.current = true;
        void saveQueueRef.current.then(drainLatestDraft);
      }
    });
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
      const uploads = [
        ...documents.employment.map((file) => ({
          file,
          type: "employment" as const,
        })),
        ...documents.awards.map((file) => ({ file, type: "awards" as const })),
      ];
      for (let index = 0; index < uploads.length; index += 2) {
        const batch = await Promise.allSettled(
          uploads
            .slice(index, index + 2)
            .map(({ file, type }) =>
              uploadFormResponseDocument(response.id, file, type),
            ),
        );
        uploadedDocuments.push(
          ...batch.flatMap((result) =>
            result.status === "fulfilled" ? [result.value] : [],
          ),
        );
        const failed = batch.find(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected",
        );
        if (failed) throw failed.reason;
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
    onProgress: (percentage: number) => void,
  ) {
    const id =
      responseIdRef.current ?? (await enqueueStudySave(nextSurvey, "draft")).id;
    const document = await trackDocumentOperation(
      uploadFormResponseDocument(id, file, documentType, { onProgress }),
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
    if (!formDirty) {
      setOpen(false);
      return;
    }
    setConfirmingDraftClose(true);
  }

  function openForm() {
    setFormDirty(false);
    setOpen(true);
  }

  async function saveDraftAndClose() {
    setDraftCloseAction("saving");
    try {
      await saveStudyDraft(latestSurveyRef.current);
      await Promise.allSettled([...documentOperationsRef.current]);
      setConfirmingDraftClose(false);
      refreshAfterModalExitRef.current = true;
      setOpen(false);
      showToast({ message: "Draft saved.", type: "success" });
    } catch (error) {
      showToast({
        message: friendlyRequestMessage(
          error,
          "Your draft could not be saved. The response form will remain open so you can try again.",
        ),
        type: "error",
      });
    } finally {
      setDraftCloseAction(null);
    }
  }

  async function discardDraft() {
    if (!studyId) {
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
      await readApiJson(response, "Your draft could not be discarded.");

      responseIdRef.current = undefined;
      const clearedSurvey = {
        ...structuredClone(defaultSurvey),
        userId: survey.userId,
      };
      setCurrentSurvey(clearedSurvey);
      latestSurveyRef.current = structuredClone(clearedSurvey);
      saveQueueRef.current = Promise.resolve();
      documentOperationsRef.current.clear();
      refreshAfterModalExitRef.current = true;
      setOpen(false);
      setShowDeleteResponseModal(false);
      showToast({
        message:
          responseStatus === "draft" ? "Draft discarded." : "Response deleted.",
        type: "success",
      });
    } catch (error) {
      showToast({
        message: friendlyRequestMessage(
          error,
          "Your draft could not be discarded. It has been kept so you can try again.",
        ),
        type: "error",
      });
    } finally {
      setDraftCloseAction(null);
    }
  }

  if (isNew) {
    return (
      <div className="w-full max-w-5xl rounded-3xl border border-border bg-card p-8 text-center shadow-lg ">
        <h2 className="text-xl font-semibold text-foreground">
          No Tracer Response Found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          You haven&apos;t submitted a Tracer Response yet. Click the button
          below to start answering the form.
        </p>

        <Button variant="default" size="lg" onClick={openForm} className="mt-6">
          <LuPlus size={16} animated />
          Add New Response
        </Button>

        <FormModal
          open={open}
          onClose={() => setOpen(false)}
          onCloseRequest={requestDraftClose}
          onExitComplete={handleModalExitComplete}
          title="New Tracer Response"
          width="xl"
          showCloseButton
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
            onDirtyChange={setFormDirty}
            onRequestClose={requestDraftClose}
            recoveryKey={studyId ? `tracer-response:${studyId}` : undefined}
          />
        </FormModal>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col items-center space-y-6">
      <div className="w-full max-w-5xl rounded-3xl border border-border bg-card p-5 text-left shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-52 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase text-muted-foreground">
                Response ID
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  responseStatus === "draft"
                    ? "bg-warning/15 text-warning"
                    : "bg-success/15 text-success"
                }`}
              >
                {responseStatus}
              </span>
            </div>
            <p className="mt-1 break-all text-sm font-medium">{responseId}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <div className="inline-flex items-center text-left text-xs font-semibold tracking-wider uppercase text-muted-foreground lg:text-right">
              <div className="inline-flex divide-x-2">
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

            <div className="flex items-center gap-3">
              <Button
                variant="default"
                onClick={openForm}
                disabled={open}
                className="flex-1"
              >
                {readOnly ? "View" : "Edit"} Form
              </Button>
              {!readOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-lg"
                  onClick={() => setShowDeleteResponseModal(true)}
                  aria-label="Delete response"
                  title="Delete response"
                >
                  <LuTrash2 aria-hidden="true" size={18} animated />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {readOnly ? (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          onExitComplete={handleModalExitComplete}
          title="View Tracer Response"
          headerContent={<TracerResponseModalHeader response={currentSurvey} />}
          headerVariant="accent"
          width="xl"
        >
          <ReadOnlyResponseDetails response={currentSurvey} />
        </Modal>
      ) : (
        <FormModal
          open={open}
          onClose={() => setOpen(false)}
          onExitComplete={handleModalExitComplete}
          onCloseRequest={
            responseStatus === "draft" ? requestDraftClose : undefined
          }
          shouldConfirmClose={formDirty}
          title="Edit Tracer Response"
          width="xl"
          showCloseButton
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
            onDirtyChange={setFormDirty}
            onRequestClose={
              responseStatus === "draft" ? requestDraftClose : undefined
            }
            recoveryKey={studyId ? `tracer-response:${studyId}` : undefined}
          />
        </FormModal>
      )}
      <ConfirmationDialog
        open={open && confirmingDraftClose}
        onClose={() => setConfirmingDraftClose(false)}
        onConfirm={() => void saveDraftAndClose()}
        title="Save draft before closing?"
        description="Your latest response changes have not been saved yet. Save them as a draft before closing the form."
        cancelLabel="Keep Editing"
        confirmLabel="Save Draft and Close"
        busy={draftCloseAction === "saving"}
      />
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
