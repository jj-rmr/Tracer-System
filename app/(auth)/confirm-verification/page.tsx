"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuCheck, LuLoaderCircle, LuX } from "react-icons/lu";

export default function ConfirmVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionMismatch, setSessionMismatch] = useState(false);

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const verificationStarted = useRef(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId || !secret) {
      setStatus("error");
      setErrorMsg(
        "This verification link is invalid or has expired. Please request a new verification email.",
      );
      return;
    }

    if (verificationStarted.current) return;
    verificationStarted.current = true;

    async function completeVerification() {
      try {
        const response = await fetch("/api/auth/confirm-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            secret,
          }),
        });

        const data = await response.json();

        if (response.status === 401) {
          const redirect = encodeURIComponent(
            `/confirm-verification?userId=${userId}&secret=${secret}`,
          );

          router.replace(`/signin?redirect=${redirect}`);
          return;
        }

        if (response.status === 409 && data.code === "SESSION_MISMATCH") {
          setSessionMismatch(true);
          setStatus("error");
          setErrorMsg(
            "You're signed in to a different account. Sign out first, then sign in with the account that received this verification email.",
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ??
              "We couldn't verify your email. Please try again or request a new verification email.",
          );
        }

        setStatus("success");

        setTimeout(async () => {
          const meResponse = await fetch("/api/auth/me");
          const me = await meResponse.json();

          if (!me.success || !me.data) {
            router.replace("/");
            return;
          }

          const labels = me.data.labels ?? [];

          const isAdmin = labels.some(
            (label: string) => label.toLowerCase() === "admin",
          );

          router.replace(isAdmin ? "/admin" : "/alumni");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setErrorMsg(
          error?.message ??
            "Something went wrong while verifying your email. Please try again in a few moments.",
        );
      }
    }

    completeVerification();
  }, [router, searchParams]);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      const redirect = encodeURIComponent(
        window.location.pathname + window.location.search,
      );

      router.replace(`/signin?redirect=${redirect}`);
    } catch {
      setErrorMsg("We couldn't sign you out right now. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white px-4 py-8 text-center shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 md:px-8">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
          status === "verifying"
            ? "bg-sky-50 text-sky-400 animate-pulse"
            : status === "success"
              ? "bg-emerald-50 text-emerald-500"
              : "bg-red-50 text-red-500"
        }`}
      >
        {status === "verifying" ? (
          <LuLoaderCircle size={32} className="animate-spin" />
        ) : status === "success" ? (
          <LuCheck size={32} />
        ) : (
          <LuX size={32} />
        )}
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {status === "verifying"
          ? "Verifying Your Email..."
          : status === "success"
            ? "Email Verified!"
            : sessionMismatch
              ? "You're Signed In to Another Account"
              : "Verification Unsuccessful"}
      </h1>

      <p className="text-sm text-slate-500 mt-3">
        {status === "verifying"
          ? "Please wait while we confirm your email address."
          : status === "success"
            ? "Your email has been verified successfully. You'll be redirected to your dashboard shortly."
            : sessionMismatch
              ? "To verify this email address, you'll need to sign out of your current account first."
              : "We couldn't verify your email using this link."}
      </p>

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-center justify-center">
            <div>
              <h2 className="text-sm font-semibold text-red-500">
                {sessionMismatch
                  ? "Action Required"
                  : "Verification Could Not Be Completed"}
              </h2>
              <p className="text-sm text-red-500 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {status === "error" &&
          (sessionMismatch ? (
            <button
              onClick={handleSignOut}
              className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sign Out and Continue
            </button>
          ) : (
            <button
              onClick={() => router.push("/verify-email")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
            >
              Back to Verify Email
            </button>
          ))}
      </div>
    </div>
  );
}
