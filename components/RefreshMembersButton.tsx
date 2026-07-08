"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { clearMembersCache } from "@/app/actions/members";

export function RefreshMembersButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        await clearMembersCache();
        router.refresh();
      } catch (error) {
        console.error("Failed to refresh members directory:", error);
      }
    });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      className="text-xs font-medium px-3 py-1.5 bg-slate-200/60 text-slate-600 rounded-md hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
    >
      {isPending ? (
        <>
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
          Refreshing...
        </>
      ) : (
        "Refresh"
      )}
    </button>
  );
}
