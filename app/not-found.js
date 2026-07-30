import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-11/12 gap-8">
      <div className="flex flex-row gap-8 items-center">
        <h1 className="text-6xl font-bold text-center">404</h1>
        <p className="text-center text-foreground">Not Found</p>
      </div>
      <Link
        href="/"
        className="rounded-2xl border border-border px-4 py-2 text-primary transition-colors duration-200 hover:bg-primary/10 active:bg-primary/15"
      >
        Return Home
      </Link>
    </div>
  );
}
