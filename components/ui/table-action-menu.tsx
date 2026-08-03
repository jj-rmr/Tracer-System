"use client";

import type { ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import { IconLink as Link } from "@/components/ui/icon-link";
import { LuEllipsisVertical } from "@/components/ui/icons";

import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";

interface TableActionItem {
  label: string;
  icon: ReactNode;
  href?: string;
  onSelect?: () => void;
  variant?: "ghost" | "destructive" | "secondary" | "success";
  disabled?: boolean;
}

interface TableActionMenuProps {
  label: string;
  items: TableActionItem[];
}

export function TableActionMenu({ label, items }: TableActionMenuProps) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground"
          />
        }
        aria-label={label}
      >
        <LuEllipsisVertical aria-hidden="true" animated />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          align="end"
          sideOffset={4}
          collisionPadding={8}
          positionMethod="fixed"
          className="z-120 outline-none"
        >
          <Menu.Popup
            aria-label={label}
            className="w-max min-w-52 max-w-[90vw] origin-(--transform-origin) rounded-xl border border-border bg-card p-2 shadow-xl outline-none transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            {items.map((item) =>
              item.href ? (
                <Menu.LinkItem
                  key={item.label}
                  closeOnClick
                  render={
                    <Link
                      href={item.href}
                      className={buttonVariants({
                        variant: item.variant ?? "ghost",
                        size: "menu",
                      })}
                    />
                  }
                >
                  {item.icon}
                  {item.label}
                </Menu.LinkItem>
              ) : (
                <Menu.Item
                  key={item.label}
                  nativeButton
                  disabled={item.disabled}
                  onClick={item.onSelect}
                  render={
                    <Button
                      type="button"
                      variant={item.variant ?? "ghost"}
                      size="menu"
                    />
                  }
                >
                  {item.icon}
                  {item.label}
                </Menu.Item>
              ),
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
