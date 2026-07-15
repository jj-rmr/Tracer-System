"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Role } from "@/types";

interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServerDataResponse {
  accounts: Account[];
  success: boolean;
}

interface AccountsTableProps {
  currentPage: number;
  searchQuery: string;
  onPageChange: (page: number) => void;
  currentUserId: string;
}

export default function AccountsTable({
  currentPage,
  searchQuery,
  onPageChange,
  currentUserId,
}: AccountsTableProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const router = useRouter();

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/accounts", {
          cache: "no-store",
          credentials: "include",
        });

        const data: ServerDataResponse = await res.json();

        if (!res.ok) {
          throw new Error("Failed to load accounts.");
        }

        let filtered = data.accounts ?? [];

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();

          filtered = filtered.filter(
            (account) =>
              account.name.toLowerCase().includes(query) ||
              account.email.toLowerCase().includes(query),
          );
        }

        setTotalRows(filtered.length);

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        setAccounts(filtered.slice(start, end));
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(fetchAccounts, 300);

    return () => clearTimeout(timeout);
  }, [currentPage, searchQuery]);

  const confirmDelete = async (id: string) => {
    setShowDeleteModal(false);

    try {
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to delete account.");
      }

      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setTotalRows((prev) => prev - 1);

      setAccountToDelete(null);

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 text-sky-600 font-medium w-full">
        <svg
          className="animate-spin h-6 w-6 mr-3 border-4 border-sky-200 border-t-sky-600 rounded-full"
          viewBox="0 0 24 24"
        />
        <span>Loading accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 w-full text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100 shadow-sm"
        role="alert"
      >
        <span className="font-bold">Error:</span> {error}
      </div>
    );
  }

  if (totalRows === 0) {
    return (
      <div className="text-center w-full p-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        No accounts found.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / itemsPerPage));

  return (
    <div className="text-sm w-full bg-white rounded-3xl border border-sky-100 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-sky-200">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs uppercase tracking-wider text-slate-400">
                Full Name
              </th>

              <th className="p-4 text-xs uppercase tracking-wider text-slate-400">
                Email
              </th>

              <th className="p-4 text-xs uppercase tracking-wider text-slate-400 text-center">
                Role
              </th>

              <th className="p-4 text-xs uppercase tracking-wider text-slate-400 text-center">
                Verified
              </th>

              <th className="p-4 text-xs uppercase tracking-wider text-slate-400">
                Created
              </th>

              <th className="p-4 text-xs uppercase tracking-wider text-slate-400">
                Updated
              </th>

              <th className="p-4 text-xs uppercase tracking-wider text-slate-400 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {accounts.map((account) => (
              <tr
                key={account.id}
                className="hover:bg-sky-50/20 transition-colors"
              >
                <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                  {account.name || (
                    <span className="italic text-slate-400">Unnamed User</span>
                  )}
                </td>

                <td className="p-4 text-slate-600">{account.email}</td>

                <td className="p-4">
                  <div className="flex items-center justify-center">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                        account.role === "Admin"
                          ? "bg-violet-50 text-violet-700 border border-violet-100"
                          : "bg-sky-50 text-sky-700 border border-sky-100"
                      }`}
                    >
                      {account.role}
                    </span>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-center">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                        account.verified
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}
                    >
                      {account.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </td>

                <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(account.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>

                <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(account.updatedAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/admin/accounts/${account.id}`}
                      className="font-semibold px-4 py-2 rounded-xl bg-sky-100 text-sky-400 hover:bg-sky-200 transition-colors"
                    >
                      View
                    </Link>
                    {account.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="font-semibold px-4 py-2 rounded-xl bg-red-100 text-red-400 hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Account?
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to permanently delete this account? This
              action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setAccountToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  accountToDelete && confirmDelete(accountToDelete)
                }
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/10 text-sm">
        {totalRows > 1 ? (
          <span className="text-sky-600 py-2 px-4 bg-sky-50 rounded-lg font-semibold">
            Showing <span className="">{accounts.length}</span> of{" "}
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
            disabled={currentPage <= 1}
            className={`rounded-xl border px-4 py-2 text-xs font-medium transition ${
              currentPage > 1
                ? "border-slate-300 bg-white hover:bg-slate-50 cursor-pointer"
                : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            }`}
          >
            Previous
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`rounded-xl border px-4 py-2 text-xs font-medium transition ${
              currentPage < totalPages
                ? "border-slate-300 bg-white hover:bg-slate-50 cursor-pointer"
                : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
