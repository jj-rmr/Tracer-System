"use client";

import ResponseTable from "@/components/responses/ResponseTable";
import ManualResponseModal from "@/components/admin/responses/ManualResponseModal";
import { useState } from "react";
import { LuDownload, LuPlus, LuSearch } from "react-icons/lu";

export default function ResponsesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showManualResponse, setShowManualResponse] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col flex-wrap gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Responses
          </h1>

          <p className="text-slate-500">View and manage alumni tracer forms.</p>
        </div>
        <div className="flex flex-col-reverse gap-2 md:flex-row">
          <button
            type="button"
            onClick={() => setShowManualResponse(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition-all duration-200 hover:bg-sky-50 hover:shadow-md"
          >
            <LuPlus size={16} />
            Add Manual Response
          </button>
          <button
            onClick={() => {
              window.location.href = "/api/admin/responses/export";
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
          </label>
        </div>
      </div>

      <ResponseTable
        key={tableKey}
        currentPage={currentPage}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
      />

      {showManualResponse && (
        <ManualResponseModal
          onClose={() => setShowManualResponse(false)}
          onComplete={() => {
            setShowManualResponse(false);
            setCurrentPage(1);
            setTableKey((current) => current + 1);
          }}
        />
      )}
    </div>
  );
}
