"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-background p-5 text-foreground">
        <main className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
          <h1 className="text-xl font-semibold">
            Something went wrong on our end
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We couldn’t load the system. Your existing records were not changed.
          </p>
          <Button className="mt-5" variant="outline" onClick={unstable_retry}>
            Refresh system
          </Button>
        </main>
      </body>
    </html>
  );
}
