"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
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
      onClick={handleSignOut}
      disabled={isPending}
      className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-400 border border-red-400 hover:text-red-400 hover:bg-red-50 active:bg-red-50 active:text-red-400 active:scale-95 transition duration-300 disabled:opacity-50 cursor-pointer"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
