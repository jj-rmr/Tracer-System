"use client";

import Link, { type LinkProps } from "next/link";
import { useRef, useState, type AnchorHTMLAttributes } from "react";

import { IconInteractionProvider } from "@/components/ui/icons";

type IconLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export function IconLink({
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  ...props
}: IconLinkProps) {
  const [iconInteractionActive, setIconInteractionActive] = useState(false);
  const touchStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTouchStopTimer() {
    if (touchStopTimerRef.current) clearTimeout(touchStopTimerRef.current);
    touchStopTimerRef.current = null;
  }

  return (
    <IconInteractionProvider active={iconInteractionActive}>
      <Link
        {...props}
        onPointerEnter={(event) => {
          setIconInteractionActive(true);
          onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setIconInteractionActive(false);
          onPointerLeave?.(event);
        }}
        onPointerDown={(event) => {
          clearTouchStopTimer();
          setIconInteractionActive(true);
          onPointerDown?.(event);
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") {
            clearTouchStopTimer();
            touchStopTimerRef.current = setTimeout(
              () => setIconInteractionActive(false),
              350,
            );
          }
          onPointerUp?.(event);
        }}
        onPointerCancel={(event) => {
          clearTouchStopTimer();
          setIconInteractionActive(false);
          onPointerCancel?.(event);
        }}
        onFocus={(event) => {
          setIconInteractionActive(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIconInteractionActive(false);
          onBlur?.(event);
        }}
      />
    </IconInteractionProvider>
  );
}
