//app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const montserratSans = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tracer System Demo",
  description: "Tracer System by the ParSU Placement Unit (Demo)",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserratSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="relative h-full w-full flex items-center justify-center">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
