import { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface SubpageHeroProps {
  badgeIcon: ReactNode;
  badgeText: string;
  title: string;
  titleHighlight?: string;
  oneLiner: string;
  backLink?: {
    href: string;
    label: string;
  };
  stats?: {
    label: string;
    value: string;
  }[];
}

export function SubpageHero({
  badgeIcon,
  badgeText,
  title,
  titleHighlight,
  oneLiner,
  backLink,
  stats,
}: SubpageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slime-lime-950 border-b border-slime-lime-900/60">
      {/* Ambient Radial Glowing Blobs (Harmonis dengan Hero LP) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 size-[420px] rounded-full bg-slime-lime-300 opacity-15 blur-[95px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 right-0 size-[450px] rounded-full bg-slime-lime-500 opacity-12 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/3 size-[300px] rounded-full bg-slime-lime-800 opacity-30 blur-[80px]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 pt-28 sm:pt-32 pb-14 sm:pb-16">
        {backLink && (
          <Link
            href={backLink.href}
            className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-300 backdrop-blur-xs transition-colors hover:border-slime-lime-400/50 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="size-4 text-slime-lime-400" aria-hidden />
            <span>{backLink.label}</span>
          </Link>
        )}

        <div className="flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slime-lime-700/60 bg-slime-lime-900/80 px-3.5 py-1 text-xs font-bold text-slime-lime-300 shadow-sm">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl leading-tight">
            {title}{" "}
            {titleHighlight && (
              <span className="text-slime-lime-400">{titleHighlight}</span>
            )}
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-neutral-300 sm:text-base font-normal">
            {oneLiner}
          </p>

          {stats && stats.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-6 border-t border-white/10 pt-4">
              {stats.map((s, idx) => (
                <div key={idx} className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-extrabold text-slime-lime-400">
                    {s.value}
                  </span>
                  <span className="text-xs font-medium text-neutral-400">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
