"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "warning" | "error" | "info";
  duration?: number;
  onClose?: () => void;
  setType?: (type: "success" | "warning" | "error" | "info") => void;
}

const toastStyles: Record<NonNullable<ToastProps["type"]>, string> = {
  success: "border-green-400 bg-green-50/20 text-green-400",
  warning: "border-amber-400 bg-amber-50/20 text-amber-400",
  error: "border-red-400 bg-red-50/20 text-red-400",
  info: "border-sky-400 bg-sky-50/20 text-sky-400",
};

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
  setType,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [toastType, setToastType] = useState<
    "success" | "warning" | "error" | "info"
  >(type);
  const [isLargeScreen, setIsLargeScreen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setToastType(type);
  }, [type]);

  const getInitialPosition = () => {
    if (isLargeScreen) {
      return { y: 100, opacity: 0 };
    }
    return { y: -100, opacity: 0 };
  };

  const getAnimatePosition = () => {
    return { y: 0, opacity: 1 };
  };

  const getExitPosition = () => {
    if (isLargeScreen) {
      return { y: 100, opacity: 0 };
    }
    return { y: -100, opacity: 0 };
  };

  return (
    <AnimatePresence
      onExitComplete={() => {
        onClose?.();
      }}
    >
      {isVisible && (
        <motion.div
          key="toast"
          initial={getInitialPosition()}
          animate={getAnimatePosition()}
          exit={getExitPosition()}
          transition={{ duration: 0.3, ease: "backInOut" }}
          className={`fixed ${
            isLargeScreen
              ? "bottom-4 right-8 max-w-sm"
              : "top-4 left-1/2 -translate-x-1/2 w-full max-w-11/12"
          } rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
            toastStyles[toastType]
          } z-50`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
