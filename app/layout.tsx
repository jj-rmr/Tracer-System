import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { createNextServerHelpers } from "@appwrite.io/react/server/next";
import { Providers } from "./providers";
import { appwriteConfig, hasAppwriteConfig } from "./config/appwrite";

const appwrite = {
  endpoint: appwriteConfig.endpoint,
  projectId: appwriteConfig.projectId,
};

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
  const helpers = hasAppwriteConfig()
    ? createNextServerHelpers(appwrite)
    : null;
  const session = helpers ? await helpers.readSessionCookie() : null;

  return (
    <html
      lang="en"
      className={`${montserratSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full w-full flex items-center justify-center">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
