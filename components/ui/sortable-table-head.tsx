"use client";

import type { ReactNode } from "react";

import {
  LuArrowUpDown,
  LuChevronDown,
  LuChevronUp,
} from "@/components/ui/icons";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

interface SortableTableHeadProps extends Omit<
  React.ComponentProps<typeof TableHead>,
  "onClick"
> {
  children: ReactNode;
  align?: "left" | "center";
  direction?: SortDirection;
  onSort: () => void;
}

export function SortableTableHead({
  children,
  align = "left",
  className,
  direction,
  onSort,
  ...props
}: SortableTableHeadProps) {
  const sortLabel = direction === "asc" ? "ascending" : "descending";

  return (
    <TableHead
      {...props}
      className={cn("p-0", className)}
      aria-sort={direction ? sortLabel : "none"}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "flex h-12 w-full items-center gap-1.5 px-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          align === "center" ? "justify-center text-center" : "text-left",
        )}
        title={`Sort by ${String(children)}`}
      >
        <span>{children}</span>
        {direction === "asc" ? (
          <LuChevronUp aria-hidden="true" size={14} />
        ) : direction === "desc" ? (
          <LuChevronDown aria-hidden="true" size={14} />
        ) : (
          <LuArrowUpDown aria-hidden="true" size={14} className="opacity-50" />
        )}
      </button>
    </TableHead>
  );
}
