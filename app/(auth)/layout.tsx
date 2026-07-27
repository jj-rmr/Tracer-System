import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh w-full min-w-0">
      <div className="fixed right-4 top-4 z-10 w-fit">
        <ThemeToggle placement="floating" />
      </div>
      <main className="flex-1 px-4">
        <div className="mx-auto min-h-full place-content-center place-items-center w-full max-w-6xl px-0 md:px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
