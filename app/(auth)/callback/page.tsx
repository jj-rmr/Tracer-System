"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite/appwrite-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        // 1. Get the currently authenticated Appwrite user
        const user = await account.get();

        // 2. Validate institutional email
        if (!user.email.toLowerCase().endsWith("@parsu.edu.ph")) {
          await account.deleteSession("current");

          router.replace("/signin?error=unauthorized_domain");
          return;
        }

        // 3. Check user labels
        const labels = (user.labels as string[]) || [];
        const isAdmin = labels.includes("ADMIN");

        // 4. Determine destination
        const destination = redirectParam
          ? decodeURIComponent(redirectParam)
          : isAdmin
            ? "/admin"
            : "/alumni";

        // 5. Full page redirect
        window.location.href = destination;
      } catch (err) {
        console.error("OAuth callback error:", err);

        setError("Session verification failed. Redirecting...");

        setTimeout(() => {
          router.replace("/signin?error=oauth_failed");
        }, 1500);
      }
    }

    processCallback();
  }, [router, redirectParam]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />

            <p className="text-sm font-medium text-slate-600">
              Completing sign in...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
