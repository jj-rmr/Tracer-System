"use client";

import { useState, type ReactNode } from "react";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import Modal from "@/components/ui/Modal";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode | ((requestClose: () => void) => ReactNode);
  description?: string;
  width?: "sm" | "md" | "lg" | "xl";
  bodyClassName?: string;
  confirmationTitle?: string;
  confirmationDescription?: string;
  shouldConfirmClose?: boolean;
  fitContent?: boolean;
  showCloseButton?: boolean;
  onCloseRequest?: () => void;
}

export default function FormModal({
  open,
  onClose,
  title,
  children,
  description,
  width = "xl",
  bodyClassName,
  confirmationTitle = "Discard unsaved changes?",
  confirmationDescription = "Any information entered in this form will be lost.",
  shouldConfirmClose = true,
  fitContent = false,
  showCloseButton = true,
  onCloseRequest,
}: FormModalProps) {
  const [confirmingClose, setConfirmingClose] = useState(false);

  function requestClose() {
    if (onCloseRequest) {
      onCloseRequest();
      return;
    }

    if (shouldConfirmClose) {
      setConfirmingClose(true);
      return;
    }

    onClose();
  }

  function discardAndClose() {
    setConfirmingClose(false);
    onClose();
  }

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        title={title}
        description={description}
        width={width}
        bodyClassName={bodyClassName}
        fitContent={fitContent}
        showCloseButton={showCloseButton}
      >
        {typeof children === "function" ? children(requestClose) : children}
      </Modal>

      <ConfirmationDialog
        open={open && confirmingClose}
        onClose={() => setConfirmingClose(false)}
        onConfirm={discardAndClose}
        title={confirmationTitle}
        description={confirmationDescription}
        cancelLabel="Keep Editing"
        confirmLabel="Discard Changes"
        tone="danger"
      />
    </>
  );
}
