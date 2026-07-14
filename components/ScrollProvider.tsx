"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollProvider({ children, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScrollToTop = () => {
      containerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    window.addEventListener("stepchanged", handleScrollToTop);

    return () => window.removeEventListener("stepchanged", handleScrollToTop);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
