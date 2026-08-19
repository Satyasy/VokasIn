"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

// ponytail: native <dialog> gives focus trap, ESC-to-close and backdrop for free — no headless-ui dependency needed.
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto rounded-xl border border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-neutral-950/40",
        "w-full max-w-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <button
          type="button"
          aria-label="Tutup dialog"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      {children}
    </dialog>
  );
}
