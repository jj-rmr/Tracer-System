import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-11/12 gap-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
        <h1 className="text-6xl font-semibold text-center">403</h1>
        <p className="text-center text-foreground">Unauthorized</p>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        You do not have permission to access this page.
      </p>

      <Link
        href="/"
        className="rounded-2xl border border-border px-4 py-2 transition-[color,background-color,transform] duration-200 hover:bg-secondary hover:text-primary active:scale-95 active:bg-secondary active:text-primary"
      >
        Return Home
      </Link>
    </div>
  );
}
