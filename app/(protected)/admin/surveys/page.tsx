"use client";

import SurveyTable from "@/components/surveys/SurveyTable";
import { useState } from "react";

export default function SurveyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Survey Entries</h1>

          <p className="text-slate-500">View and manage alumni tracer forms.</p>
        </div>
        <button
          onClick={() => {
            window.location.href = "/api/admin/surveys/export";
          }}
        >
          Export CSV
        </button>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-80 rounded-xl border border-slate-200 px-4 py-2"
        />
      </div>

      <SurveyTable
        currentPage={currentPage}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
