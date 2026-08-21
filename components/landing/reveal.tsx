"use client";

import { m, type Variants } from "motion/react";
import type { ReactNode } from "react";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: smoothEase } },
};

const viewport = { once: true, amount: 0.15 } as const;

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={item}
    >
      {children}
    </m.div>
  );
}

export function RevealGroup({
  children,
  className,
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </m.div>
  );
}

const itemScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: smoothEase } },
};

export function RevealItem({
  children,
  className,
  scale = false,
}: {
  children: ReactNode;
  className?: string;
  scale?: boolean;
}) {
  return (
    <m.div className={className} variants={scale ? itemScale : item}>
      {children}
    </m.div>
  );
}
