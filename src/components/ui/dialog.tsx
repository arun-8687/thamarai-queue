import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  className,
  children,
  title,
}: {
  className?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[min(100%-1.5rem,440px)] -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border border-border bg-surface p-5 shadow-ticket",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <DialogPrimitive.Title className="font-display text-xl font-semibold text-fg">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="rounded-sm p-1 text-muted hover:bg-bg hover:text-fg">
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
