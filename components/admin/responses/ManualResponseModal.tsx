"use client";

import { useEffect, useRef, useState } from "react";

import ManualResponseEntry, {
  type ManualResponseDraft,
  type ManualResponseEntryHandle,
} from "@/components/admin/responses/ManualResponseEntry";
import FormModal from "@/components/ui/FormModal";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";
import { PublishedFormVersion, StudyPeriod, StudyPeriodSummary } from "@/types";

interface StudiesPayload {
  studies: StudyPeriodSummary[];
  formVersions: PublishedFormVersion[];
}

interface ManualResponseModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function ManualResponseModal({
  onClose,
  onComplete,
}: ManualResponseModalProps) {
  const [studies, setStudies] = useState<StudyPeriod[]>([]);
  const [initialDraft, setInitialDraft] = useState<ManualResponseDraft | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
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
          studiesResponse.json(),
          draftResponse.json(),
        ]);

        if (!studiesResponse.ok) {
          throw new Error(studiesResult.message ?? "Failed to load studies.");
        }
        if (!draftResponse.ok) {
          throw new Error(
            draftResult.message ?? "Failed to load the manual response draft.",
          );
        }

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
        setInitialDraft(
          (draftResult.data as ManualResponseDraft | null) ?? null,
        );
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load manual response details.",
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
    setSavingDraft(true);
    try {
      await entryRef.current?.saveDraft();
      showToast({ message: "Manual response draft saved.", type: "success" });
      onClose();
    } catch (actionError) {
      showToast({
        message:
          actionError instanceof Error
            ? actionError.message
            : "Failed to save the manual response draft.",
        type: "error",
      });
    } finally {
      setSavingDraft(false);
    }
  }

  return (
    <>
      <FormModal
        open
        onClose={onClose}
        onCloseRequest={() => void saveDraftAndClose()}
        title={initialDraft ? "Edit Draft Response" : "Add Manual Response"}
        description="Transcribe a historical tracer study response."
        width="xl"
        showCloseButton={false}
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
            onRequestClose={() => void saveDraftAndClose()}
          />
        )}
      </FormModal>
    </>
  );
}
