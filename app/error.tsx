"use client";

import { useEffect } from "react";

import ErrorState from "@/components/ui/ErrorState";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => console.error("Application route error", error), [error]);

  return (
    <main className="mx-auto flex min-h-[60dvh] w-full max-w-3xl items-center px-5">
      <ErrorState
        message="We couldn’t load this part of the system. Your existing records were not changed."
        onRetry={unstable_retry}
      />
    </main>
  );
}
