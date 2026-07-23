"use client";

import Nav from "@/components/Nav";
import { ToastProvider } from "@/components/Toast";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {(role) => (
        <div className="flex h-svh w-screen overflow-hidden">
          <ToastProvider>
            <Nav role={role} />

            <main className="flex-1 overflow-y-auto scrollbar-gutter-stable px-4">
              <div className="mx-auto min-h-full w-full max-w-6xl py-8 pb-26 md:px-4 md:pb-8">
                {children}
              </div>
            </main>
          </ToastProvider>
        </div>
      )}
    </AuthGuard>
  );
}
