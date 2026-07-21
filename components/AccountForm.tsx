"use client";

import { useState } from "react";
import { LuSave } from "react-icons/lu";

export default function AccountForm({ initialUser }: { initialUser: any }) {
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving updates:", { name, email });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
            placeholder="John Doe"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 self-start rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-auto"
        >
          <LuSave size={18} />
          Save Changes
        </button>
      </form>
    </div>
  );
}
