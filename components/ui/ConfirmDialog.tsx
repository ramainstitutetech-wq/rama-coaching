"use client";

import { AlertTriangle, Send } from "lucide-react";
import { Modal } from "./Modal";

type Variant = "danger" | "primary";

const variantStyles: Record<Variant, string> = {
  danger: "bg-red-600 hover:bg-red-700 text-white",
  primary: "bg-[#1F3354] hover:bg-[#162540] text-white",
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  icon?: React.ReactNode;
}) {
  const defaultIcon =
    variant === "primary" ? (
      <Send className="h-5 w-5" />
    ) : (
      <AlertTriangle className="h-5 w-5" />
    );

  const iconBg =
    variant === "primary" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          {icon ?? defaultIcon}
        </div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}
