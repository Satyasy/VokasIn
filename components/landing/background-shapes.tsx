"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Dot-grid backdrop — Hero & FAQ. Self-contained: parent section needs `overflow-hidden`. */
export function DotGridTexture() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "25%"]);

  return (
    <m.div
      className="dot-grid pointer-events-none absolute inset-0 -z-10"
      style={{ y }}
      aria-hidden
    />
  );
}

/** Hairline-grid backdrop — Masalah & Cara Kerja. Static, no parallax needed. */
export function HairlineGridTexture() {
  return (
    <div className="hairline-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
  );
}
