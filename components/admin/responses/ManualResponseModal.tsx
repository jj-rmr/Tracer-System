"use client";

import { useEffect, useRef, useState } from "react";

import ManualResponseEntry, {
  type ManualResponseDraft,
  type ManualResponseEntryHandle,
} from "@/components/admin/responses/ManualResponseEntry";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import FormModal from "@/components/ui/FormModal";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";
import { friendlyRequestMessage, readApiJson } from "@/lib/api/client-errors";
import { PublishedFormVersion, StudyPeriod, StudyPeriodSummary } from "@/types";

interface StudiesPayload {
  studies: StudyPeriodSummary[];
  formVersions: PublishedFormVersion[];
  allowedProgramValues: string[] | null;
}

interface ManualResponseModalProps {
  onClose: () => void;
  onComplete: () => void;
  onDraftSaved: (responseId: string) => void;
}

export default function ManualResponseModal({
  onClose,
  onComplete,
  onDraftSaved,
}: ManualResponseModalProps) {
  const [studies, setStudies] = useState<StudyPeriod[]>([]);
  const [initialDraft, setInitialDraft] = useState<ManualResponseDraft | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allowedProgramValues, setAllowedProgramValues] = useState<
    string[] | null
  >(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const entryRef = useRef<ManualResponseEntryHandle>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [studiesResponse, draftResponse] = await Promise.all([
          fetch("/api/admin/studies", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/responses/manual-draft", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);
        const [studiesResult, draftResult] = await Promise.all([
          readApiJson<{ data: StudiesPayload }>(
            studiesResponse,
            "The available studies could not be loaded.",
          ),
          readApiJson<{ data: ManualResponseDraft | null }>(
            draftResponse,
            "The saved manual response draft could not be loaded.",
          ),
        ]);

        const data = studiesResult.data as StudiesPayload;
        const eligibleVersionIds = new Set(
          data.formVersions
            .filter(
              (version) =>
                version.slug === "graduate-tracer" && version.version === 1,
            )
            .map((version) => version.id),
        );

        setStudies(
          data.studies.filter((study) =>
            eligibleVersionIds.has(study.formVersionId),
          ),
        );
        setAllowedProgramValues(data.allowedProgramValues);
        setInitialDraft(
          (draftResult.data as ManualResponseDraft | null) ?? null,
        );
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            friendlyRequestMessage(
              loadError,
              "The manual response form could not be loaded. Please close it and try again.",
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadData();
    return () => controller.abort();
  }, []);

  async function saveDraftAndClose() {
    if (savingDraft) return;
    if (!formDirty) {
      onClose();
      return;
    }
    setSavingDraft(true);
    try {
      const saved = await entryRef.current?.saveDraft();
      if (!saved) return;
      showToast({ message: "Manual response draft saved.", type: "success" });
      onDraftSaved(saved.id);
      setConfirmingClose(false);
      onClose();
    } catch (actionError) {
      showToast({
        message: friendlyRequestMessage(
          actionError,
          "The manual response draft could not be saved. The form will remain open so you can try again.",
        ),
        type: "error",
      });
    } finally {
      setSavingDraft(false);
    }
  }

  function requestClose() {
    if (formDirty) {
      setConfirmingClose(true);
      return;
    }

    onClose();
  }

  return (
    <>
      <FormModal
        open
        onClose={onClose}
        onCloseRequest={requestClose}
        title={initialDraft ? "Edit Draft Response" : "Add Manual Response"}
        description="Transcribe a historical tracer study response."
        width="xl"
        showCloseButton
      >
        {loading ? (
          <LoadingState className="min-h-72" message="Loading studies..." />
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <ManualResponseEntry
            ref={entryRef}
            studies={studies}
            initialDraft={initialDraft}
            onComplete={onComplete}
            onDraftSaved={onDraftSaved}
            onDirtyChange={setFormDirty}
            onRequestClose={requestClose}
            allowedProgramValues={allowedProgramValues}
          />
        )}
      </FormModal>

      <ConfirmationDialog
        open={confirmingClose}
        onClose={() => setConfirmingClose(false)}
        onConfirm={() => void saveDraftAndClose()}
        title="Save draft before closing?"
        description="Your latest manual response changes have not been saved yet. Save them as a draft before closing the form."
        cancelLabel="Keep Editing"
        confirmLabel="Save Draft and Close"
        busy={savingDraft}
      />
    </>
  );
}
