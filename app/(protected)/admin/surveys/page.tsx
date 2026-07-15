"use client";

import SurveyTable from "@/components/surveys/SurveyTable";
import { useState } from "react";

export default function SurveyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Survey Entries</h1>

          <p className="text-slate-500">View and manage alumni tracer forms.</p>
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-2">
          <button
            onClick={() => {
              window.location.href = "/api/admin/surveys/export";
            }}
            className={`px-4 py-2 whitespace-nowrap disabled:bg-sky-200 bg-sky-500 text-white text-sm rounded-xl font-semibold hover:bg-sky-700 transition-colors duration-300`}
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
      </div>

      <SurveyTable
        currentPage={currentPage}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
