"use client";

interface SignInButtonProps {
  isPending: boolean;
}

export function SignInButton({ isPending }: SignInButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full py-3 px-4 rounded-2xl bg-sky-400 hover:bg-sky-500 text-white font-medium shadow-md shadow-sky-200 hover:shadow-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
    >
      {isPending ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Signing in...</span>
        </>
      ) : (
        <span>Sign In</span>
      )}
    </button>
  );
}
