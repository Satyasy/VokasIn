import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-slime-lime-200 text-slime-lime-900",
  success: "bg-success/15 text-success-fg",
  warning: "bg-warning/20 text-neutral-900",
  error: "bg-error-bg text-error",
  info: "bg-info-bg text-info",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
