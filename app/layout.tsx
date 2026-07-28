import type { Metadata, Viewport } from "next";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("tracer-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const followsSystem = savedTheme !== "light" && savedTheme !== "dark";
    const isDark = savedTheme === "dark" || (followsSystem && prefersDark);
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    root.style.backgroundColor = isDark ? "#020617" : "#f8fafc";
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      isDark ? "#020617" : "#f8fafc"
    );
  } catch {}
`;

function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={
        typeof window === "undefined" ? "text/javascript" : "text/plain"
      }
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

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
        <InlineScript html={themeScript} />
      </head>
      <body className="relative min-h-full w-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
