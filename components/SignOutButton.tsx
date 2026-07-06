"use client";

import { useSignOut } from "@appwrite.io/react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const { signOut, isPending } = useSignOut();
  const router = useRouter();

  const handleSignOut = () => {
    signOut({
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:text-white hover:bg-red-400 text-slate-700 bg-white transition duration-300 disabled:opacity-50 cursor-pointer"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
