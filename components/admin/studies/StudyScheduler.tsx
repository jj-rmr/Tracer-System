"use client";

import { useCallback, useState } from "react";
import { LuArchive, LuPencil, LuPlus } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { SelectField } from "@/components/forms/SelectField";
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
  opensAt: string;
  closesAt: string;
}

const emptyDraft: ScheduleDraft = {
  formVersionId: "",
  academicYear: "",
  title: "Graduate Tracer Study",
  opensAt: "",
  closesAt: "",
};

const statusStyles = {
  upcoming: "bg-amber-100 text-amber-700",
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-200 text-slate-700",
  archived: "bg-violet-100 text-violet-700",
};

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function StudyScheduler({
  initialData,
}: {
  initialData: StudiesPayload;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<StudiesPayload>(initialData);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStudyId, setEditingStudyId] = useState<string | null>(null);
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
    setEditingStudyId(null);
    setDraft({
      ...emptyDraft,
      formVersionId: data.formVersions[0]?.id ?? "",
    });
    setShowForm(true);
  }

  function openEditForm(study: StudyPeriodSummary) {
    setEditingStudyId(study.id);
    setDraft({
      formVersionId: study.formVersionId,
      academicYear: study.academicYear,
      title: study.title,
      opensAt: toLocalDateTime(study.opensAt),
      closesAt: toLocalDateTime(study.closesAt),
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
      const response = await fetch(
        editingStudyId
          ? `/api/admin/studies/${editingStudyId}`
          : "/api/admin/studies",
        {
          method: editingStudyId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draft,
            opensAt: new Date(draft.opensAt).toISOString(),
            closesAt: new Date(draft.closesAt).toISOString(),
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showToast({
        message: editingStudyId
          ? "Study schedule updated."
          : "Study period created.",
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

  async function archiveStudy(study: StudyPeriodSummary) {
    if (!window.confirm(`Archive ${study.academicYear}?`)) return;

    try {
      const response = await fetch(`/api/admin/studies/${study.id}/archive`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showToast({ message: "Study archived.", type: "success" });
      await loadStudies();
      router.refresh();
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to archive study.",
        type: "error",
      });
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
            Schedule response windows and archive completed academic years.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          <LuPlus size={16} />
          Schedule Study
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={saveSchedule}
          className="grid gap-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm md:grid-cols-2"
        >
          <h2 className="md:col-span-2 text-lg font-semibold text-slate-900">
            {editingStudyId ? "Edit study schedule" : "Schedule a study"}
          </h2>

          <SelectField
            id="formVersionId"
            label="Form version *"
            value={draft.formVersionId}
            disabled={Boolean(editingStudyId)}
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

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Academic year</span>
            <input
              value={draft.academicYear}
              disabled={!!editingStudyId}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  academicYear: event.target.value,
                }))
              }
              placeholder="2026-2027"
              pattern="[0-9]{4}-[0-9]{4}"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Study title</span>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Opens</span>
            <input
              type="datetime-local"
              value={draft.opensAt}
              disabled={
                !!editingStudyId &&
                data.studies.find((study) => study.id === editingStudyId)
                  ?.status === "open"
              }
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  opensAt: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Closes</span>
            <input
              type="datetime-local"
              value={draft.closesAt}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  closesAt: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              required
            />
          </label>

          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </form>
      )}

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
                  <dt className="text-slate-400">Opens</dt>
                  <dd className="mt-1 text-slate-700 font-semibold">
                    {new Date(study.opensAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Closes</dt>
                  <dd className="mt-1 text-slate-700 font-semibold">
                    {new Date(study.closesAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </dd>
                </div>
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
                {(study.status === "upcoming" || study.status === "open") && (
                  <button
                    type="button"
                    onClick={() => openEditForm(study)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                  >
                    <LuPencil size={15} /> Edit
                  </button>
                )}
                {study.status === "closed" && (
                  <button
                    type="button"
                    onClick={() => archiveStudy(study)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                  >
                    <LuArchive size={15} /> Archive
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
