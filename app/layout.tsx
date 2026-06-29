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
      <body className="h-dvh w-full overflow-hidden"> 
        
        <div className="flex flex-col md:flex-row h-screen w-screen bg-white">
          <Nav />
          <main className="flex flex-col items-center justify-start flex-1 scrollbar-gutter-stable overflow-y-scroll text-accent px-4 scroll-pt-8 md:scroll-pt-12 scroll-pb-25 md:scroll-pb-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
