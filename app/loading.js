"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (!showLoading) return null;

  return (
    <div className="flex h-full w-full items-center justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-100 border-t-sky-400" />
    </div>
  );
}
