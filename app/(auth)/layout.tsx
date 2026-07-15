export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-dvh w-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollbar-gutter-stable px-4">
        <div className="mx-auto min-h-full place-content-center place-items-center w-full max-w-6xl px-0 md:px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
