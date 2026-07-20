"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LuCircleAlert } from "react-icons/lu";

import { SignInButton } from "@/components/SignInButton";
import { Role, ROLES } from "@/types";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const [isPending, setIsPending] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!email.toLowerCase().endsWith("@parsu.edu.ph")) {
      setError("Please use your ParSU email address to sign in.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError("Incorrect email or password. Please try again.");
        return;
      }

      const meResponse = await fetch("/api/auth/me");
      const me = await meResponse.json();

      const user = me.data;
      const labels = user?.labels ?? [];

      const isAdmin = labels.some((label: Role) => label === ROLES.ADMIN);

      if (redirect) {
        router.replace(decodeURIComponent(redirect));
        return;
      }

      if (me.success && user && !user.emailVerification) {
        router.replace("/verify-email");
        return;
      }

      router.replace(isAdmin ? "/admin" : "/alumni");
    } catch (err) {
      setError("Unable to sign in right now. Please try again in a moment.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Welcome Back
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Tracer System by ParSU Placement Unit
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-500 shadow-sm">
          <div className="flex items-center gap-2">
            <LuCircleAlert size={20} className="shrink-0" />

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
            disabled={isPending}
            placeholder="name@parsu.edu.ph"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
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
            disabled={isPending}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
          />
        </div>

        <SignInButton isPending={isPending} />
      </form>

      <p className="text-center text-sm text-slate-500 mt-8">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-sky-600 transition-colors duration-200 hover:text-sky-700"
        >
          Create one now
        </Link>
      </p>
    </div>
  );
}
