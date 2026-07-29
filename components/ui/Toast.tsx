"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ToastProps {
  message: string;
  type?: "success" | "warning" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

const toastStyles: Record<NonNullable<ToastProps["type"]>, string> = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  error: "border border-border bg-card text-foreground",
  info: "bg-muted-foreground text-background",
};

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message]);

  const getInitialPosition = () => {
    return { y: -100, opacity: 0 };
  };

  const getAnimatePosition = () => {
    return { y: 0, opacity: 1 };
  };

  const getExitPosition = () => {
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
          className={`fixed top-4 left-1/2 z-9999 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-pretty text-sm font-semibold shadow-lg sm:max-w-lg lg:max-w-xl ${toastStyles[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ToastType = "success" | "warning" | "error" | "info";

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback(
    ({ message, type = "success", duration = 3000 }: ToastOptions) => {
      setToast(null);
      setTimeout(() => {
        setToast({ message, type, duration });
      }, 50);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    const wentOffline = () =>
      showToast({
        message:
          "Network connection lost. Your unsaved work will be kept on this device.",
        type: "warning",
        duration: 6000,
      });
    const cameOnline = () =>
      showToast({
        message: "You're back online. You can refresh or try again now.",
        type: "success",
      });

    window.addEventListener("offline", wentOffline);
    window.addEventListener("online", cameOnline);
    return () => {
      window.removeEventListener("offline", wentOffline);
      window.removeEventListener("online", cameOnline);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
