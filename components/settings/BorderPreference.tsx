"use client";

import { useSyncExternalStore } from "react";

const BORDER_STORAGE_KEY = "tracer-border-style";
const BORDER_VERSION_KEY = "tracer-border-style-version";
const LEGACY_BORDER_STORAGE_KEY = "tracer-show-borders";
const BORDER_EVENT = "tracer-border-style-change";

type BorderStyle = "none" | "light" | "hard";

const borderStyles: Array<{
  value: BorderStyle;
  label: string;
  description: string;
}> = [
  {
    value: "none",
    label: "No borders",
    description: "Use surfaces and shadows to separate interface elements.",
  },
  {
    value: "light",
    label: "Borders",
    description:
      "Outline only essential controls and structure in either color mode.",
  },
  {
    value: "hard",
    label: "Enhanced borders",
    description:
      "Show subtle outlines throughout the interface for clearer separation.",
  },
];

function getBorderStyle(): BorderStyle {
  const savedStyle = window.localStorage.getItem(BORDER_STORAGE_KEY);
  if (
    savedStyle === "light" &&
    window.localStorage.getItem(BORDER_VERSION_KEY) !== "2"
  ) {
    return "hard";
  }
  if (savedStyle === "light" || savedStyle === "hard") return savedStyle;
  if (savedStyle === "none") return "none";

  return window.localStorage.getItem(LEGACY_BORDER_STORAGE_KEY) === "true"
    ? "light"
    : "none";
}

function applyBorderStyle(style: BorderStyle) {
  document.documentElement.dataset.borderStyle = style;
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    applyBorderStyle(getBorderStyle());
    onStoreChange();
  };

  window.addEventListener(BORDER_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  applyBorderStyle(getBorderStyle());

  return () => {
    window.removeEventListener(BORDER_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function BorderPreference() {
  const borderStyle = useSyncExternalStore(
    subscribe,
    getBorderStyle,
    () => "none" as BorderStyle,
  );

  function selectBorderStyle(style: BorderStyle) {
    window.localStorage.setItem(BORDER_STORAGE_KEY, style);
    window.localStorage.setItem(BORDER_VERSION_KEY, "2");
    window.localStorage.removeItem(LEGACY_BORDER_STORAGE_KEY);
    applyBorderStyle(style);
    window.dispatchEvent(new Event(BORDER_EVENT));
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
      <div>
        <h3 className="text-sm font-medium text-foreground">
          Interface borders
        </h3>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Choose how strongly controls, cards, tables, and dialogs are outlined.
        </p>

        <div
          role="radiogroup"
          aria-label="Interface border visibility"
          className="mt-3 grid gap-2"
        >
          {borderStyles.map((style) => {
            const selected = borderStyle === style.value;
            const labelId = `border-style-${style.value}-label`;
            const descriptionId = `border-style-${style.value}-description`;

            return (
              <button
                key={style.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                onClick={() => selectBorderStyle(style.value)}
                className="flex min-h-11 items-start gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left outline-none transition-[color,background-color,border-color,box-shadow] hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-checked:border-primary aria-checked:bg-primary/10"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ring-1 ring-inset ${
                    selected ? "ring-primary" : "ring-input"
                  }`}
                >
                  {selected && (
                    <span className="size-2.5 rounded-full bg-primary" />
                  )}
                </span>
                <div className="min-w-0">
                  <p
                    id={labelId}
                    className="text-sm font-medium text-foreground"
                  >
                    {style.label}
                  </p>
                  <p
                    id={descriptionId}
                    className="mt-0.5 text-sm leading-5 text-muted-foreground"
                  >
                    {style.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
