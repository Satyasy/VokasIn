import { cn } from "@/lib/utils";
import type { ElementType, HTMLAttributes } from "react";

/** Single source of truth for section content width — every landing section, the navbar, and the footer share this so left/right edges line up. */
export function SectionContainer({
  as: Tag = "div",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: ElementType }) {
  return <Tag className={cn("mx-auto w-full max-w-5xl px-6", className)} {...props} />;
  return <Tag className={cn("mx-auto w-full max-w-6xl px-8", className)} {...props} />;
}
