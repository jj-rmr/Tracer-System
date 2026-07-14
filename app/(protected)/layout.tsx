import Nav from "@/components/Nav";
import { requireVerifiedUser, getRole } from "@/lib/auth";
import ScrollProvider from "@/components/ScrollProvider"; // Import your new client wrapper

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireVerifiedUser();
  const role = getRole(user);

  return (
    <div className="flex h-dvh w-screen overflow-hidden">
      <Nav role={role} />

      {/* ScrollProvider acts as your <main> tag now */}
      <ScrollProvider>
        <div className="mx-auto min-h-full w-full max-w-6xl md:px-4 py-8 pb-26 md:pb-8">
          {children}
        </div>
      </ScrollProvider>
    </div>
  );
}
