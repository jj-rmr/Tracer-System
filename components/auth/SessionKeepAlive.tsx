"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

export default function SessionKeepAlive() {
  useEffect(() => {
    let active = true;
    let refreshInProgress = false;

    async function refreshSession() {
      if (!active || refreshInProgress) return;
      refreshInProgress = true;

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        if (active && response.status === 401) {
          window.location.assign("/signin");
        }
      } catch {
      } finally {
        refreshInProgress = false;
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void refreshSession();
    }

    void refreshSession();
    const interval = window.setInterval(refreshSession, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return null;
}
