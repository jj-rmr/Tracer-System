"use client";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

const toastStyles: Record<NonNullable<ToastProps["type"]>, string> = {
  success: "border-emerald-400 bg-emerald-50 text-emerald-400",
  error: "border-rose-400 bg-rose-50 text-rose-400",
  info: "border-sky-400 bg-sky-50 text-sky-400",
};

export function Toast({ message, type = "success" }: ToastProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${toastStyles[type]}`}>
      {message}
    </div>
  );
}
