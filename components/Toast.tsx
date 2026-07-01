"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

const toastStyles: Record<NonNullable<ToastProps["type"]>, string> = {
  success: "border-emerald-400 bg-emerald-50 text-emerald-400",
  error: "border-rose-400 bg-rose-50 text-rose-400",
  info: "border-sky-400 bg-sky-50 text-sky-400",
};

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message]);

  const handleAnimationComplete = () => {
    if (isExiting) {
      // Small delay ensures animation frame is fully rendered before unmounting
      setTimeout(() => {
        onClose?.();
      }, 10);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={isExiting ? { opacity: 0, height: 0 } : { opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete}
      className={`overflow-hidden rounded-2xl border px-4 py-3 text-sm ${toastStyles[type]}`}
    >
      {message}
    </motion.div>
  );
}
