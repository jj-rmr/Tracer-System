"use client";

import { useEffect, useState } from "react";
import { Survey } from "@/types/survey";
import ScrollProvider from "@/components/ScrollProvider";
import SurveyForm from "./SurveyForm";
import { LuEye, LuLoaderCircle, LuTrash2, LuX } from "react-icons/lu";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

interface ServerDataResponse {
  success: boolean;
  documents: Survey[];
  total: number;
  message?: string;
}

interface SurveyTableProps {
  currentPage: number;
  searchQuery: string;
  onPageChange: (newPage: number) => void;
}

export default function SurveyTable({
  currentPage,
  searchQuery,
  onPageChange,
}: SurveyTableProps) {
  const [documents, setDocuments] = useState<Survey[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [showSurveyLoading, setShowSurveyLoading] = useState(false);
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

        const loadingTimer = setTimeout(() => {
          setShowSurveyLoading(true);
        }, 200);

        try {
          const res = await fetch(`/api/admin/surveys/${selectedSurveyId}`, {
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message ?? "Failed to load survey.");
          }

          setSurveyData(data.survey);
        } catch (err: any) {
          console.error(err);

          showToast({
            message: err.message || "Failed to load survey.",
            type: "error",
          });

          setSelectedSurveyId(null);
          setSurveyData(null);
        } finally {
          clearTimeout(loadingTimer);

          setLoadingSurvey(false);
          setShowSurveyLoading(false);
        }
      } finally {
        setLoadingSurvey(false);
      }
    }

    fetchSurvey();
  }, [selectedSurveyId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSurveys() {
      setLoading(true);
      setError(null);

      const loadingTimer = setTimeout(() => {
        if (!cancelled) {
          setShowLoading(true);
        }
      }, 200);

      try {
        const res = await fetch(
          `/api/admin/surveys?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );

        const data: ServerDataResponse = await res.json();

        if (!res.ok) {
          throw new Error(data.message ?? "Failed to load surveys.");
        }

        if (!cancelled) {
          setDocuments(data.documents);
          setTotalRows(data.total);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        clearTimeout(loadingTimer);

        if (!cancelled) {
          setLoading(false);
          setShowLoading(false);
        }
      }
    }

    fetchSurveys();

    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery]);

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/surveys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to delete survey.");
      }

      setDocuments((prev) => prev.filter((survey) => survey.id !== id));
      setTotalRows((prev) => Math.max(0, prev - 1));

      setSurveyToDelete(null);
      setShowDeleteModal(false);

      showToast({
        message: "Survey deleted successfully.",
        type: "success",
      });

      router.refresh();
    } catch (err: any) {
      showToast({
        message: err.message || "Failed to delete survey.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && showLoading) {
    return (
      <div className="flex justify-center items-center p-12 text-sky-600 font-medium w-full">
        <LuLoaderCircle className="mr-3 h-6 w-6 animate-spin" />
        <span>Filtering Survey logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 w-full text-sm text-red-500 rounded-2xl bg-red-50 border border-red-100 shadow-sm"
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
        {searchQuery.trim() ? (
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

  const formatFullName = (doc: Survey) => {
    const parts = [
      doc.firstName,
      doc.middleName,
      doc.lastName,
      doc.extensionName,
    ]
      .map((p) => p?.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "None";
  };

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
                Sex
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Civil Status
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
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-sky-50/20 transition-colors group"
              >
                <td className="p-4 text-sm font-semibold text-slate-700">
                  {formatFullName(doc)}
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">
                  {doc.sex || (
                    <span className="text-slate-300 italic">Unspecified</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex whitespace-nowrap items-center px-2.5 py-0.5 rounded-md text-xs font-medium titlecase
                    ${
                      doc.civilStatus?.toLowerCase() === "single"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : doc.civilStatus?.toLowerCase() === "married"
                          ? "bg-violet-50 text-violet-700 border border-violet-100"
                          : doc.civilStatus?.toLowerCase() === "separated"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : doc.civilStatus?.toLowerCase() === "singleparent"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : doc.civilStatus?.toLowerCase() ===
                                  "widowwidower"
                                ? "bg-sky-50 text-sky-700 border border-sky-100"
                                : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {doc.civilStatus || "unspecified"}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">
                  <span className="capitalize">
                    {doc.employmentStatus || "unspecified"}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="p-4 text-sm">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSurveyId(doc.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-100 px-4 py-2 font-semibold text-sky-600 transition-colors hover:bg-sky-200"
                    >
                      <LuEye size={16} />
                      View
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        setSurveyToDelete(doc.id);
                        setShowDeleteModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-500 transition-colors hover:bg-red-200"
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
      {selectedSurveyId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="flex h-full items-center justify-center p-6">
            <div className="relative flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold">View Tracer Survey</h2>

                <button
                  onClick={() => {
                    setSelectedSurveyId(null);
                    setSurveyData(null);
                  }}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-200"
                >
                  <LuX size={24} />
                </button>
              </div>

              <ScrollProvider className="flex-1 overflow-y-auto p-6">
                {loadingSurvey && showSurveyLoading ? (
                  <div className="flex h-full items-center justify-center gap-2">
                    <LuLoaderCircle className="h-6 w-6 animate-spin" />
                    <span>Loading survey...</span>
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-5xl">
                    {surveyData && (
                      <SurveyForm
                        initialData={surveyData}
                        isNew={false}
                        readOnly
                      />
                    )}
                  </div>
                )}
              </ScrollProvider>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/10 text-sm">
        {totalRows > 1 ? (
          <span className="text-sky-600 py-2 px-4 bg-sky-50 rounded-lg font-semibold">
            Showing <span className="">{documents.length}</span> of{" "}
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
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Survey?
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to permanently delete this survey? This
              action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSurveyToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (!surveyToDelete) return;
                  confirmDelete(surveyToDelete);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Survey"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
