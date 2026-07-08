"use client";

import React, { useState } from "react";
import { useSignIn } from "@appwrite.io/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignInButton } from "@/components/SignInButton";

export default function SignInPage() {
  const router = useRouter();

  const { emailPassword, isPending: isSignInPending } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!email.toLowerCase().endsWith("@parsu.edu.ph")) {
      setError(
        "Access denied. Only ParSU institutional email addresses are allowed.",
      );
      return;
    }

    emailPassword({
      email,
      password,
      onSuccess: async (data: any) => {
        if (data?.emailVerification === false) {
          router.refresh();
          router.push("/verify-email");
          return;
        }

        router.refresh();
        router.replace("/");
      },
      onError: (err: any) => {
        const errorMessage = err?.message?.toLowerCase() || "";

        if (
          err?.code === 409 ||
          errorMessage.includes("already exists") ||
          errorMessage.includes("registered")
        ) {
          setError(
            "An account with this email already exists. Please go to the Sign In page to access your account or verify your email.",
          );
          return;
        }

        setError(
          err?.message || "Failed to sign in. Please check your credentials.",
        );
      },
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white md:rounded-2xl md:shadow-xl md:border border-slate-100 p-8 md:p-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-sans">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Tracer System by ParSU Placement Unit
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
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSignInPending}
            placeholder="name@parsu.edu.ph"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSignInPending}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-150 disabled:opacity-60 bg-slate-50 focus:bg-white"
          />
        </div>

        <SignInButton isPending={isSignInPending} />
      </form>

      <p className="text-center text-sm text-slate-500 mt-8">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-sky-400 hover:text-sky-500 active:scale-95 transition-[color,scale] duration-300 cursor-pointer"
        >
          Create one now
        </Link>
      </p>
    </div>
  );
}
