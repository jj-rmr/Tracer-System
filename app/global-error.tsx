"use client";

import "./globals.css";

import { useLayoutEffect } from "react";

import { Button } from "@/components/ui/button";

function applySavedPreferences() {
  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem("tracer-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const followsSystem = savedTheme !== "light" && savedTheme !== "dark";
  const isDark = savedTheme === "dark" || (followsSystem && prefersDark);
  const savedColorTheme = window.localStorage.getItem("tracer-color-theme");
  const colorTheme =
    savedColorTheme === "monotone"
      ? "gray"
      : savedColorTheme === "green" ||
          savedColorTheme === "purple" ||
          savedColorTheme === "gray"
        ? savedColorTheme
        : "blue";

  root.classList.toggle("dark", isDark);
  root.classList.toggle(
    "reduce-motion",
    window.localStorage.getItem("tracer-reduce-motion") === "true",
  );
  root.dataset.colorTheme = colorTheme;
  root.style.colorScheme = isDark ? "dark" : "light";
  root.style.backgroundColor = isDark ? "#020617" : "#f8fafc";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark ? "#020617" : "#f8fafc");
}

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useLayoutEffect(() => {
    try {
      applySavedPreferences();
    } catch {}
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <title>System error - Placement Tracer System</title>
        <meta name="theme-color" content="#f8fafc" />
      </head>
      <body className="grid min-h-full place-items-center bg-background p-5 text-foreground">
        <main className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
          <h1 className="text-xl font-semibold">
            Something went wrong on our end
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We couldn&apos;t load the system. Your existing records were not
            changed.
          </p>
          <Button className="mt-5" variant="outline" onClick={unstable_retry}>
            Refresh system
          </Button>
        </main>
      </body>
    </html>
  );
}
