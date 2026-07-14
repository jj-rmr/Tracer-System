"use client";

import { useEffect, useState } from "react";
// Adjust this path to wherever your types file is located
import { Survey } from "@/types/survey";
import ScrollProvider from "../ScrollProvider";
import SurveyForm from "./SurveyForm";
import { defaultSurvey } from "@/lib/survey/defaults";
import { LuX } from "react-icons/lu";

interface ServerDataResponse {
  documents: Survey[];
  total: number;
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
  const [error, setError] = useState<string | null>(null);

  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchRows() {
      try {
        setLoading(true);
        setError(null);

        const url =
          `/api/admin/surveys?page=${currentPage}` +
          `&limit=${itemsPerPage}` +
          `&search=${encodeURIComponent(searchQuery)}`;

        const res = await fetch(url, {
          cache: "no-store",
          credentials: "include",
        });

        const data: ServerDataResponse = await res.json();

        if (!res.ok) {
          throw new Error(
            (data as any).message ?? "Failed to fetch Appwrite documents.",
          );
        }

        setDocuments(data.documents || []);
        setTotalRows(data.total || 0);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchRows();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 text-sky-600 font-medium w-full">
        <svg
          className="animate-spin h-6 w-6 mr-3 border-4 border-sky-200 border-t-sky-600 rounded-full"
          viewBox="0 0 24 24"
        />
        <span>Filtering Survey logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 w-full text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100 shadow-sm"
        role="alert"
      >
        <span className="font-bold">Appwrite Sync Error:</span> {error}
      </div>
    );
  }

  const totalPages = Math.ceil(totalRows / itemsPerPage) || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  if (totalRows === 0) {
    return (
      <div className="text-center w-full p-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        No tracking records match your current search query.
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
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Survey Forms
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A collection of survey forms containing personnel metadata.
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-full border border-sky-100">
          Found: {totalRows} {totalRows > 1 ? "records" : "record"}
        </span>
      </div>

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
                  <button
                    onClick={() => setSelectedSurvey(doc)}
                    className="text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 px-3 py-1 rounded-lg transition-colors cursor-not-allowed opacity-70"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="flex h-full w-full items-center justify-center p-6">
            <div className="relative h-[95vh] w-fit overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold">View Tracer Survey</h2>

                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-200"
                >
                  <LuX size={24} />
                </button>
              </div>
              <ScrollProvider className="h-[calc(95vh-73px)] overflow-y-auto p-6">
                <SurveyForm
                  initialData={selectedSurvey}
                  isNew={false}
                  readOnly={true}
                />
              </ScrollProvider>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/10 text-sm">
        <span className="text-slate-500">
          Page{" "}
          <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
          <span className="font-semibold text-slate-800">{totalPages}</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className={`rounded-xl border px-4 py-2 text-xs font-medium transition shadow-sm ${hasPrevPage ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer" : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"}`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className={`rounded-xl border px-4 py-2 text-xs font-medium transition shadow-sm ${hasNextPage ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer" : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
