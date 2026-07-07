"use client";

import React, { useState } from "react";
import { useSignUp, useAppwrite } from "@appwrite.io/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const sdk = useAppwrite();
  const { emailPassword, isPending: isSignUpPending } = useSignUp();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [extensionName, setExtensionName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [pipelineStage, setPipelineStage] = useState<
    "idle" | "creating" | "authenticating"
  >("idle");

  const isProcessing = isSignUpPending || pipelineStage !== "idle";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        const cleanExt = ext.replace(/\.$/, "");
        formattedExtension = cleanExt.toUpperCase();
      } else {
        setError(
          "Invalid Extension Name. Only Jr., Sr., or Roman numerals (I, II, III...) are allowed.",
        );
        return;
      }
    }

    const formattedFullName = [
      lastName.trim() + ",",
      firstName.trim(),
      middleName.trim(),
      formattedExtension,
    ]
      .filter(Boolean)
      .join(" ");

    setPipelineStage("creating");

    emailPassword({
      name: formattedFullName,
      email,
      password,
      onSuccess: async () => {
        setPipelineStage("authenticating");

        try {
          await sdk.account.createEmailPasswordSession(email, password);

          router.refresh();
          router.replace("/verify-email");
        } catch (loginErr: any) {
          console.error("Implicit login failed:", loginErr);
          setPipelineStage("idle");
          setError(
            "Account created successfully, but we couldn't log you in automatically. Please go to the Sign In page.",
          );
        }
      },
      onError: (err: any) => {
        setPipelineStage("idle");
        setError(err?.message || "Failed to create account. Please try again.");
      },
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white md:rounded-2xl md:shadow-xl md:border border-slate-100 p-8 md:p-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-sans">
          Create Account
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Join the Tracer System by ParSU Placement Unit
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
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
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
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
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
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
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
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
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
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
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
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
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-2xl bg-sky-400 hover:bg-sky-500 text-white font-medium shadow-md shadow-sky-200 hover:shadow-lg transition duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>
                {pipelineStage === "creating"
                  ? "Creating account..."
                  : "Logging in & securing session..."}
              </span>
            </>
          ) : (
            <span>Register Now</span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-8">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-sky-400 hover:text-sky-500 transition"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
