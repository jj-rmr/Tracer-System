// app/(dashboard)/layout.tsx
import Nav from "@/components/Nav";
import { getCurrentUser, getSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

const session = await getSessionCookie();
const user = await getCurrentUser(session);

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!user) {
    redirect("/signin");
  }

  if (!user.emailVerification) {
    redirect("/verify-email");
  }
  return (
    <div className="flex flex-col md:flex-row h-dvh w-screen overflow-hidden">
      <Nav />
      <main className="flex flex-col items-center justify-start flex-1 scrollbar-gutter-stable overflow-y-auto text-accent px-4">
        <div className="w-full max-w-6xl h-fit flex-1 py-8 pb-25 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
