"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

function DotGrid() {
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

export function HeroBackdropShape() {
  return <DotGrid />;
}

export function SectionBackdropShape() {
  return <DotGrid />;
}
