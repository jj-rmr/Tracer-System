"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";

type ModalWidth = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: ModalWidth;
  layer?: "modal" | "nested";
  bodyClassName?: string;
  closeLabel?: string;
}

const widthStyles: Record<ModalWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "xl",
  layer = "modal",
  bodyClassName = "p-4 md:p-6",
  closeLabel = "Close dialog",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        focusableSelector,
      );
      (firstFocusable ?? panelRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      const modalRoots = document.querySelectorAll("[data-modal-root]");
      if (modalRoots[modalRoots.length - 1] !== rootRef.current) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleScrollToTop() {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("stepchanged", handleScrollToTop);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("stepchanged", handleScrollToTop);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      data-modal-root
      className={`fixed inset-0 flex h-dvh items-center justify-center overflow-y-auto bg-black/40 p-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] [padding-top:max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm md:p-6 md:[padding-bottom:max(1.5rem,env(safe-area-inset-bottom))] md:[padding-top:max(1.5rem,env(safe-area-inset-top))] ${
        layer === "nested" ? "z-110" : "z-100"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none ${widthStyles[width]} ${
          width === "sm" || width === "md" ? "h-auto" : "h-full"
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <LuX aria-hidden="true" size={22} />
          </button>
        </header>

        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
