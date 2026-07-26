"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { LuEllipsisVertical } from "react-icons/lu";

import { Button, buttonVariants } from "@/components/ui/button";

interface TableActionItem {
  label: string;
  icon: ReactNode;
  href?: string;
  onSelect?: () => void;
  variant?: "ghost" | "destructive" | "secondary";
  disabled?: boolean;
}

interface TableActionMenuProps {
  label: string;
  items: TableActionItem[];
}

export function TableActionMenu({ label, items }: TableActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function toggleMenu() {
    if (!open && triggerRef.current) {
      const bounds = triggerRef.current.getBoundingClientRect();
      const estimatedMenuHeight = items.length * 40 + 12;
      const opensAbove =
        bounds.bottom + 4 + estimatedMenuHeight > window.innerHeight;
      setPosition({
        top: opensAbove
          ? Math.max(8, bounds.top - estimatedMenuHeight - 4)
          : bounds.bottom + 4,
        right: Math.max(8, window.innerWidth - bounds.right),
      });
    }
    setOpen((current) => !current);
  }

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    const closeOnViewportChange = () => setOpen(false);
    window.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);

    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <LuEllipsisVertical aria-hidden="true" />
      </Button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            style={{ top: position.top, right: position.right }}
            className="fixed z-120 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl"
          >
            {items.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({
                    variant: item.variant ?? "ghost",
                    size: "menu",
                  })}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <Button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  variant={item.variant ?? "ghost"}
                  size="menu"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect?.();
                  }}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
