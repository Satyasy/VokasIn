/** Jahitan visual full-bleed antar-section — bukan konten, jangan taruh teks di sini. */
export function SectionTransition({
  from,
  to,
  className = "h-24 sm:h-32",
}: {
  from: string;
  to: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }}
    />
  );
}
