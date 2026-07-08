"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppwrite } from "@appwrite.io/react";

export default function ConfirmVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sdk = useAppwrite();

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
      setErrorMsg("Invalid or missing verification tokens in link.");
      return;
    }

    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const completeVerification = async () => {
      try {
        await sdk.account.updateEmailVerification({
          userId,
          secret,
        });

        setStatus("success");
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      } catch (err: any) {
        console.error("Verification confirmation failed:", err);
        setStatus("error");
        setErrorMsg(err?.message || "Failed to complete email verification.");
      }
    };

    completeVerification();
  }, [searchParams, sdk, router]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        {status === "verifying" && (
          <>
            <div className="animate-spin h-10 w-10 text-sky-500 border-4 border-slate-200 border-t-current rounded-full mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">
              Confirming Verification...
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Finishing up with Appwrite servers.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Account Verified!
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Redirecting you to the dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Verification Failed
            </h1>
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 mt-3">
              {errorMsg}
            </p>
            <button
              onClick={() => router.push("/verify-email")}
              className="mt-6 text-sm text-sky-500 font-medium hover:underline cursor-pointer"
            >
              Back to retry link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
