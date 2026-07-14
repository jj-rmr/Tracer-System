// src/app/admin/accounts/AccountsPageClient.tsx
"use client";

import AccountsTable from "@/components/admin/accounts/AccountsTable";
import { useEffect, useState } from "react";

interface AccountsPageClientProps {
  currentUserId: string;
}

export default function AccountsPageClient({
  currentUserId,
}: AccountsPageClientProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Accounts</h1>
          <p className="text-slate-500">
            Manage administrator and alumni accounts.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full md:w-80 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>
      <div className="w-full pt-6">
        <AccountsTable
          currentPage={currentPage}
          searchQuery={searchQuery}
          onPageChange={setCurrentPage}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
