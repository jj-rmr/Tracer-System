import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { ToastProvider } from "@/components/Toast";
import { requireVerifiedUser, getRole } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireVerifiedUser();
  const role = getRole(user);

  if (!role) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex h-svh w-screen overflow-hidden">
      <ToastProvider>
        <Nav role={role} />
        <main className="flex-1 overflow-y-auto scrollbar-gutter-stable px-4">
          <div className="mx-auto min-h-full w-full max-w-6xl md:px-4 py-8 pb-26 md:pb-8">
            {children}
          </div>
        </main>
      </ToastProvider>
    </div>
  );
}
