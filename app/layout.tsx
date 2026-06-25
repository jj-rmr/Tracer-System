import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    // <html
    //   lang="en"
    //   className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    // >
    //   <body className="h-screen flex flex-col w-full">
    //     <div className="flex flex-row h-svh bg-white">
    //       <Sidebar />
    //       <main className="ml-20 lg:ml-0 flex flex-col items-center justify-center flex-1 overflow-auto bg-white text-accent" >
    //         {children}
    //       </main>
    //     </div>
    //   </body>
    // </html>
<html
  lang="en"
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
>
  <body className="h-screen w-full overflow-hidden"> 
    
    <div className="flex flex-col md:flex-row h-screen w-screen bg-white">
      <Nav />
      <main className="flex flex-col items-center justify-start md:justify-center flex-1 overflow-y-auto bg-white text-accent px-4 pb-safe md:pb-0">
        {children}
      </main>
    </div>
  </body>
</html>
  );
}
