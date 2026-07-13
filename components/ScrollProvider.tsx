"use client"; // This makes this file a Client Component

import { useEffect, useRef } from "react";

export default function ScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScrollToTop = () => {
      if (mainRef.current) {
        mainRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    // Listen for the custom step change event
    window.addEventListener("stepchanged", handleScrollToTop);
    return () => window.removeEventListener("stepchanged", handleScrollToTop);
  }, []);

  return (
    <main
      ref={mainRef}
      className="flex-1 overflow-y-auto scrollbar-gutter-stable px-4"
    >
      {children}
    </main>
  );
}
