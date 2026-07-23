"use client";

import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { LuCircleAlert } from "react-icons/lu";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  function handleGoogleSignIn() {
    window.location.href = "/api/auth/oauth";
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Tracer System by ParSU Placement Unit
        </p>
      </div>

      {error === "unauthorized_domain" && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-500 shadow-sm">
          <div className="flex items-center gap-2">
            <LuCircleAlert size={20} className="shrink-0" />

            <span>Please use your official @parsu.edu.ph Google account.</span>
          </div>
        </div>
      )}

      {error === "oauth_failed" && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-500 shadow-sm">
          <div className="flex items-center gap-2">
            <LuCircleAlert size={20} className="shrink-0" />

            <span>
              Google sign-in failed or was cancelled. Please try again.
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
      >
        <FcGoogle size={24} />
        <span>Continue with Google</span>
      </button>

      <p className="mt-8 text-center text-sm text-slate-500">
        Use your official ParSU Google account to access the Tracer System.
      </p>
    </div>
  );
}
