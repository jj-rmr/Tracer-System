"use client";

import { useCallback, useState } from "react";
import { LuDownload, LuLock, LuPlay, LuPlus } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { SelectField } from "@/components/forms/SelectField";
import { fieldStyles as styles } from "@/components/forms/graduate-tracer/shared";
import FormModal from "@/components/ui/FormModal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/components/ui/Toast";
import { PublishedFormVersion, StudyPeriodSummary } from "@/types";

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
  upcoming: "bg-amber-100 text-amber-700",
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-200 text-slate-700",
  archived: "bg-violet-100 text-violet-700",
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
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Tracer Studies
          </h1>
          <p className="text-slate-500">
            Create studies, manually control access, and export responses.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-sm hover:bg-sky-700"
        >
          <LuPlus size={16} />
          Create Study
        </button>
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
          <form
            onSubmit={saveSchedule}
            className="grid gap-5 md:grid-cols-2"
          >

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
            <input
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
            <input
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
            <button
              type="button"
              onClick={requestClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Study"}
            </button>
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
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No study periods have been scheduled yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.studies.map((study) => (
            <article
              key={study.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    AY {study.academicYear}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
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
                  <dt className="text-slate-400">Responses</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {study.responseCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Submitted</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {study.submittedResponseCount}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <a
                  href={`/api/admin/responses/export?study=${encodeURIComponent(study.id)}`}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  <LuDownload size={15} /> Export CSV
                </a>
                {study.status === "closed" ? (
                  <button
                    type="button"
                    disabled={changingStudyId !== null}
                    onClick={() =>
                      setPendingStatusChange({ study, status: "open" })
                    }
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                  >
                    <LuPlay size={15} />
                    {study.responseCount > 0 ? "Reopen" : "Open"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={changingStudyId !== null}
                    onClick={() =>
                      setPendingStatusChange({ study, status: "closed" })
                    }
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <LuLock size={15} /> Close
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
