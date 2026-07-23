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
  success: "bg-green-500 text-white",
  warning: "bg-amber-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-sky-500 text-white",
};

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
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
          className={`font-semibold fixed top-4 left-1/2 -translate-x-1/2 w-fit text-center  ${
            isLargeScreen ? "max-w-sm" : "max-w-11/12"
          } rounded-2xl px-4 py-3 text-sm shadow-lg ${
            toastStyles[type]
          } z-50`}
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
