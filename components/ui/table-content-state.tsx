"use client";

import type { ReactNode } from "react";

import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableContentStateProps {
  colSpan: number;
  loadingMessage?: string;
  error?: string | null;
  retryLabel?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function TableContentState({
  colSpan,
  loadingMessage,
  error,
  retryLabel,
  onRetry,
  children,
}: TableContentStateProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-72 p-4">
        {error ? (
          <ErrorState
            message={error}
            retryLabel={retryLabel}
            onRetry={onRetry}
          />
        ) : loadingMessage ? (
          <LoadingState
            delayMs={0}
            className="min-h-64"
            message={loadingMessage}
          />
        ) : (
          children
        )}
      </TableCell>
    </TableRow>
  );
}
