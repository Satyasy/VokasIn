"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

interface ParallaxCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
}

export function ParallaxCard({
  children,
  className = "",
  maxTilt = 8,
  glareOpacity = 0.25,
}: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      cardRef.current.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      if (glareRef.current) {
        glareRef.current.style.opacity = `${glareOpacity}`;
        glareRef.current.style.background = `radial-gradient(circle 320px at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 80%)`;
      }

      if (glowRef.current) {
        glowRef.current.style.opacity = "1";
        glowRef.current.style.background = `radial-gradient(circle 280px at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(180, 240, 0, 0.25) 0%, transparent 70%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 100ms ease-out";
    }
  };

  const handleMouseLeave = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 450ms cubic-bezier(0.16, 1, 0.3, 1)";
      cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      style={{ perspective: "1000px" }}
      className="h-full w-full will-change-transform"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className={`relative overflow-hidden ${className}`}
      >
        {/* Layered Content */}
        <div style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }} className="h-full w-full">
          {children}
        </div>

        {/* Specular Glare / Sheen Overlay */}
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out will-change-[opacity,background]"
        />

        {/* Ambient Specular Border Glow */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out will-change-[opacity,background]"
          style={{ mixBlendMode: "overlay" }}
        />
      </div>
    </div>
  );
}
