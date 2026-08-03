"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button-variants";
import { IconInteractionProvider } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type ButtonProps = Omit<ButtonPrimitive.Props, "className"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    animateIcon?: boolean;
  };

function Button({
  className,
  variant,
  size,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  animateIcon = true,
  ...props
}: ButtonProps) {
  const [iconInteractionActive, setIconInteractionActive] = useState(false);
  const touchStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTouchStopTimer() {
    if (touchStopTimerRef.current) clearTimeout(touchStopTimerRef.current);
    touchStopTimerRef.current = null;
  }

  const button = (
    <ButtonPrimitive
      data-slot="button"
      data-button-variant={variant ?? "ghost"}
      className={cn(buttonVariants({ variant, size }), className)}
      onPointerEnter={
        animateIcon
          ? (event) => {
              setIconInteractionActive(true);
              onPointerEnter?.(event);
            }
          : onPointerEnter
      }
      onPointerLeave={
        animateIcon
          ? (event) => {
              if (event.pointerType === "mouse") {
                setIconInteractionActive(false);
              }
              onPointerLeave?.(event);
            }
          : onPointerLeave
      }
      onPointerDown={
        animateIcon
          ? (event) => {
              clearTouchStopTimer();
              setIconInteractionActive(true);
              onPointerDown?.(event);
            }
          : onPointerDown
      }
      onPointerUp={
        animateIcon
          ? (event) => {
              if (event.pointerType !== "mouse") {
                clearTouchStopTimer();
                touchStopTimerRef.current = setTimeout(
                  () => setIconInteractionActive(false),
                  350,
                );
              }
              onPointerUp?.(event);
            }
          : onPointerUp
      }
      onPointerCancel={
        animateIcon
          ? (event) => {
              clearTouchStopTimer();
              setIconInteractionActive(false);
              onPointerCancel?.(event);
            }
          : onPointerCancel
      }
      onFocus={
        animateIcon
          ? (event) => {
              setIconInteractionActive(true);
              onFocus?.(event);
            }
          : onFocus
      }
      onBlur={
        animateIcon
          ? (event) => {
              setIconInteractionActive(false);
              onBlur?.(event);
            }
          : onBlur
      }
      {...props}
    />
  );

  return animateIcon ? (
    <IconInteractionProvider active={iconInteractionActive}>
      {button}
    </IconInteractionProvider>
  ) : (
    button
  );
}

export { Button };
