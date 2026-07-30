"use client";

import { LuAccessibility } from "@/components/ui/icons";
import { MotionConfig } from "motion/react";
import {
  applyReducedMotionPreference,
  MOTION_EVENT,
  MOTION_STORAGE_KEY,
  useReducedMotionPreference,
} from "@/lib/hooks/use-reduced-motion-preference";
import { BorderPreference } from "@/components/settings/BorderPreference";

export function MotionPreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotionPreference();

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}

export function MotionPreference() {
  const reduceMotion = useReducedMotionPreference();

  function setReduceMotion(enabled: boolean) {
    window.localStorage.setItem(MOTION_STORAGE_KEY, String(enabled));
    applyReducedMotionPreference(enabled);
    window.dispatchEvent(new Event(MOTION_EVENT));
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="rounded-2xl bg-secondary p-3 text-muted-foreground">
          <LuAccessibility aria-hidden="true" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground">Accessibility</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Adjust motion and visual structure on this device.
          </p>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
            <div>
              <p
                id="reduce-motion-label"
                className="text-sm font-medium text-foreground"
              >
                Reduce motion
              </p>
              <p
                id="reduce-motion-description"
                className="mt-1 text-sm leading-5 text-muted-foreground"
              >
                Minimize animations and movement throughout the system.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reduceMotion}
              aria-labelledby="reduce-motion-label"
              aria-describedby="reduce-motion-description"
              onClick={() => setReduceMotion(!reduceMotion)}
              className="group relative h-6 w-11 shrink-0 rounded-full border border-input bg-muted p-0.5 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-checked:border-primary aria-checked:bg-primary"
            >
              <span className="block size-4.5 rounded-full bg-card shadow-xs transition-transform group-aria-checked:translate-x-5" />
            </button>
          </div>

          <BorderPreference />
        </div>
      </div>
    </section>
  );
}
