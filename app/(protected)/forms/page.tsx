"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { LuFileInput, LuSearch } from "react-icons/lu";
import TracerTable from "@/components/admin/accounts/AccountsTable";

export default function Forms() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";

  const updateQueryParams = (updates: { page?: number; search?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.page !== undefined) {
      params.set("page", updates.page.toString());
    }

    if (updates.search !== undefined) {
      if (updates.search) {
        params.set("search", updates.search);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-accent">
            Forms
          </h1>
          <p className="text-sm text-foreground">
            A list of tracer forms submitted to the system.
          </p>
        </div>
      </header>

      <div className="w-full flex flex-col gap-4 justify-center items-center">
        <div className="w-full bg-white rounded-2xl border border-sky-100 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex items-center gap-3">
          <LuSearch className="text-slate-400 shrink-0" size={20} />
          <input
            type="text"
            placeholder="Search tracer forms..."
            defaultValue={searchQuery}
            onChange={(e) => updateQueryParams({ search: e.target.value })}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none border-none focus:ring-0"
          />
        </div>

        <TracerTable
          currentPage={currentPage}
          searchQuery={searchQuery}
          onPageChange={(page) => updateQueryParams({ page })}
        />
      </div>
    </>
  );
}
