"use client";

import { useState, type ReactNode } from "react";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import Modal, { type ModalProps } from "@/components/ui/Modal";

interface FormModalProps extends Omit<ModalProps, "children"> {
  children: ReactNode | ((requestClose: () => void) => ReactNode);
  confirmationTitle?: string;
  confirmationDescription?: string;
  shouldConfirmClose?: boolean;
  onCloseRequest?: () => void;
}

export default function FormModal({
  children,
  confirmationTitle = "Discard unsaved changes?",
  confirmationDescription = "Any information entered in this form will be lost.",
  shouldConfirmClose = true,
  onCloseRequest,
  ...modalProps
}: FormModalProps) {
  const [confirmingClose, setConfirmingClose] = useState(false);
  const { open, onClose } = modalProps;

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
      <Modal {...modalProps} onClose={requestClose}>
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
