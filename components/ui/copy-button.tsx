"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { LuCheck, LuCopy } from "@/components/ui/icons";

interface CopyButtonProps {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={() => void copyValue()}
      aria-label={copied ? `${label} copied` : label}
      title={copied ? "Copied" : label}
      className="shrink-0 text-muted-foreground/25"
    >
      {copied ? (
        <LuCheck aria-hidden="true" size={12} />
      ) : (
        <LuCopy aria-hidden="true" size={12} />
      )}
    </Button>
  );
}
