//app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Placement Tracer System (Demo)",
  description: "Tracer System by the ParSU Placement Unit (Demo)",
};

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("tracer-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const followsSystem = savedTheme !== "light" && savedTheme !== "dark";
    const isDark = savedTheme === "dark" || (followsSystem && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="relative h-full w-full flex items-center justify-center">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
