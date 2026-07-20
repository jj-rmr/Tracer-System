"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuLoaderCircle, LuX } from "react-icons/lu";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cooldown, setCooldown] = useState(0);

  const verificationAttempted = useRef(false);

  async function triggerVerification() {
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          router.replace("/");
          return;
        }

        setError(data.message ?? "Failed to send verification email.");
        return;
      }

      setSent(true);
      setCooldown(60);
    } catch {
      setError("Failed to send verification email.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!verificationAttempted.current) {
      verificationAttempted.current = true;
      triggerVerification();
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || sending) return;
    triggerVerification();
  };

  async function handleLogout() {
    setIsLoggingOut(true);
    setError(null);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/signin");
      router.refresh();
    } catch {
      setError("Failed to log out.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white px-4 py-8 text-center shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:px-8">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
          sending
            ? "bg-sky-50 text-sky-400 animate-pulse"
            : sent
              ? "bg-emerald-50 text-emerald-500"
              : "bg-sky-50 text-sky-600"
        }`}
      >
        {sending ? (
          <LuLoaderCircle size={32} className="animate-spin" />
        ) : sent ? (
          <LuCheck size={32} />
        ) : (
          <LuX size={32} />
        )}
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {sending
          ? "Sending Verification..."
          : sent
            ? "Verification Sent!"
            : "Verify Your Email"}
      </h1>
      <p className="text-sm text-slate-500 mt-3">
        Before accessing the ParSU Tracer System dashboard, you must verify your
        email address via the link sent to your inbox.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-500 animate-in fade-in duration-200">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        <button
          onClick={handleResend}
          disabled={sending || isLoggingOut || cooldown > 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {sending
            ? "Sending..."
            : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend Verification Email"}
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </button>
      </div>
    </div>
  );
}
