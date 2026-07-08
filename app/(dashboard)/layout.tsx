// app/(dashboard)/layout.tsx
import Nav from "@/components/Nav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
