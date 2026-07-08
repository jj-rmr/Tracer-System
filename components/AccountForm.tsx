"use client"; // This tells Next.js this component runs in the browser

import { useState } from "react";

export default function AccountForm({ initialUser }: { initialUser: any }) {
  // Use state so the input fields are editable
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call a Server Action to save the updated data
    console.log("Saving updates:", { name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Name Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
          placeholder="John Doe"
        />
      </div>

      {/* Email Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto self-start px-6 py-3 bg-sky-500 text-white font-medium rounded-2xl hover:bg-sky-600 transition duration-150"
      >
        Save Changes
      </button>
    </form>
  );
}
