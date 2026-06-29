import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserratSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-screen w-full overflow-hidden"> 
        
        <div className="flex flex-col md:flex-row h-screen w-screen bg-white">
          <Nav />
          <main className="flex flex-col items-center justify-start flex-1 scrollbar-gutter-stable overflow-y-auto text-accent px-4 pt-12 pb-17 md:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
