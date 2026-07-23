"use client";

import Modal from "@/components/ui/Modal";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  tone?: "primary" | "danger";
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  busy = false,
  tone = "primary",
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={title}
      width="md"
      layer="nested"
      bodyClassName="p-6"
    >
      <p className="text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
            tone === "danger"
              ? "bg-rose-500 hover:bg-rose-600"
              : "bg-sky-600 hover:bg-sky-700"
          }`}
        >
          {busy ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
