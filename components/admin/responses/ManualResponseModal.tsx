"use client";

import { useEffect, useState } from "react";

import ManualResponseEntry from "@/components/admin/responses/ManualResponseEntry";
import FormModal from "@/components/ui/FormModal";
import LoadingState from "@/components/ui/LoadingState";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStudies() {
      try {
        const response = await fetch("/api/admin/studies", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message ?? "Failed to load study periods.");
        }

        const data = result.data as StudiesPayload;
        const eligibleVersionIds = new Set(
          data.formVersions
            .filter(
              (version) =>
                version.slug === "graduate-tracer" && version.version === 1,
            )
            .map((version) => version.id),
        );

        setStudies(
          data.studies.filter(
            (study) =>
              study.status !== "archived" &&
              eligibleVersionIds.has(study.formVersionId),
          ),
        );
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load study periods.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadStudies();
    return () => controller.abort();
  }, []);

  return (
    <FormModal
      open
      onClose={onClose}
      title="Add Manual Response"
      description="Transcribe a historical tracer study response."
      width="xl"
      confirmationDescription="The manual response and any selected documents will be discarded."
    >
      {loading ? (
        <LoadingState className="min-h-72" message="Loading studies..." />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <ManualResponseEntry studies={studies} onComplete={onComplete} />
      )}
    </FormModal>
  );
}
