"use client";

import { SearchInput } from "@/components/ui/search-input";

import { Button } from "@/components/ui/button";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LuFilterX,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuTrash2,
} from "@/components/ui/icons";

import ManualResponseModal from "@/components/admin/responses/ManualResponseModal";
import ExportButton from "@/components/admin/ExportButton";
import { SelectField } from "@/components/forms/SelectField";
import ResponseTable from "@/components/responses/ResponseTable";
import { useToast } from "@/components/ui/Toast";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { PROGRAMS } from "@/lib/programs/catalog";
import { AdminResponseFilters, StudyPeriodSummary } from "@/types";

function ResponseSearchField({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(value, 200);

  useEffect(() => {
    if (debouncedValue !== initialValue) onChange(debouncedValue);
  }, [debouncedValue, initialValue, onChange]);

  return (
    <label className="relative flex w-full flex-col xl:col-span-2">
      <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Search responses
      </span>
      <SearchInput
        maxLength={100}
        placeholder="Name, email, or program"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </label>
  );
}

export default function ResponsesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("search") ?? "";
  const [studies, setStudies] = useState<StudyPeriodSummary[]>([]);
  const [studiesLoaded, setStudiesLoaded] = useState(false);
  const [manualDraftId, setManualDraftId] = useState<string | null>(null);
  const [showDeleteDraftModal, setShowDeleteDraftModal] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState(false);
  const [showManualResponse, setShowManualResponse] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [refreshOnCooldown, setRefreshOnCooldown] = useState(false);
  const refreshCooldownRef = useRef<number | null>(null);
  const parsedPage = Number(searchParams.get("page") ?? "1");
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const updateQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([name, value]) => {
        if (value) next.set(name, value);
        else next.delete(name);
      });

      const query = next.toString();
      router.replace(query ? `/admin/responses?${query}` : "/admin/responses", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/admin/studies", {
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setStudies(result.data.studies);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          showToast({
            message: "Failed to check available tracer studies.",
            type: "error",
          });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setStudiesLoaded(true);
      });

    return () => controller.abort();
  }, [showToast]);

  const refreshManualDraft = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/responses/manual-draft", {
        cache: "no-store",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setManualDraftId(result.data?.responseId ?? null);
    } catch {}
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void refreshManualDraft(), 0);
    return () => window.clearTimeout(timeout);
  }, [refreshManualDraft]);

  function openManualResponse() {
    if (!studies.some((study) => study.status === "open")) {
      showToast({
        message: "No tracer studies are currently available or open.",
        type: "warning",
      });
      return;
    }

    setShowManualResponse(true);
  }

  const filters = useMemo<AdminResponseFilters>(
    () => ({
      search: searchValue || undefined,
      studyPeriodId: searchParams.get("study") || undefined,
      program: searchParams.get("program") || undefined,
      source:
        (searchParams.get("source") as AdminResponseFilters["source"]) ||
        undefined,
      status:
        (searchParams.get("status") as AdminResponseFilters["status"]) ||
        undefined,
      employmentStatus: searchParams.get("employmentStatus") || undefined,
    }),
    [searchParams, searchValue],
  );
  const hasFilters = Object.values(filters).some(Boolean);

  function setFilter(name: string, value: string) {
    updateQuery({ [name]: value || undefined, page: undefined });
  }

  function clearFilters() {
    router.replace("/admin/responses", { scroll: false });
  }

  function refreshResponses() {
    if (refreshOnCooldown) return;

    setRefreshOnCooldown(true);
    setTableKey((current) => current + 1);
    refreshCooldownRef.current = window.setTimeout(() => {
      setRefreshOnCooldown(false);
      refreshCooldownRef.current = null;
    }, 2_000);
  }

  async function deleteManualDraft() {
    if (!manualDraftId || deletingDraft) return;

    setDeletingDraft(true);
    try {
      const response = await fetch(`/api/admin/responses/${manualDraftId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message ?? "Failed to delete the draft response.",
        );
      }

      setManualDraftId(null);
      setShowDeleteDraftModal(false);
      setTableKey((current) => current + 1);
      showToast({ message: "Draft response deleted.", type: "success" });
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete the draft response.",
        type: "error",
      });
    } finally {
      setDeletingDraft(false);
    }
  }

  useEffect(
    () => () => {
      if (refreshCooldownRef.current !== null) {
        window.clearTimeout(refreshCooldownRef.current);
      }
    },
    [],
  );

  function responseExportUrl() {
    const exportQuery = new URLSearchParams(searchParams.toString());
    exportQuery.delete("page");
    exportQuery.delete("limit");
    const query = exportQuery.toString();

    return `/api/admin/responses/export${query ? `?${query}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col flex-wrap gap-4 rounded-3xl border border-border bg-card/80 p-5 shadow-lg  md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Responses
          </h1>
          <p className="text-muted-foreground">
            View and manage alumni tracer forms.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 md:flex-row">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={openManualResponse}
              disabled={!studiesLoaded}
              className="flex-1 md:flex-none"
            >
              {manualDraftId ? (
                <LuPencil size={16} animated />
              ) : (
                <LuPlus size={16} animated />
              )}
              {manualDraftId ? "Edit Draft Response" : "Add Manual Response"}
            </Button>
            {manualDraftId && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDraftModal(true)}
                aria-label="Delete draft response"
                title="Delete draft response"
              >
                <LuTrash2 size={16} animated />
              </Button>
            )}
          </div>
          <ExportButton baseUrl={responseExportUrl()} />
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-2 md:gap-4 md:grid-cols-1 xl:grid-cols-3">
          <ResponseSearchField
            key={searchValue}
            initialValue={searchValue}
            onChange={(value) =>
              updateQuery({
                search: value.trim() || undefined,
                page: undefined,
              })
            }
          />

          <SelectField
            id="response-study-filter"
            label="Academic year"
            value={filters.studyPeriodId ?? ""}
            onChange={(value) => setFilter("study", value)}
            options={[
              { value: "", label: "All academic years" },
              ...studies.map((study) => ({
                value: study.id,
                label: `${study.academicYear} — ${study.title}`,
              })),
            ]}
            placeholder="All academic years"
          />

          <SelectField
            id="response-program-filter"
            label="Program"
            value={filters.program ?? ""}
            onChange={(value) => setFilter("program", value)}
            options={[{ value: "", label: "All programs" }, ...PROGRAMS]}
            placeholder="All programs"
          />

          <SelectField
            id="response-source-filter"
            label="Source"
            value={filters.source ?? ""}
            onChange={(value) => setFilter("source", value)}
            options={[
              { value: "", label: "All sources" },
              { value: "alumni", label: "Alumni submission" },
              { value: "admin_import", label: "Manual entry" },
            ]}
            placeholder="All sources"
          />

          <SelectField
            id="response-status-filter"
            label="Status"
            value={filters.status ?? ""}
            onChange={(value) => setFilter("status", value)}
            options={[
              { value: "", label: "All statuses" },
              { value: "draft", label: "Draft" },
              { value: "submitted", label: "Submitted" },
            ]}
            placeholder="All statuses"
          />

          <SelectField
            id="response-employment-filter"
            label="Employment"
            value={filters.employmentStatus ?? ""}
            onChange={(value) => setFilter("employmentStatus", value)}
            options={[
              { value: "", label: "All employment statuses" },
              { value: "Yes", label: "Employed" },
              { value: "No", label: "Not currently employed" },
              { value: "Never Employed", label: "Never employed" },
            ]}
            placeholder="All employment statuses"
          />

          <div className="flex flex-row col-span-1 xl:col-span-2 items-end gap-2 md:gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={!hasFilters}
              onClick={clearFilters}
              className="flex-1"
            >
              <LuFilterX size={16} />
              Clear filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={refreshResponses}
              disabled={refreshOnCooldown}
              aria-label="Refresh responses table"
              title={
                refreshOnCooldown
                  ? "Refresh available again in 2 seconds"
                  : "Refresh responses table"
              }
              className="flex-1"
            >
              <LuRefreshCw
                size={16}
                animated={!refreshOnCooldown}
                className={refreshOnCooldown ? "animate-spin" : undefined}
              />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <ResponseTable
        key={tableKey}
        currentPage={currentPage}
        filters={filters}
        onPageChange={(page) => updateQuery({ page: String(page) })}
      />

      {showManualResponse && (
        <ManualResponseModal
          onClose={() => {
            setShowManualResponse(false);
          }}
          onDraftSaved={setManualDraftId}
          onComplete={() => {
            setShowManualResponse(false);
            setManualDraftId(null);
            updateQuery({ page: undefined });
            setTableKey((current) => current + 1);
          }}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDraftModal}
        onClose={() => setShowDeleteDraftModal(false)}
        onConfirm={() => void deleteManualDraft()}
        title="Delete draft response?"
        description="This draft response and its document records will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Draft Response"
        busy={deletingDraft}
        tone="danger"
      />
    </div>
  );
}
