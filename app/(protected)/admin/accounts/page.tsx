"use client";

import { SearchInput } from "@/components/ui/search-input";

import { useEffect, useState } from "react";
import AccountsTable from "@/components/admin/accounts/AccountsTable";
import ExportButton from "@/components/admin/ExportButton";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { SelectField } from "@/components/forms/SelectField";
import type { Role } from "@/types";

export default function AccountsPage() {
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 200);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserId, setCurrentUserId] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me-id");

        if (!res.ok) return;

        const { data } = await res.json();
        setCurrentUserId(data.id);
      } catch {}
    }

    loadCurrentUser();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-5 shadow-lg  md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Accounts
          </h1>
          <p className="text-muted-foreground">
            Manage administrator and alumni accounts.
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <ExportButton baseUrl="/api/admin/accounts/export" />
          <label className="flex-1">
            <SearchInput
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="w-full md:max-w-xs">
          <SelectField
            id="account-role-filter"
            label="Filter by role"
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value as Role | "");
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All roles" },
              { value: "admin", label: "Administrators" },
              { value: "alumni", label: "Alumni" },
            ]}
            placeholder="All roles"
          />
        </div>
      </section>

      <AccountsTable
        currentPage={currentPage}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
        currentUserId={currentUserId}
        roleFilter={roleFilter}
      />
    </div>
  );
}
