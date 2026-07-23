"use client";

import { account } from "@/lib/appwrite/appwrite-client";
import { OAuthProvider } from "appwrite";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const redirect = searchParams.get("redirect") || "";

  const handleGoogleSignIn = () => {
    // 1. Where Appwrite should redirect the user after Google approves login
    const successUrl = `${window.location.origin}/callback${
      redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
    }`;

    // 2. Where Appwrite should redirect if Google login fails/cancels
    const failureUrl = `${window.location.origin}/signin?error=oauth_failed`;

    // 3. Trigger Google OAuth redirect
    account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in with your official ParSU Google account to continue.
          </p>
        </div>

        {/* Error Alert Box */}
        {error === "unauthorized_domain" && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
            Access Restricted. Please sign in using your official{" "}
            <strong>@parsu.edu.ph</strong> email address.
          </div>
        )}

        {error === "oauth_failed" && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
            Google Sign-In failed or was cancelled. Please try again.
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
