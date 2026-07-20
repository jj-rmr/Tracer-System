// src/app/admin/accounts/page.tsx

"use client";

import { useEffect, useState } from "react";
import { LuDownload, LuSearch } from "react-icons/lu";
import AccountsTable from "@/components/admin/accounts/AccountsTable";

export default function AccountsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 50);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me-id");

        if (!res.ok) return;

        const { data } = await res.json();
        setCurrentUserId(data.id);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    }

    loadCurrentUser();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Accounts
          </h1>
          <p className="text-slate-500">
            Manage administrator and alumni accounts.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 md:flex-row">
          <button
            onClick={() => {
              window.location.href = "/api/admin/accounts/export";
            }}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md"
          >
            <LuDownload size={16} />
            Export CSV
          </button>
          <label className="relative w-full md:w-80">
            <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
          </label>
        </div>
      </div>

      <AccountsTable
        currentPage={currentPage}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
        currentUserId={currentUserId}
      />
    </div>
  );
}
