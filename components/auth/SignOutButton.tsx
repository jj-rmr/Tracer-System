"use client";

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
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={signOut}
      disabled={isPending}
      className="rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
