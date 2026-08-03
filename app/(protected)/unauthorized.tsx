import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";

export default function Unauthorized() {
  return (
    <div className="flex h-11/12 flex-col items-center justify-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
        <h1 className="text-center text-6xl font-semibold">403</h1>
        <p className="text-center text-foreground">Unauthorized</p>
      </div>

      <p className="max-w-md text-center text-sm text-muted-foreground">
        You do not have permission to access this page.
      </p>

      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Return Home
      </Link>
    </div>
  );
}
