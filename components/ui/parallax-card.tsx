"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";

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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: glareOpacity });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: "1000px" }}
      className="h-full w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transition: isHovered
            ? "transform 100ms ease-out"
            : "transform 450ms cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className={`relative overflow-hidden ${className}`}
      >
        {/* Layered Content */}
        <div style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }} className="h-full w-full">
          {children}
        </div>

        {/* Specular Glare / Sheen Overlay (Apple tvOS Parallax Focus) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 ease-out"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 320px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 80%)`,
          }}
        />

        {/* Ambient Specular Border Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(180, 240, 0, 0.25) 0%, transparent 70%)`,
            mixBlendMode: "overlay",
          }}
        />
      </div>
    </div>
  );
}
