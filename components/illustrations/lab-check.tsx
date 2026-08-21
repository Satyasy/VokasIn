import { type SVGProps } from "react";

// Gaya unDraw: flat, satu warna utama. Lihat catatan ponytail di
// document-to-cards.tsx — sama-sama SVG tulisan tangan mengikuti konvensi unDraw.
export function LabCheckIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 260" fill="none" role="img" aria-hidden {...props}>
      <rect x="10" y="10" width="300" height="240" rx="16" fill="currentColor" opacity="0.12" />

      {/* Papan periksa alat */}
      <rect x="60" y="46" width="150" height="168" rx="10" className="fill-card" stroke="currentColor" strokeWidth="3" />
      <rect x="112" y="34" width="46" height="20" rx="6" fill="currentColor" />

      {/* Baris ceklis */}
      {[80, 116, 152].map((y, i) => (
        <g key={y}>
          <rect x="78" y={y} width="20" height="20" rx="5" fill={i < 2 ? "currentColor" : undefined} className={i < 2 ? undefined : "fill-card stroke-error"} strokeWidth={i < 2 ? 0 : 2} />
          {i < 2 && (
            <path
              d={`M83 ${y + 10} L 90 ${y + 16} L 100 ${y + 4}`}
              className="stroke-neutral-950"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
          <line x1="108" y1={y + 10} x2="192" y2={y + 10} stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
        </g>
      ))}

      {/* Kunci pas — metafora alat lab */}
      <g transform="translate(196 150) rotate(28)">
        <path
          d="M0 0 a10 10 0 1 1 14 14 a10 10 0 0 1 -14 -14 z M8 8 L46 46"
          fill="currentColor"
        />
        <circle cx="46" cy="46" r="9" fill="currentColor" />
      </g>
    </svg>
  );
}
