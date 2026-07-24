"use client";

import { useEffect, useState } from "react";
import { AdminResponseFilters, AdminResponseSummary, Survey } from "@/types";
import GraduateTracerForm from "@/components/forms/GraduateTracerForm";
import { LuEye, LuTrash2 } from "react-icons/lu";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import LoadingState from "@/components/ui/LoadingState";
import { useRouter } from "next/navigation";
import { PROGRAMS } from "@/lib/programs/catalog";

interface ServerDataResponse {
  success: boolean;
  responses: AdminResponseSummary[];
  total: number;
  message?: string;
}

interface ResponseTableProps {
  currentPage: number;
  filters: AdminResponseFilters;
  onPageChange: (newPage: number) => void;
}

export default function ResponseTable({
  currentPage,
  filters,
  onPageChange,
}: ResponseTableProps) {
  const [responses, setResponses] = useState<AdminResponseSummary[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState<Survey | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();

  const itemsPerPage = 10;

  useEffect(() => {
    if (!selectedSurveyId) return;

    async function fetchSurvey() {
      try {
        setLoadingSurvey(true);

        try {
          const res = await fetch(`/api/admin/responses/${selectedSurveyId}`, {
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message ?? "Failed to load survey.");
          }

          setSurveyData(data.response);
        } catch (error: unknown) {
          console.error(error);

          showToast({
            message:
              error instanceof Error ? error.message : "Failed to load survey.",
            type: "error",
          });

          setSelectedSurveyId(null);
          setSurveyData(null);
        } finally {
          setLoadingSurvey(false);
        }
      } finally {
        setLoadingSurvey(false);
      }
    }

    fetchSurvey();
  }, [selectedSurveyId, showToast]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSurveys() {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
        });

        if (filters.search) searchParams.set("search", filters.search);
        if (filters.studyPeriodId) {
          searchParams.set("study", filters.studyPeriodId);
        }
        if (filters.program) searchParams.set("program", filters.program);
        if (filters.source) searchParams.set("source", filters.source);
        if (filters.status) searchParams.set("status", filters.status);
        if (filters.employmentStatus) {
          searchParams.set("employmentStatus", filters.employmentStatus);
        }

        const res = await fetch(
          `/api/admin/responses?${searchParams.toString()}`,
          {
            cache: "no-store",
            credentials: "include",
            signal: controller.signal,
          },
        );

        const data: ServerDataResponse = await res.json();

        if (!res.ok) {
          throw new Error(data.message ?? "Failed to load surveys.");
        }

        setResponses(data.responses);
        setTotalRows(data.total);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        setError(
          error instanceof Error ? error.message : "Failed to load responses.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSurveys();

    return () => {
      controller.abort();
    };
  }, [currentPage, filters]);

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/responses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to delete survey.");
      }

      setResponses((previous) =>
        previous.filter((response) => response.id !== id),
      );
      setTotalRows((prev) => Math.max(0, prev - 1));

      setSurveyToDelete(null);
      setShowDeleteModal(false);

      showToast({
        message: "Survey deleted successfully.",
        type: "success",
      });

      router.refresh();
    } catch (error: unknown) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to delete survey.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState className="min-h-72" message="Loading responses..." />;
  }

  if (error) {
    return (
      <div
        className="p-4 w-full text-sm text-rose-500 rounded-2xl bg-rose-50 border border-rose-100 shadow-sm"
        role="alert"
      >
        <span className="font-bold">Error:</span> {error}
      </div>
    );
  }

  const totalPages = Math.ceil(totalRows / itemsPerPage) || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  if (totalRows === 0) {
    return (
      <div className="text-center w-full p-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        {Object.values(filters).some(Boolean) ? (
          <>
            <h3 className="text-base font-semibold text-slate-600">
              No matching surveys found
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Try adjusting your search terms or clear the search to view all
              survey records.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-slate-600">
              No survey records yet
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Survey submissions will appear here once alumni complete the
              tracer survey.
            </p>
          </>
        )}
      </div>
    );
  }

  const formatFullName = (response: AdminResponseSummary) => {
    if (response.respondentName?.trim()) return response.respondentName;

    const parts = [
      response.firstName,
      response.middleName,
      response.lastName,
      response.extensionName,
    ]
      .map((p) => p?.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Unnamed Respondent";
  };

  const programLabels = new Map(
    PROGRAMS.map((program) => [program.value, program.label]),
  );

  return (
    <div className="w-full bg-white rounded-3xl border border-sky-100 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Academic Year
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Program
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Employment Status
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Created
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {responses.map((response) => (
              <tr
                key={response.id}
                className="hover:bg-sky-50/20 transition-colors group"
              >
                <td className="p-4 text-sm font-semibold text-slate-700">
                  {formatFullName(response)}
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">
                  {response.academicYear}
                </td>
                <td className="max-w-xs p-4 text-sm text-slate-600">
                  <span className="line-clamp-2">
                    {programLabels.get(response.program) ||
                      response.program ||
                      "Unspecified"}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">
                  <span className="capitalize">
                    {response.employmentStatus || "unspecified"}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {response.createdAt
                    ? new Date(response.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="p-4 text-sm">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSurveyId(response.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-100 px-4 py-2 font-semibold text-sky-600 transition-colors hover:bg-sky-200"
                    >
                      <LuEye size={16} />
                      View
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        setSurveyToDelete(response.id);
                        setShowDeleteModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-100 px-4 py-2 font-semibold text-rose-500 transition-colors hover:bg-rose-200"
                    >
                      <LuTrash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={Boolean(selectedSurveyId)}
        onClose={() => {
          setSelectedSurveyId(null);
          setSurveyData(null);
        }}
        title="View Tracer Response"
        width="xl"
      >
        {loadingSurvey ? (
          <LoadingState className="min-h-72" message="Loading response..." />
        ) : (
          <div className="mx-auto w-full max-w-5xl">
            {surveyData && (
              <GraduateTracerForm
                initialData={surveyData}
                isNew={false}
                readOnly
              />
            )}
          </div>
        )}
      </Modal>

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/10 text-sm">
        {totalRows > 1 ? (
          <span className="text-sky-600 py-2 px-4 bg-sky-50 rounded-lg font-semibold">
            Showing <span className="">{responses.length}</span> of{" "}
            <span className="">
              <span className="">{totalRows}</span> Entries
            </span>
          </span>
        ) : (
          <span className="text-sky-600 py-2 px-4 bg-sky-50 rounded-lg font-semibold">
            Showing 1 Entry
          </span>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className={`px-4 py-2 whitespace-nowrap disabled:bg-slate-100 bg-white disabled:text-slate-400 shadow-sm disabled:border-none disabled:shadow-none border border-slate-200 text-slate-700 text-sm rounded-xl font-semibold hover:bg-slate-100 transition-colors duration-300`}
          >
            Previous
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className={`px-4 py-2 whitespace-nowrap disabled:bg-slate-100 bg-sky-600 text-white text-sm rounded-xl font-semibold hover:bg-sky-700 transition-colors duration-300`}
          >
            Next
          </button>
        </div>
      </div>
      <ConfirmationDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSurveyToDelete(null);
        }}
        onConfirm={() => {
          if (surveyToDelete) void confirmDelete(surveyToDelete);
        }}
        title="Delete response?"
        description="This response and its document records will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Response"
        busy={isDeleting}
        tone="danger"
      />
    </div>
  );
}
