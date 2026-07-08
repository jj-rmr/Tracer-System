// providers.tsx
"use client";

import { AppwriteProvider } from "@appwrite.io/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({
  session,
  children,
}: {
  session?: string | null;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppwriteProvider
        endpoint={process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!}
        projectId={process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!}
        ssr={{ session, basePath: "/api/appwrite" }}
      >
        {children}
      </AppwriteProvider>
    </QueryClientProvider>
  );
}
