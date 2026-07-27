"use client";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/signin");
      router.refresh();
    } catch {
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={signOut}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
