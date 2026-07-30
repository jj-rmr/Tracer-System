"use client";

import { useSyncExternalStore } from "react";

export const MOTION_STORAGE_KEY = "tracer-reduce-motion";
export const MOTION_EVENT = "tracer-reduce-motion-change";

export function getReducedMotionPreference() {
  return window.localStorage.getItem(MOTION_STORAGE_KEY) === "true";
}

export function applyReducedMotionPreference(reduceMotion: boolean) {
  document.documentElement.classList.toggle("reduce-motion", reduceMotion);
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    applyReducedMotionPreference(getReducedMotionPreference());
    onStoreChange();
  };

  window.addEventListener(MOTION_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  applyReducedMotionPreference(getReducedMotionPreference());

  return () => {
    window.removeEventListener(MOTION_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribe,
    getReducedMotionPreference,
    () => false,
  );
}
