"use client";

import { Button } from "@/components/ui/button";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LuX } from "@/components/ui/icons";
import { AnimatePresence, motion, useDragControls } from "motion/react";

type ModalWidth = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  headerContent?: ReactNode;
  headerVariant?: "default" | "accent";
  children: ReactNode;
  width?: ModalWidth;
  layer?: "modal" | "nested";
  bodyClassName?: string;
  closeLabel?: string;
  fitContent?: boolean;
  showCloseButton?: boolean;
  placement?: "center" | "bottom";
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

const modalExitDurationMs = 300;

let rootScrollLockCount = 0;
let rootOverflowBeforeLock = "";
let rootScrollbarGutterBeforeLock = "";
let bodyPaddingRightBeforeLock = "";

function lockPageScroll() {
  if (rootScrollLockCount === 0) {
    const gutterWidth =
      window.innerWidth - document.documentElement.clientWidth;

    rootOverflowBeforeLock = document.documentElement.style.overflow;
    rootScrollbarGutterBeforeLock =
      document.documentElement.style.scrollbarGutter;
    bodyPaddingRightBeforeLock = document.body.style.paddingRight;

    if (gutterWidth > 0) {
      const bodyPaddingRight = Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight,
      );
      document.body.style.paddingRight = `${bodyPaddingRight + gutterWidth}px`;
    }

    document.documentElement.style.scrollbarGutter = "auto";
    document.documentElement.style.overflow = "hidden";
  }
  rootScrollLockCount += 1;
}

function unlockPageScroll() {
  rootScrollLockCount = Math.max(0, rootScrollLockCount - 1);
  if (rootScrollLockCount !== 0) return;

  document.documentElement.style.overflow = rootOverflowBeforeLock;
  document.documentElement.style.scrollbarGutter =
    rootScrollbarGutterBeforeLock;
  document.body.style.paddingRight = bodyPaddingRightBeforeLock;
  rootOverflowBeforeLock = "";
  rootScrollbarGutterBeforeLock = "";
  bodyPaddingRightBeforeLock = "";
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  headerContent,
  headerVariant = "default",
  children,
  width = "xl",
  layer = "modal",
  bodyClassName = "p-4 md:p-6",
  closeLabel = "Close dialog",
  fitContent = false,
  showCloseButton = true,
  placement = "center",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const dragControls = useDragControls();
  const [isDragDismissing, setIsDragDismissing] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    lockPageScroll();

    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable =
        panelRef.current?.querySelector<HTMLElement>(focusableSelector);
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
      window.setTimeout(unlockPageScroll, modalExitDurationMs);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("stepchanged", handleScrollToTop);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={rootRef}
          data-modal-root
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`fixed inset-y-0 left-0 flex h-dvh w-screen justify-center bg-overlay p-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] [padding-top:max(0.75rem,env(safe-area-inset-top))] md:p-6 md:[padding-bottom:max(1.5rem,env(safe-area-inset-bottom))] md:[padding-top:max(1.5rem,env(safe-area-inset-top))] ${
            placement === "bottom"
              ? "items-end overflow-hidden md:items-center"
              : "items-center overflow-y-auto backdrop-blur-sm"
          } ${layer === "nested" ? "z-110" : "z-100"}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={
              description && !headerContent ? descriptionId : undefined
            }
            tabIndex={-1}
            initial={placement === "bottom" ? { y: 48 } : false}
            animate={
              placement === "bottom"
                ? { y: isDragDismissing ? "100dvh" : 0 }
                : { y: 0 }
            }
            exit={placement === "bottom" ? { y: "100dvh" } : undefined}
            transition={
              placement === "bottom"
                ? { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                : undefined
            }
            drag={placement === "bottom" ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 1000 }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 700) {
                setIsDragDismissing(true);
              }
            }}
            onAnimationComplete={() => {
              if (!isDragDismissing) return;
              setIsDragDismissing(false);
              onClose();
            }}
            className={`relative flex max-h-full w-full flex-col overflow-hidden bg-card shadow-2xl outline-none ${widthStyles[width]} ${
              placement === "bottom"
                ? "transform-gpu will-change-transform rounded-t-3xl rounded-b-xl md:rounded-2xl"
                : "rounded-2xl"
            } ${
              fitContent || width === "sm" || width === "md"
                ? "h-fit"
                : "h-full"
            }`}
          >
            {placement === "bottom" && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center justify-center"
              >
                <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
              </span>
            )}
            <header
              onPointerDown={
                placement === "bottom"
                  ? (event) => dragControls.start(event)
                  : undefined
              }
              className={`flex shrink-0 items-start justify-between gap-4 border-b px-5 pb-4 md:px-6 ${
                headerVariant === "accent"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              } ${
                placement === "bottom"
                  ? "touch-none cursor-grab select-none pt-7 active:cursor-grabbing"
                  : "pt-4"
              }`}
            >
              <div className="min-w-0 flex-1">
                <h2
                  id={titleId}
                  className={
                    headerContent
                      ? "sr-only"
                      : "text-lg font-semibold text-foreground"
                  }
                >
                  {title}
                </h2>
                {headerContent ??
                  (description && (
                    <p
                      id={descriptionId}
                      className="mt-0.5 text-sm text-muted-foreground"
                    >
                      {description}
                    </p>
                  ))}
              </div>
              {showCloseButton && placement !== "bottom" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  aria-label={closeLabel}
                  className={
                    headerVariant === "accent"
                      ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                      : undefined
                  }
                >
                  <LuX aria-hidden="true" size={22} animated />
                </Button>
              )}
            </header>

            <div
              ref={bodyRef}
              className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
