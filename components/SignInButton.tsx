"use client";

import { LuLoaderCircle } from "react-icons/lu";

interface SignInButtonProps {
  isPending: boolean;
}

export function SignInButton({ isPending }: SignInButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <>
          <LuLoaderCircle className="h-5 w-5 animate-spin text-white" />
          <span>Signing in...</span>
        </>
      ) : (
        <span>Sign In</span>
      )}
    </button>
  );
}
