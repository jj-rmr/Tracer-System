"use client";

import { useEffect, useState } from "react";

interface UserProfileDocument {
  $id: string;
  userId: string;
  civilStatus: string;
  $createdAt: string;
  $updatedAt: string;
}

export default function UserDatabaseTable() {
  const [documents, setDocuments] = useState<UserProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRows() {
      try {
        setLoading(true);

        const res = await fetch("/api/user-profiles", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();
        console.log(data);

        if (!res.ok) {
          throw new Error(
            data.message ?? "Failed to fetch Appwrite documents.",
          );
        }

        setDocuments(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRows();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 text-sky-600 font-medium">
        <svg
          className="animate-spin h-6 w-6 mr-3 border-4 border-sky-200 border-t-sky-600 rounded-full"
          viewBox="0 0 24 24"
        />
        <span>Fetching records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 mx-auto max-w-2xl text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100 shadow-sm"
        role="alert"
      >
        <span className="font-bold">Appwrite Sync Error:</span> {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 max-w-2xl mx-auto">
        No user profile rows found in this collection.
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-sky-100 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            User Registrations
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            Appwrite Collection Registry
          </p>
        </div>

        <span className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-full border border-sky-100">
          {documents.length} {documents.length === 1 ? "Row" : "Rows"}
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
                Civil Status
              </th>

              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Document ID
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

                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium uppercase
                    ${
                      doc.civilStatus?.toLowerCase() === "single"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : doc.civilStatus?.toLowerCase() === "married"
                          ? "bg-violet-50 text-violet-700 border border-violet-100"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {doc.civilStatus || "Unspecified"}
                  </span>
                </td>

                <td className="p-4 text-xs font-mono text-slate-400">
                  {doc.$id}
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
    </div>
  );
}
