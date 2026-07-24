"use client";

import { useEffect, useState } from "react";

interface LoadingStateProps {
  message?: string;
  delayMs?: number;
  className?: string;
  fullPage?: boolean;
}

export default function LoadingState({
  message = "Loading...",
  delayMs = 200,
  className = "",
  fullPage = false,
}: LoadingStateProps) {
  const [visible, setVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full items-center justify-center ${
        fullPage ? "h-full min-h-[50dvh]" : "min-h-48"
      } ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-3 text-center text-sky-600">
        <div
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500"
        />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
