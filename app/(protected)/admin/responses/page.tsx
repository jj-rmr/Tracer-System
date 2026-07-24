"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuDownload, LuFilterX, LuPlus, LuSearch } from "react-icons/lu";

import ManualResponseModal from "@/components/admin/responses/ManualResponseModal";
import { SelectField } from "@/components/forms/SelectField";
import ResponseTable from "@/components/responses/ResponseTable";
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
      <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
        Search responses
      </span>
      <LuSearch className="pointer-events-none absolute bottom-3.5 left-3 h-4 w-4 text-slate-400" />
      <input
        type="search"
        maxLength={100}
        placeholder="Name, email, or program"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

export default function ResponsesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("search") ?? "";
  const [studies, setStudies] = useState<StudyPeriodSummary[]>([]);
  const [showManualResponse, setShowManualResponse] = useState(false);
  const [tableKey, setTableKey] = useState(0);
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
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(
            "Failed to load response filter options:",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      });

    return () => controller.abort();
  }, []);

  const filters = useMemo<AdminResponseFilters>(
    () => ({
      search: searchValue || undefined,
      studyPeriodId: searchParams.get("study") || undefined,
      program: searchParams.get("program") || undefined,
      source: (searchParams.get("source") as AdminResponseFilters["source"]) ||
        undefined,
      status: (searchParams.get("status") as AdminResponseFilters["status"]) ||
        undefined,
      employmentStatus:
        searchParams.get("employmentStatus") || undefined,
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

  function exportResponses() {
    const exportQuery = new URLSearchParams(searchParams.toString());
    exportQuery.delete("page");
    exportQuery.delete("limit");
    const query = exportQuery.toString();

    window.location.href = `/api/admin/responses/export${query ? `?${query}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col flex-wrap gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Responses
          </h1>
          <p className="text-slate-500">View and manage alumni tracer forms.</p>
        </div>
        <div className="flex flex-col-reverse gap-2 md:flex-row">
          <button
            type="button"
            onClick={() => setShowManualResponse(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition-all duration-200 hover:bg-sky-50 hover:shadow-md"
          >
            <LuPlus size={16} />
            Add Manual Response
          </button>
          <button
            type="button"
            onClick={exportResponses}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md"
          >
            <LuDownload size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ResponseSearchField
            key={searchValue}
            initialValue={searchValue}
            onChange={(value) =>
              updateQuery({ search: value.trim() || undefined, page: undefined })
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

          <div className="flex items-end">
            <button
              type="button"
              disabled={!hasFilters}
              onClick={clearFilters}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LuFilterX size={16} />
              Clear filters
            </button>
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
          onClose={() => setShowManualResponse(false)}
          onComplete={() => {
            setShowManualResponse(false);
            updateQuery({ page: undefined });
            setTableKey((current) => current + 1);
          }}
        />
      )}
    </div>
  );
}
