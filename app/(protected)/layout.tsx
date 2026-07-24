import { redirect } from "next/navigation";
import DashboardNavigation from "@/components/layout/DashboardNavigation";
import { getRole, requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireUser();
  const role = getRole(user);

  if (!role) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex h-svh w-screen overflow-hidden">
      <DashboardNavigation role={role} />
      <main className="flex-1 overflow-y-auto scrollbar-gutter-stable px-4">
        <div className="mx-auto min-h-full w-full max-w-6xl md:px-4 py-8 pb-26 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
