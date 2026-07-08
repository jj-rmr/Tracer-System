//app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import { appwriteConfig } from "./config/appwrite";

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
  const cookieStore = await cookies();

  const cookieName = `appwrite-session-${appwriteConfig.projectId}`;
  const sessionToken = cookieStore.get(cookieName)?.value || null;

  return (
    <html
      lang="en"
      className={`${montserratSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="relative h-full w-full flex items-center justify-center">
        <Providers session={sessionToken}>{children}</Providers>
      </body>
    </html>
  );
}
