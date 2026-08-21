import { type SVGProps, useId } from "react";

// Gaya unDraw: flat, satu warna utama (currentColor), blob latar sebagai tint
// dari warna yang sama — bukan gradasi. ponytail: SVG ditulis tangan mengikuti
// konvensi unDraw (bukan diunduh dari undraw.co) karena sesi ini tidak punya
// akses unduh aset biner; ganti dengan aset unDraw asli yang di-SVGR bila tersedia.
export function DocumentToCardsIllustration({
  gradient = false,
  ...props
}: SVGProps<SVGSVGElement> & { gradient?: boolean }) {
  const gradientId = useId();
  const stack = gradient ? `url(#${gradientId})` : undefined;

  return (
    <svg viewBox="0 0 420 320" fill="none" role="img" aria-hidden {...props}>
      {gradient && (
        <defs>
          {/* Gradasi monokrom slime-lime — bukan hue baru, cuma rentang lightness dalam brand yang sama */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="[stop-color:var(--color-slime-lime-400)]" />
            <stop offset="100%" className="[stop-color:var(--color-slime-lime-900)]" />
          </linearGradient>
        </defs>
      )}
      <circle cx="210" cy="160" r="150" fill="currentColor" opacity="0.12" />

      {/* Dokumen SKKNI */}
      <rect x="48" y="70" width="130" height="170" rx="10" className="fill-card" stroke="currentColor" strokeWidth="3" />
      <line x1="70" y1="106" x2="150" y2="106" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <line x1="70" y1="126" x2="164" y2="126" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <line x1="70" y1="146" x2="140" y2="146" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <line x1="70" y1="176" x2="158" y2="176" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <line x1="70" y1="196" x2="130" y2="196" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <line x1="70" y1="216" x2="150" y2="216" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />

      {/* Panah */}
      <path d="M198 160 H 244" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M234 148 L 248 160 L 234 172" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Tumpukan kartu saran */}
      <rect x="266" y="118" width="120" height="92" rx="10" fill="currentColor" opacity="0.25" transform="rotate(-6 326 164)" />
      <rect x="272" y="132" width="120" height="92" rx="10" fill={stack ?? "currentColor"} />
      <line x1="292" y1="156" x2="360" y2="156" className="stroke-neutral-950" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      <line x1="292" y1="176" x2="372" y2="176" className="stroke-neutral-950" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      <line x1="292" y1="196" x2="344" y2="196" className="stroke-neutral-950" strokeWidth="4" strokeLinecap="round" opacity="0.55" />

      {/* Tangan yang menyeret (metafora keputusan manual) */}
      <circle cx="292" cy="132" r="9" className="fill-neutral-950" opacity="0.85" />
    </svg>
  );
}
