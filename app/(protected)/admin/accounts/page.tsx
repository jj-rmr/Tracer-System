// src/app/admin/accounts/page.tsx

"use client";

import { useEffect, useState } from "react";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Accounts</h1>
          <p className="text-slate-500">
            Manage administrator and alumni accounts.
          </p>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-2">
          <button
            onClick={() => {
              window.location.href = "/api/admin/accounts/export";
            }}
            className={`px-4 py-2 whitespace-nowrap disabled:bg-sky-200 bg-sky-500 text-white text-sm rounded-xl font-semibold hover:bg-sky-700 transition-colors duration-300`}
          >
            Export CSV
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full md:w-80 rounded-xl border border-slate-200 px-4 py-2"
          />
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
