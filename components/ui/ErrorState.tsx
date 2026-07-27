"use client";

import { LuRefreshCw } from "react-icons/lu";

import { Button } from "@/components/ui/button";

export default function ErrorState({
  title = "Something went wrong on our end",
  message,
  onRetry,
  retryLabel = "Refresh",
  retrying = false,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
}) {
  return (
    <div
      className="w-full rounded-2xl border border-border bg-muted/50 p-6 text-center shadow-sm"
      role="alert"
    >
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="outline-elevated"
          className="mt-4"
          disabled={retrying}
          onClick={onRetry}
        >
          <LuRefreshCw className={retrying ? "animate-spin" : undefined} />
          {retrying ? "Refreshing..." : retryLabel}
        </Button>
      )}
    </div>
  );
}
