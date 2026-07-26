"use client";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { useCallback, useState } from "react";
import { LuLock, LuPlay, LuPlus } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { SelectField } from "@/components/forms/SelectField";
import { fieldStyles as styles } from "@/components/forms/graduate-tracer/shared";
import FormModal from "@/components/ui/FormModal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/components/ui/Toast";
import { PublishedFormVersion, StudyPeriodSummary } from "@/types";
import ExportButton from "@/components/admin/ExportButton";

export interface StudiesPayload {
  studies: StudyPeriodSummary[];
  formVersions: PublishedFormVersion[];
}

interface ScheduleDraft {
  formVersionId: string;
  academicYear: string;
  title: string;
}

const emptyDraft: ScheduleDraft = {
  formVersionId: "",
  academicYear: "",
  title: "Graduate Tracer Study",
};

const statusStyles = {
  upcoming: "bg-warning/15 text-warning",
  open: "bg-success/15 text-success",
  closed: "bg-secondary text-foreground",
  archived: "bg-secondary text-secondary-foreground",
};

export default function StudyScheduler({
  initialData,
}: {
  initialData: StudiesPayload;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<StudiesPayload>(initialData);
  const [saving, setSaving] = useState(false);
  const [changingStudyId, setChangingStudyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    study: StudyPeriodSummary;
    status: "open" | "closed";
  } | null>(null);
  const [draft, setDraft] = useState<ScheduleDraft>(emptyDraft);

  const loadStudies = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/studies", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setData(result.data);
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to load studies.",
        type: "error",
      });
    }
  }, [showToast]);

  function openCreateForm() {
    setDraft({
      ...emptyDraft,
      formVersionId: data.formVersions[0]?.id ?? "",
    });
    setShowForm(true);
  }

  async function saveSchedule(event: React.FormEvent) {
    event.preventDefault();

    if (!draft.formVersionId) {
      showToast({ message: "Select a published form.", type: "error" });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
        }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showToast({
        message: "Study created in the closed state.",
        type: "success",
      });
      setShowForm(false);
      await loadStudies();
      router.refresh();
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to save study.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function changeStudyStatus(
    study: StudyPeriodSummary,
    status: "open" | "closed",
  ) {
    setChangingStudyId(study.id);
    try {
      const response = await fetch(`/api/admin/studies/${study.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showToast({
        message: status === "open" ? "Study opened." : "Study closed.",
        type: "success",
      });
      await loadStudies();
      router.refresh();
      setPendingStatusChange(null);
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to change study status.",
        type: "error",
      });
    } finally {
      setChangingStudyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-5 shadow-lg  md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Tracer Studies
          </h1>
          <p className="text-muted-foreground">
            Create studies, manually control access, and export responses.
          </p>
        </div>
        <Button type="button" variant="elevated" onClick={openCreateForm}>
          <LuPlus size={16} />
          Create Study
        </Button>
      </header>

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create tracer study"
        description="Choose the form and academic year. New studies remain closed until you open them."
        width="lg"
        fitContent
        showCloseButton={false}
        confirmationTitle="Discard study schedule changes?"
        confirmationDescription="Any unsaved changes to this study schedule will be lost."
      >
        {(requestClose) => (
          <form onSubmit={saveSchedule} className="grid gap-5 md:grid-cols-2">
            <SelectField
              id="formVersionId"
              label="Form version *"
              value={draft.formVersionId}
              onChange={(formVersionId) =>
                setDraft((current) => ({
                  ...current,
                  formVersionId,
                }))
              }
              options={data.formVersions.map((version) => ({
                value: version.id,
                label: `${version.title} — v${version.version}`,
              }))}
              placeholder="Select a published form"
              required
            />

            <label className="min-w-0">
              <span className={styles.label}>Academic year</span>
              <Input
                value={draft.academicYear}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    academicYear: event.target.value,
                  }))
                }
                placeholder="2026-2027"
                pattern="[0-9]{4}-[0-9]{4}"
                className={styles.input(false, false)}
                required
              />
            </label>

            <label className="min-w-0 md:col-span-2">
              <span className={styles.label}>Study title</span>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className={styles.input(false, false)}
                required
              />
            </label>

            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="ghost" onClick={requestClose}>
                Cancel
              </Button>
              <Button type="submit" variant="elevated" disabled={saving}>
                {saving ? "Creating..." : "Create Study"}
              </Button>
            </div>
          </form>
        )}
      </FormModal>

      <ConfirmationDialog
        open={pendingStatusChange !== null}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={() => {
          if (pendingStatusChange) {
            void changeStudyStatus(
              pendingStatusChange.study,
              pendingStatusChange.status,
            );
          }
        }}
        title={
          pendingStatusChange?.status === "open"
            ? pendingStatusChange.study.responseCount > 0
              ? "Reopen tracer study?"
              : "Open tracer study?"
            : "Close tracer study?"
        }
        description={
          pendingStatusChange?.status === "open"
            ? `This will allow responses to be created and changed for ${pendingStatusChange.study.academicYear} — ${pendingStatusChange.study.title}.`
            : pendingStatusChange
              ? `This will prevent responses from being edited or deleted for ${pendingStatusChange.study.academicYear} — ${pendingStatusChange.study.title}.`
              : ""
        }
        confirmLabel={
          pendingStatusChange?.status === "open"
            ? pendingStatusChange.study.responseCount > 0
              ? "Reopen Study"
              : "Open Study"
            : "Close Study"
        }
        busy={changingStudyId !== null}
        tone={pendingStatusChange?.status === "closed" ? "danger" : "primary"}
        showCloseButton={false}
      />

      {data.studies.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-input bg-card p-10 text-center text-muted-foreground">
          No study periods have been scheduled yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.studies.map((study) => (
            <article
              key={study.id}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AY {study.academicYear}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    {study.title}
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[study.status]}`}
                >
                  {study.status}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Responses</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {study.responseCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {study.submittedResponseCount}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <ExportButton
                  baseUrl={`/api/admin/responses/export?study=${encodeURIComponent(study.id)}`}
                />
                {study.status === "closed" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={changingStudyId !== null}
                    onClick={() =>
                      setPendingStatusChange({ study, status: "open" })
                    }
                  >
                    <LuPlay />
                    {study.responseCount > 0 ? "Reopen" : "Open"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={changingStudyId !== null}
                    onClick={() =>
                      setPendingStatusChange({ study, status: "closed" })
                    }
                  >
                    <LuLock /> Close
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
