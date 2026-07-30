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
  const [draftCloseAction, setDraftCloseAction] = useState<
    "saving" | "discarding" | null
  >(null);
  const [currentSurvey, setCurrentSurvey] = useState(survey);
  const latestSurveyRef = useRef(survey);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const documentOperationsRef = useRef(new Set<Promise<unknown>>());
  const responseIdRef = useRef(responseId);
  const updatedAtRef = useRef(updatedAt);
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
          expectedUpdatedAt: updatedAtRef.current,
        }),
      });
      const result = await saveResponse.json();

      if (!saveResponse.ok || typeof result.data?.id !== "string") {
        throw new Error(result.message ?? "Failed to save the response.");
      }

      responseIdRef.current = result.data.id;
      updatedAtRef.current = result.data.updatedAt;
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
    if (draftCloseAction === null) void saveDraftAndClose();
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
          title="New Tracer Response"
          width="xl"
          showCloseButton={!formDirty || responseStatus !== "draft"}
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
    <div className="space-y-6 w-full flex flex-col items-center relative">
      <div className="w-full max-w-5xl rounded-3xl border border-border bg-card p-5 text-left shadow-lg ">
        <div className="flex flex-col gap-2 lg:flex-row justify-center md:justify-between">
          <div>
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
            <p className="mt-1 font-medium text-sm">{responseId}</p>
          </div>
          <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-4">
            <div className="text-left md:text-right inline-flex items-center gap-4 text-xs font-semibold tracking-wider uppercase">
              <div className=" text-muted-foreground divide-x-2 inline-flex text-[10px] md:text-xs">
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
              <Button
                variant="default"
                onClick={openForm}
                disabled={open}
                className="flex-1"
              >
                <span className="whitespace-nowrap">
                  {readOnly ? "View" : "Edit"} Form
                </span>
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
          onCloseRequest={
            responseStatus === "draft" ? requestDraftClose : undefined
          }
          shouldConfirmClose={formDirty}
          title="Edit Tracer Response"
          width="xl"
          showCloseButton={!formDirty || responseStatus !== "draft"}
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
