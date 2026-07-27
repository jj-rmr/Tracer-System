"use client";

import { Button } from "@/components/ui/button";

import { useEffect, useRef, useState } from "react";
import { LuLoaderCircle, LuTrash2 } from "react-icons/lu";

import ManualResponseEntry, {
  type ManualResponseDraft,
  type ManualResponseEntryHandle,
} from "@/components/admin/responses/ManualResponseEntry";
import FormModal from "@/components/ui/FormModal";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/ui/Modal";
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
  const [showCloseOptions, setShowCloseOptions] = useState(false);
  const [closeAction, setCloseAction] = useState<
    "saving" | "discarding" | null
  >(null);
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
    setCloseAction("saving");
    try {
      await entryRef.current?.saveDraft();
      showToast({ message: "Manual response draft saved.", type: "success" });
      setShowCloseOptions(false);
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
      setCloseAction(null);
    }
  }

  async function discardAndClose() {
    setCloseAction("discarding");
    try {
      await entryRef.current?.discardDraft();
      showToast({
        message: "Manual response draft discarded.",
        type: "success",
      });
      setShowCloseOptions(false);
      onClose();
    } catch (actionError) {
      showToast({
        message:
          actionError instanceof Error
            ? actionError.message
            : "Failed to discard the manual response draft.",
        type: "error",
      });
    } finally {
      setCloseAction(null);
    }
  }

  return (
    <>
      <FormModal
        open
        onClose={onClose}
        onCloseRequest={() => setShowCloseOptions(true)}
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
            onRequestClose={() => setShowCloseOptions(true)}
          />
        )}
      </FormModal>

      <Modal
        open={showCloseOptions}
        onClose={
          closeAction ? () => undefined : () => setShowCloseOptions(false)
        }
        title="Close manual response?"
        width="md"
        layer="nested"
        bodyClassName="p-6"
        showCloseButton={false}
      >
        <p className="text-sm leading-6 text-muted-foreground">
          Keep editing, save the latest values as a draft, or permanently
          discard this manual response and its uploaded documents.
        </p>
        <div className="mt-6 flex flex-col-reverse md:flex-row gap-3 justify-stretch md:justify-end">
          <div className="flex flex-row gap-3">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              disabled={closeAction !== null}
              onClick={() => void discardAndClose()}
              aria-label="Discard manual response"
              title="Discard manual response"
            >
              {closeAction === "discarding" ? (
                <LuLoaderCircle
                  aria-hidden="true"
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LuTrash2 aria-hidden="true" size={18} />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="fill"
              disabled={closeAction !== null}
              onClick={() => setShowCloseOptions(false)}
            >
              Keep Editing
            </Button>
          </div>

          <Button
            type="button"
            variant="elevated"
            disabled={closeAction !== null}
            onClick={() => void saveDraftAndClose()}
          >
            {closeAction === "saving" ? "Saving..." : "Save as Draft"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
