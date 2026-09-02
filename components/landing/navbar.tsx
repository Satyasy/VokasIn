"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#regulasi", label: "Regulasi" },
  { href: "/#faq", label: "FAQ" },
];

const publicToolLinks = [
  { href: "/roadmap", label: "Roadmap Kompetensi" },
  { href: "/jelajah-kompetensi", label: "Jelajah Kompetensi" },
  { href: "/kunjungan-industri", label: "Mitra Industri" },
];

export function LandingNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!isHome) {
      return;
    }
    const hero = document.getElementById("hero");
    const threshold = hero ? hero.offsetHeight * 0.45 : 250;
    const onScroll = () => {
      const isPast = window.scrollY > threshold;
      setScrolled((prev) => (prev !== isPast ? isPast : prev));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isDarkGlass = isHome && !scrolled;

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!navRef.current || !highlightRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      if (!highlightRef.current) return;
      highlightRef.current.style.opacity = "1";
      highlightRef.current.style.background = isDarkGlass
        ? `radial-gradient(circle 200px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(255, 255, 255, 0.22) 0%, rgba(180, 240, 0, 0.12) 35%, transparent 70%)`
        : `radial-gradient(circle 200px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(255, 255, 255, 0.9) 0%, rgba(180, 240, 0, 0.15) 40%, transparent 70%)`;
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    if (highlightRef.current) {
      highlightRef.current.style.opacity = "0";
    }
  };

  return (
    <header className="fixed top-4 inset-x-0 mx-auto z-50 flex flex-col items-center w-[92%] sm:w-[85%] max-w-7xl will-change-transform">
      <nav
        ref={navRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center justify-between w-full rounded-full px-4 py-2 sm:px-7 sm:py-2.5 border overflow-hidden transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDarkGlass
            ? "bg-neutral-950/45 border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl text-neutral-50"
            : "bg-white/80 border-neutral-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl text-neutral-900"
        }`}
      >
        {/* Liquid Glass Real-Time Specular Highlight Layer */}
        <div
          ref={highlightRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ease-out will-change-[opacity,background]"
        />

        {/* Ambient Top Edge Refraction Sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />

        {/* Logo & Brand Name */}
        <Link
          href="/"
          className="group relative z-10 flex items-center gap-2.5 rounded-full px-2 py-1 transition-transform duration-200 ease-out hover:scale-105 shrink-0"
        >
          <Image
            src="/logo.png"
            alt="Logo VokasIn"
            width={32}
            height={32}
            className="size-7 sm:size-8 rounded-lg object-contain transition-transform duration-200 ease-out group-hover:scale-115"
            priority
          />
          <span
            className={`text-base font-extrabold tracking-tight transition-colors duration-300 ${
              isDarkGlass ? "text-neutral-50" : "text-neutral-900"
            }`}
          >
            VokasIn
          </span>
        </Link>

        {/* Navigation Menu Links (Desktop) */}
        <ul className="relative z-10 hidden items-center gap-2 lg:gap-4 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative inline-block rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-108 active:scale-95 ${
                  isDarkGlass
                    ? "text-neutral-200 hover:text-slime-lime-300 hover:bg-white/15 hover:shadow-[0_4px_24px_rgba(255,255,255,0.18)] hover:backdrop-blur-xl"
                    : "text-neutral-700 hover:text-slime-lime-900 hover:bg-neutral-900/8 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:backdrop-blur-xl"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Divider */}
          <li
            className={`h-4 w-px transition-colors duration-300 ${
              isDarkGlass ? "bg-white/20" : "bg-neutral-300"
            }`}
            aria-hidden
          />

          {/* Public Tools */}
          {publicToolLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative inline-block rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-108 active:scale-95 ${
                  isDarkGlass
                    ? "text-neutral-200 hover:text-slime-lime-300 hover:bg-white/15 hover:shadow-[0_4px_24px_rgba(255,255,255,0.18)] hover:backdrop-blur-xl"
                    : "text-neutral-700 hover:text-slime-lime-900 hover:bg-neutral-900/8 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:backdrop-blur-xl"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Section: Desktop CTA & Mobile Hamburger Button */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <Link
            href="/guru"
            className="hidden sm:inline-flex h-9 items-center rounded-full bg-slime-lime-500 px-5 text-sm font-bold text-neutral-950 shadow-sm transition-all duration-200 ease-out hover:scale-108 hover:bg-slime-lime-400 hover:shadow-[0_0_28px_rgba(180,240,0,0.5)] active:scale-95 shrink-0"
          >
            Mulai coba
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
            className={`inline-flex md:hidden size-9 items-center justify-center rounded-full border transition-all active:scale-95 ${
              isDarkGlass
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-neutral-200 bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            }`}
          >
            {mobileMenuOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </nav>

      {/* Floating Glass Dropdown Card for Mobile */}
      {mobileMenuOpen && (
        <div
          className={`mt-2 w-full rounded-3xl border p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 md:hidden animate-in fade-in slide-in-from-top-2 ${
            isDarkGlass
              ? "border-white/15 bg-neutral-950/90 text-neutral-50 shadow-[0_16px_50px_rgba(0,0,0,0.6)]"
              : "border-neutral-200 bg-white/95 text-neutral-900 shadow-[0_16px_50px_rgba(0,0,0,0.12)]"
          }`}
        >
          <div className="flex flex-col gap-1.5">
            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slime-lime-600">
              Navigasi Halaman
            </p>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  isDarkGlass
                    ? "hover:bg-white/10 hover:text-slime-lime-300"
                    : "hover:bg-neutral-100 hover:text-slime-lime-800"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-1 border-t border-neutral-200/20" />

            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slime-lime-600">
              Alat Terbuka SKKNI
            </p>
            {publicToolLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  isDarkGlass
                    ? "hover:bg-white/10 hover:text-slime-lime-300"
                    : "hover:bg-neutral-100 hover:text-slime-lime-800"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 pt-2 border-t border-neutral-200/20">
              <Link
                href="/guru"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-slime-lime-500 py-2.5 text-sm font-bold text-neutral-950 shadow-sm transition-all hover:bg-slime-lime-400 active:scale-95"
              >
                Mulai coba aplikasi
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
