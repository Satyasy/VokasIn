"use client";

import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  value,
  size = 110,
  strokeWidth = 10,
  className,
  label,
  sublabel,
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-100"
          fill="none"
        />
        {/* Animated Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-slime-lime-500 transition-all duration-700 ease-out"
          fill="none"
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-neutral-900 leading-none">
          {label ?? `${clampedValue}%`}
        </span>
        {sublabel && (
          <span className="mt-0.5 text-[10px] font-bold text-neutral-500 leading-tight">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
