// app/unauthorized/page.tsx

import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-11/12 gap-8">
      <div className="flex flex-row gap-8 items-center">
        <h1 className="text-6xl font-bold text-center">403</h1>
        <p className="text-center text-foreground">Unauthorized</p>
      </div>

      <p className="text-sm text-slate-500 text-center max-w-md">
        You do not have permission to access this page.
      </p>

      <Link
        href="/"
        className="border border-sky-200 rounded-2xl py-2 px-4 hover:bg-sky-100 hover:text-sky-400 active:scale-95 active:bg-sky-100 active:text-sky-400 transition-[colors, scale] duration-300"
      >
        Return Home
      </Link>
    </div>
  );
}
