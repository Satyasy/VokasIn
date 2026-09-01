import { type SVGProps } from "react";

/** Step 1: Pilih Unit Kompetensi - document with checked/active item */
export function StepPilihIkon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-hidden xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="12" y="8" width="40" height="48" rx="8" className="fill-slime-lime-50" stroke="currentColor" strokeWidth="2.5" />
      <rect x="20" y="16" width="24" height="4" rx="2" fill="currentColor" />
      
      {/* Row 1 Active */}
      <rect x="18" y="26" width="28" height="8" rx="4" fill="currentColor" opacity="0.2" />
      <circle cx="23" cy="30" r="2.5" fill="currentColor" />
      <rect x="28" y="28.5" width="14" height="3" rx="1.5" fill="currentColor" />

      {/* Row 2 */}
      <circle cx="23" cy="40" r="2" fill="currentColor" opacity="0.4" />
      <rect x="28" y="38.5" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.4" />

      {/* Row 3 */}
      <circle cx="23" cy="48" r="2" fill="currentColor" opacity="0.4" />
      <rect x="28" y="46.5" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/** Step 2: Baca kartu saran dari teks asli - card with search/magnifier */
export function StepBacaKartu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-hidden xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="10" y="12" width="44" height="38" rx="8" className="fill-slime-lime-50" stroke="currentColor" strokeWidth="2.5" />
      <rect x="18" y="20" width="28" height="3.5" rx="1.5" fill="currentColor" />
      <rect x="18" y="27" width="20" height="3.5" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="18" y="34" width="14" height="3.5" rx="1.5" fill="currentColor" opacity="0.3" />

      {/* Magnifier */}
      <circle cx="42" cy="38" r="8" className="fill-white" stroke="currentColor" strokeWidth="2.5" />
      <line x1="48" y1="44" x2="55" y2="51" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 40 36 A 3 3 0 0 1 44 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Step 3: Seret ke kanvas & cek alat lab - drag pointer & canvas drop */
export function StepSeretKanvas(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-hidden xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Canvas target box */}
      <rect x="8" y="10" width="48" height="42" rx="8" className="fill-slime-lime-50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Dragging item */}
      <rect x="16" y="18" width="28" height="18" rx="5" className="fill-white" stroke="currentColor" strokeWidth="2.5" />
      <rect x="22" y="23" width="16" height="3" rx="1.5" fill="currentColor" />
      <rect x="22" y="29" width="10" height="2.5" rx="1" fill="currentColor" opacity="0.5" />

      {/* Pointer Cursor */}
      <g transform="translate(28, 26)">
        <path
          d="M 6 4 L 18 16 L 13 17 L 17 25 L 13.5 26.5 L 9.5 18.5 L 5 22 Z"
          fill="currentColor"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Step 4: Ekspor jadi dokumen Anda - document with downward export arrow */
export function StepEkspor(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-hidden xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="12" y="8" width="40" height="48" rx="8" className="fill-slime-lime-50" stroke="currentColor" strokeWidth="2.5" />
      <rect x="20" y="16" width="24" height="4" rx="2" fill="currentColor" />
      <rect x="20" y="24" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.4" />

      {/* Download Circle & Arrow */}
      <circle cx="32" cy="40" r="12" fill="currentColor" />
      <path
        d="M 32 34 L 32 44 M 27 40 L 32 45 L 37 40"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="26" y1="48" x2="38" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
