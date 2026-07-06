// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { createNextServerHelpers } from "@appwrite.io/react/server/next";
import { appwriteConfig, hasAppwriteConfig } from "@/app/config/appwrite";
import Nav from "@/components/Nav";

const appwrite = {
  endpoint: appwriteConfig.endpoint,
  projectId: appwriteConfig.projectId,
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const helpers = hasAppwriteConfig()
    ? createNextServerHelpers(appwrite)
    : null;

  // Validate real-time server-side authentication state
  const user = helpers ? await helpers.getLoggedInUser() : null;

  // 1. URL Bypass Shield: Send them to login instantly if the session token is absent/invalid
  if (!user) {
    redirect("/signin");
  }

  // 2. Verification Shield: Catch unverified users attempting to access dashboard via URL
  if (user.emailVerification === false) {
    redirect("/verify-email");
  }

  return (
    <div className="flex flex-col md:flex-row h-dvh w-screen bg-white overflow-hidden">
      <Nav />
      <main className="flex flex-col items-center justify-start flex-1 scrollbar-gutter-stable overflow-y-auto text-accent px-4">
        <div className="w-full max-w-6xl h-fit flex-1 py-8 pb-25 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
