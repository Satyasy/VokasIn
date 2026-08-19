import { type SVGProps } from "react";

// Gaya unDraw: flat, satu warna utama (currentColor), blob latar sebagai tint
// dari warna yang sama — bukan gradasi. ponytail: SVG ditulis tangan mengikuti
// konvensi unDraw (bukan diunduh dari undraw.co) karena sesi ini tidak punya
// akses unduh aset biner; ganti dengan aset unDraw asli yang di-SVGR bila tersedia.
export function DocumentToCardsIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 420 320" fill="none" role="img" aria-hidden {...props}>
      <circle cx="210" cy="160" r="150" className="fill-slime-lime-100" />

      {/* Dokumen SKKNI */}
      <rect x="48" y="70" width="130" height="170" rx="10" className="fill-card stroke-slime-lime-700" strokeWidth="3" />
      <line x1="70" y1="106" x2="186" y2="106" className="stroke-slime-lime-700" strokeWidth="3" strokeLinecap="round" opacity="0" />
      <line x1="70" y1="106" x2="150" y2="106" className="stroke-slime-lime-300" strokeWidth="4" strokeLinecap="round" />
      <line x1="70" y1="126" x2="164" y2="126" className="stroke-slime-lime-300" strokeWidth="4" strokeLinecap="round" />
      <line x1="70" y1="146" x2="140" y2="146" className="stroke-slime-lime-300" strokeWidth="4" strokeLinecap="round" />
      <line x1="70" y1="176" x2="158" y2="176" className="stroke-slime-lime-300" strokeWidth="4" strokeLinecap="round" />
      <line x1="70" y1="196" x2="130" y2="196" className="stroke-slime-lime-300" strokeWidth="4" strokeLinecap="round" />
      <line x1="70" y1="216" x2="150" y2="216" className="stroke-slime-lime-300" strokeWidth="4" strokeLinecap="round" />

      {/* Panah */}
      <path d="M198 160 H 244" className="stroke-slime-lime-700" strokeWidth="3" strokeLinecap="round" />
      <path d="M234 148 L 248 160 L 234 172" className="stroke-slime-lime-700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Tumpukan kartu saran */}
      <rect x="266" y="118" width="120" height="92" rx="10" className="fill-slime-lime-200" transform="rotate(-6 326 164)" />
      <rect x="272" y="132" width="120" height="92" rx="10" className="fill-slime-lime-600" />
      <line x1="292" y1="156" x2="360" y2="156" className="stroke-slime-lime-900" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <line x1="292" y1="176" x2="372" y2="176" className="stroke-slime-lime-900" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <line x1="292" y1="196" x2="344" y2="196" className="stroke-slime-lime-900" strokeWidth="4" strokeLinecap="round" opacity="0.6" />

      {/* Tangan yang menyeret (metafora keputusan manual) */}
      <circle cx="292" cy="132" r="9" className="fill-slime-lime-950" />
    </svg>
  );
}
