"use client";

import { useEffect } from "react";

import { useToast } from "@/components/ui/Toast";

export default function RoleChangeNotice() {
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    async function consumeNotice() {
      try {
        const response = await fetch("/api/auth/role-change-notice", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) return;

        const result = (await response.json()) as {
          notice?: unknown;
        };
        if (active && typeof result.notice === "string") {
          showToast({
            message: result.notice,
            type: "success",
            duration: 7000,
          });
        }
      } catch {
        // A transient notice failure must not interrupt the dashboard.
      }
    }

    void consumeNotice();
    return () => {
      active = false;
    };
  }, [showToast]);

  return null;
}
