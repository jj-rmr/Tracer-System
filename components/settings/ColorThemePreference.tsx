"use client";

import { useSyncExternalStore } from "react";

import { LuPalette } from "@/components/ui/icons";

const COLOR_THEME_STORAGE_KEY = "tracer-color-theme";
const COLOR_THEME_EVENT = "tracer-color-theme-change";

type ColorTheme = "blue" | "green" | "purple" | "gray";

const colorThemes: Array<{
  value: ColorTheme;
  label: string;
  swatch: string;
}> = [
  { value: "blue", label: "Blue", swatch: "bg-sky-500" },
  { value: "green", label: "Green", swatch: "bg-emerald-500" },
  { value: "purple", label: "Fuchsia", swatch: "bg-fuchsia-500" },
  { value: "gray", label: "Gray", swatch: "bg-gray-500" },
];

function getColorTheme(): ColorTheme {
  const savedTheme = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  if (savedTheme === "monotone") return "gray";
  return savedTheme === "green" ||
    savedTheme === "purple" ||
    savedTheme === "gray"
    ? savedTheme
    : "blue";
}

function applyColorTheme(theme: ColorTheme) {
  document.documentElement.dataset.colorTheme = theme;
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    applyColorTheme(getColorTheme());
    onStoreChange();
  };

  window.addEventListener(COLOR_THEME_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  applyColorTheme(getColorTheme());

  return () => {
    window.removeEventListener(COLOR_THEME_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function ColorThemePreference() {
  const colorTheme = useSyncExternalStore(
    subscribe,
    getColorTheme,
    () => "blue" as ColorTheme,
  );

  function selectColorTheme(theme: ColorTheme) {
    window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
    applyColorTheme(theme);
    window.dispatchEvent(new Event(COLOR_THEME_EVENT));
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="rounded-2xl bg-secondary p-3 text-muted-foreground">
          <LuPalette aria-hidden="true" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground">Color theme</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Choose the system accent color on this device.
          </p>

          <div
            role="radiogroup"
            aria-label="Color theme"
            className="mt-5 grid gap-2 border-t border-border pt-5 sm:grid-cols-2"
          >
            {colorThemes.map((theme) => {
              const selected = colorTheme === theme.value;

              return (
                <button
                  key={theme.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => selectColorTheme(theme.value)}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm font-medium text-foreground outline-none transition-[color,background-color,border-color,box-shadow] hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring aria-checked:border-primary aria-checked:bg-primary/10 aria-checked:text-primary"
                >
                  <span
                    aria-hidden="true"
                    className={`size-4 shrink-0 rounded-full border border-black/10 shadow-xs ${theme.swatch}`}
                  />
                  <span>{theme.label}</span>
                  <span className="sr-only">
                    {selected ? "Current color theme" : "Select color theme"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
