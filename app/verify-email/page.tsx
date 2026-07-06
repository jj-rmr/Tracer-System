"use client";

import { useState } from "react";
import { useSignOut, useAppwrite } from "@appwrite.io/react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { signOut, isPending: isLogOutPending } = useSignOut();

  const sdk = useAppwrite();

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setError(null);

    try {
      const verificationUrl = `${window.location.origin}/confirm-verification`;

      await sdk.account.createEmailVerification({
        url: verificationUrl,
      });

      setSent(true);
    } catch (err: any) {
      console.error("Verification failed to send:", err);
      setError(
        err?.message || "Failed to send verification email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({
      onSuccess: () => {
        router.refresh();
        router.push("/signin");
      },
      onError: (err: any) => {
        console.error("Logout failed:", err);
        setError("Failed to log out correctly.");
      },
    });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Verify Your Email
        </h1>
        <p className="text-sm text-slate-500 mt-3">
          Before accessing the ParSU Tracer System dashboard, you must verify
          your email address via the link sent to your inbox.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 animate-in fade-in duration-200">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={handleResend}
            disabled={loading || sent || isLogOutPending}
            className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-500 text-white font-medium shadow-md shadow-sky-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {sent
              ? "Verification Email Sent!"
              : loading
                ? "Sending..."
                : "Resend Verification Email"}
          </button>

          <button
            onClick={handleLogout}
            disabled={isLogOutPending || loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLogOutPending ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
