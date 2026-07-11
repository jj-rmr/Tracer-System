"use client";

import { useEffect, useState } from "react";

interface UserProfileDocument {
  $id: string;
  userId: string;
  fullName: string;
  course: string;
  civilStatus: string;
  $createdAt: string;
  $updatedAt: string;
}

interface ServerDataResponse {
  documents: UserProfileDocument[];
  total: number;
}

interface TracerTableProps {
  currentPage: number;
  searchQuery: string;
  onPageChange: (newPage: number) => void;
}

export default function TracerTable({
  currentPage,
  searchQuery,
  onPageChange,
}: TracerTableProps) {
  const [documents, setDocuments] = useState<UserProfileDocument[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchRows() {
      try {
        setLoading(true);
        setError(null);

        const url = `/api/user-profiles?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
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
        <span>Filtering tracer logs...</span>
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

  return (
    <div className="w-full bg-white rounded-3xl border border-sky-100 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Tracer Forms
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A collection of tracer forms.
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-full border border-sky-100">
          Found: {totalRows} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                User ID
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Course
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Civil Status
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Created
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {documents.map((doc) => (
              <tr
                key={doc.$id}
                className="hover:bg-sky-50/20 transition-colors group"
              >
                <td className="p-4 text-sm font-semibold text-slate-700">
                  {doc.userId || (
                    <span className="text-slate-300 italic">None</span>
                  )}
                </td>
                <td className="p-4 text-sm font-semibold text-slate-700">
                  {doc.fullName || (
                    <span className="text-slate-300 italic">None</span>
                  )}
                </td>
                <td className="p-4 text-sm font-semibold text-slate-700">
                  {doc.course || (
                    <span className="text-slate-300 italic">None</span>
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
                    {doc.civilStatus === "SingleParent"
                      ? "Single Parent"
                      : doc.civilStatus === "WidowWidower"
                        ? "Widow / Widower"
                        : doc.civilStatus || "unspecified"}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(doc.$createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(doc.$updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
