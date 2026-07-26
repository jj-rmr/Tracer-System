"use client";

import { useSyncExternalStore } from "react";
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";

const THEME_STORAGE_KEY = "tracer-theme";
const THEME_EVENT = "tracer-theme-change";
type Theme = "system" | "light" | "dark";
let themeTransitionFrame: number | null = null;
const MotionButton = motion.create(Button);

function getTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : "system";
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const root = document.documentElement;
  root.classList.add("theme-changing");
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";

  if (themeTransitionFrame !== null) {
    window.cancelAnimationFrame(themeTransitionFrame);
  }

  themeTransitionFrame = window.requestAnimationFrame(() => {
    themeTransitionFrame = window.requestAnimationFrame(() => {
      root.classList.remove("theme-changing");
      themeTransitionFrame = null;
    });
  });
}

function subscribe(onStoreChange: () => void) {
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    applyTheme(getTheme());
    onStoreChange();
  };

  window.addEventListener(THEME_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  colorScheme.addEventListener("change", handleChange);

  return () => {
    window.removeEventListener(THEME_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
    colorScheme.removeEventListener("change", handleChange);
  };
}

function getSnapshot() {
  return getTheme();
}

function getServerSnapshot() {
  return "system" as Theme;
}

export default function ThemeToggle({
  placement = "sidebar",
  expanded = true,
}: {
  placement?: "sidebar" | "menu" | "floating";
  expanded?: boolean;
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";

    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const nextTheme =
    theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const label = `Theme: ${theme}. Switch to ${nextTheme} mode`;
  const Icon =
    theme === "system" ? LuMonitor : theme === "dark" ? LuMoon : LuSun;
  const themeLabel = `${theme[0].toUpperCase() + theme.slice(1)} mode`;

  return (
    <MotionButton
      type="button"
      variant={
        placement === "floating"
          ? "outline-elevated"
          : placement === "sidebar"
            ? "navigation"
            : "ghost"
      }
      size={
        placement === "menu"
          ? "theme-menu"
          : placement === "floating"
            ? "theme-floating"
            : "sidebar"
      }
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      whileTap={{ scale: 0.98 }}
    >
      <span
        className={`relative grid shrink-0 place-items-center ${
          placement === "menu"
            ? "size-5.5"
            : placement === "sidebar"
              ? "-ml-0.5 size-4.75"
              : "size-4.75"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ y: -8, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "backInOut" }}
            className="absolute grid place-items-center"
          >
            <Icon aria-hidden="true" size={placement === "menu" ? 22 : 19} />
          </motion.span>
        </AnimatePresence>
      </span>
      <span
        data-theme-label
        className={
          placement === "sidebar"
            ? `block overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width,margin,opacity,transform,translate] duration-300 ease-out ${
                expanded
                  ? "ml-3 max-w-40 translate-x-0 opacity-100"
                  : "ml-0 max-w-0 -translate-x-1 opacity-0"
              }`
            : "text-sm font-medium"
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={themeLabel}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 4, opacity: 0 }}
            transition={{ duration: 0.2, ease: "backInOut" }}
            className="inline-block whitespace-nowrap"
          >
            {themeLabel}
          </motion.span>
        </AnimatePresence>
      </span>
    </MotionButton>
  );
}
