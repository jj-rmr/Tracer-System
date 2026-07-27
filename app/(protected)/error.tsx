"use client";

import { useEffect } from "react";

import ErrorState from "@/components/ui/ErrorState";

export default function ProtectedAreaError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => console.error("Protected area error", error), [error]);

  return (
    <div className="mx-auto flex min-h-[60dvh] w-full max-w-3xl items-center px-5">
      <ErrorState
        message="We couldn’t retrieve this section right now. Your existing records were not changed."
        retryLabel="Refresh this section"
        onRetry={unstable_retry}
      />
    </div>
  );
}
