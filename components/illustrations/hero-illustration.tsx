import { type SVGProps } from "react";

export function HeroIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 560 440"
      fill="none"
      role="img"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background glow & accents */}
      <circle cx="280" cy="220" r="180" fill="currentColor" opacity="0.08" />
      <circle cx="440" cy="120" r="40" fill="currentColor" opacity="0.12" />
      <circle cx="100" cy="340" r="30" fill="currentColor" opacity="0.1" />

      {/* Decorative dot grid & sparkle accents */}
      <g opacity="0.3">
        <circle cx="80" cy="80" r="2" fill="currentColor" />
        <circle cx="100" cy="80" r="2" fill="currentColor" />
        <circle cx="120" cy="80" r="2" fill="currentColor" />
        <circle cx="80" cy="100" r="2" fill="currentColor" />
        <circle cx="100" cy="100" r="2" fill="currentColor" />
        <circle cx="120" cy="100" r="2" fill="currentColor" />

        <circle cx="460" cy="320" r="2" fill="currentColor" />
        <circle cx="480" cy="320" r="2" fill="currentColor" />
        <circle cx="500" cy="320" r="2" fill="currentColor" />
        <circle cx="460" cy="340" r="2" fill="currentColor" />
        <circle cx="480" cy="340" r="2" fill="currentColor" />
        <circle cx="500" cy="340" r="2" fill="currentColor" />
      </g>

      {/* Left side: SKKNI Document Base */}
      <g id="skkni-document">
        {/* Document Shadow */}
        <rect
          x="65"
          y="75"
          width="180"
          height="250"
          rx="16"
          fill="currentColor"
          opacity="0.15"
        />
        {/* Document Body */}
        <rect
          x="55"
          y="65"
          width="180"
          height="250"
          rx="16"
          className="fill-neutral-900"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        {/* Document Header Badge */}
        <rect x="75" y="85" width="80" height="14" rx="4" fill="currentColor" opacity="0.8" />
        <rect x="75" y="108" width="140" height="10" rx="3" fill="white" opacity="0.9" />

        {/* Divider */}
        <line
          x1="75"
          y1="128"
          x2="215"
          y2="128"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.3"
        />

        {/* Text lines (Units & Elements) */}
        <rect x="75" y="142" width="120" height="7" rx="2" fill="currentColor" opacity="0.4" />
        <rect x="75" y="157" width="135" height="7" rx="2" fill="currentColor" opacity="0.4" />
        <rect x="75" y="172" width="90" height="7" rx="2" fill="currentColor" opacity="0.4" />

        {/* Element Item 1 */}
        <rect x="75" y="196" width="22" height="22" rx="6" fill="currentColor" opacity="0.2" />
        <line x1="82" y1="207" x2="90" y2="207" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="105" y="200" width="105" height="6" rx="2" fill="white" opacity="0.7" />
        <rect x="105" y="211" width="75" height="6" rx="2" fill="white" opacity="0.4" />

        {/* Element Item 2 */}
        <rect x="75" y="228" width="22" height="22" rx="6" fill="currentColor" opacity="0.2" />
        <line x1="82" y1="239" x2="90" y2="239" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="105" y="232" width="95" height="6" rx="2" fill="white" opacity="0.7" />
        <rect x="105" y="243" width="65" height="6" rx="2" fill="white" opacity="0.4" />

        {/* Element Item 3 */}
        <rect x="75" y="260" width="22" height="22" rx="6" fill="currentColor" opacity="0.2" />
        <line x1="82" y1="271" x2="90" y2="271" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="105" y="264" width="110" height="6" rx="2" fill="white" opacity="0.7" />
        <rect x="105" y="275" width="80" height="6" rx="2" fill="white" opacity="0.4" />
      </g>

      {/* Center Flow: Transformation Path & Particles */}
      <g id="flow-transition">
        {/* Dynamic Curved Connection Line */}
        <path
          d="M 235 190 C 280 190, 270 150, 320 150"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="6 6"
          opacity="0.7"
        />
        <path
          d="M 235 240 C 285 240, 280 270, 320 270"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="6 6"
          opacity="0.7"
        />

        {/* Conversion Pulse Center */}
        <circle cx="280" cy="215" r="26" className="fill-neutral-900" stroke="currentColor" strokeWidth="2" />
        <circle cx="280" cy="215" r="16" fill="currentColor" opacity="0.3" />
        <path
          d="M 274 215 L 286 215 M 281 209 L 287 215 L 281 221"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Right side: Generated Suggestion Cards & Jobsheet Output */}
      <g id="cards-stack">
        {/* Back Card 1 (Tilted) */}
        <g transform="rotate(-6 390 140)">
          <rect
            x="320"
            y="65"
            width="170"
            height="115"
            rx="14"
            fill="currentColor"
            opacity="0.15"
          />
        </g>

        {/* Back Card 2 (Tilted opposite) */}
        <g transform="rotate(4 390 280)">
          <rect
            x="320"
            y="215"
            width="170"
            height="125"
            rx="14"
            className="fill-neutral-900"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </g>

        {/* Main Suggestion Card (Top Front) */}
        <g id="main-card">
          <rect
            x="330"
            y="95"
            width="185"
            height="135"
            rx="14"
            className="fill-neutral-900"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          {/* Card Tag */}
          <rect x="346" y="112" width="60" height="12" rx="4" fill="currentColor" />
          <rect x="475" y="112" width="24" height="12" rx="4" fill="white" opacity="0.2" />

          {/* Card Title */}
          <rect x="346" y="132" width="130" height="8" rx="2" fill="white" opacity="0.9" />

          {/* Card Content lines */}
          <rect x="346" y="148" width="150" height="6" rx="2" fill="white" opacity="0.4" />
          <rect x="346" y="159" width="115" height="6" rx="2" fill="white" opacity="0.4" />

          {/* Card Action / Verified Indicator */}
          <rect x="346" y="180" width="153" height="34" rx="8" fill="currentColor" opacity="0.15" />
          <circle cx="362" cy="197" r="7" fill="currentColor" />
          <path
            d="M 359 197 L 361 199 L 366 194"
            stroke="#0a0a0a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="376" y="194" width="70" height="6" rx="2" fill="white" opacity="0.8" />
        </g>

        {/* Jobsheet Canvas Target Box (Bottom Right) */}
        <g id="canvas-target">
          <rect
            x="315"
            y="250"
            width="200"
            height="130"
            rx="14"
            className="fill-neutral-900"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect x="330" y="266" width="85" height="10" rx="3" fill="currentColor" opacity="0.8" />
          
          <rect x="330" y="286" width="170" height="24" rx="6" fill="white" opacity="0.06" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <rect x="342" y="295" width="90" height="6" rx="2" fill="white" opacity="0.5" />
          
          <rect x="330" y="318" width="170" height="24" rx="6" fill="white" opacity="0.06" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <rect x="342" y="327" width="110" height="6" rx="2" fill="white" opacity="0.5" />

          <rect x="330" y="350" width="60" height="16" rx="4" fill="currentColor" />
          <rect x="398" y="350" width="45" height="16" rx="4" fill="white" opacity="0.2" />
        </g>
      </g>

      {/* Floating Sparkles & Badges */}
      <g transform="translate(480, 70)">
        <polygon points="10,0 12,8 20,10 12,12 10,20 8,12 0,10 8,8" fill="currentColor" />
      </g>
      <g transform="translate(60, 310)">
        <polygon points="8,0 10,6 16,8 10,10 8,16 6,10 0,8 6,6" fill="currentColor" opacity="0.7" />
      </g>
    </svg>
  );
}
