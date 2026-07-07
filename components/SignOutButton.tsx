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
      className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-400 border border-red-400 hover:text-red-400 hover:bg-red-50 active:bg-red-50 active:text-red-400 active:scale-95  transition duration-300 disabled:opacity-50 cursor-pointer"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
