"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuCircleAlert, LuLoaderCircle } from "react-icons/lu";
import { Dropdown } from "@/components/Dropdown";

export default function SignUpPage() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const isProcessing = isPending;

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [extensionName, setExtensionName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!email.toLowerCase().endsWith("@parsu.edu.ph")) {
      setError(
        "Access denied. Only ParSU institutional email addresses are allowed.",
      );
      return;
    }

    let formattedExtension = "";
    const ext = extensionName.trim();

    if (ext) {
      const isJrSr = /^(jr|sr)\.?$/i.test(ext);
      const isRomanNumeral = /^[ivxldcm]+\.?$/i.test(ext);

      if (isJrSr) {
        const cleanExt = ext.replace(/\.$/, "");

        formattedExtension =
          cleanExt.charAt(0).toUpperCase() +
          cleanExt.slice(1).toLowerCase() +
          ".";
      } else if (isRomanNumeral) {
        formattedExtension = ext.replace(/\.$/, "").toUpperCase();
      } else {
        setError(
          "Invalid Extension Name. Only Jr., Sr., or Roman numerals (I, II, III...) are allowed.",
        );
        return;
      }
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          extensionName: formattedExtension,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Failed to create account.");
        return;
      }

      router.replace("/verify-email");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white px-4 py-8 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Create Account
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Join the Tracer System by ParSU Placement Unit
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-500 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <LuCircleAlert size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isProcessing}
              placeholder="John"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="middleName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Middle Name{" "}
              <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <input
              id="middleName"
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              disabled={isProcessing}
              placeholder="Smith"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isProcessing}
              placeholder="Doe"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="extensionName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Extension Name{" "}
              <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <input
              id="extensionName"
              type="text"
              value={extensionName}
              onChange={(e) => setExtensionName(e.target.value)}
              disabled={isProcessing}
              placeholder="Jr. / III"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isProcessing}
            placeholder="name@parsu.edu.ph"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Password *
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isProcessing}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <LuLoaderCircle className="h-5 w-5 animate-spin text-white" />

              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Tracer Account</span>
          )}
        </button>
      </form>
      <p className="text-center text-xs mt-4">
        By creating an account, you certify that you are a graduate of Partido
        State University and consent to the collection and use of your data
        solely for this tracer study. Your information will be handled securely
        in compliance with the Data Privacy Act.
      </p>
      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-sky-600 transition-colors duration-200 hover:text-sky-700"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
