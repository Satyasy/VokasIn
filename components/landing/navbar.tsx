"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#regulasi", label: "Regulasi" },
  { href: "/#faq", label: "FAQ" },
];

const publicToolLinks = [
  { href: "/roadmap", label: "Roadmap Kompetensi" },
  { href: "/jelajah-kompetensi", label: "Jelajah Kompetensi" },
];

export function LandingNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      return;
    }
    const hero = document.getElementById("hero");
    const threshold = hero ? hero.offsetHeight * 0.45 : 250;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const isDarkGlass = isHome && !scrolled;

  return (
    <header className="fixed top-4 inset-x-0 mx-auto z-50 flex justify-center w-[92%] sm:w-[85%] max-w-7xl">
      <nav
        className={`flex items-center justify-between w-full rounded-full px-5 py-2 sm:px-7 sm:py-2.5 border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDarkGlass
            ? "bg-neutral-950/40 border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl text-neutral-50"
            : "bg-white/75 border-neutral-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl text-neutral-900"
        }`}
      >
        {/* Logo & Brand Name with Glass Zoom */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-full px-2.5 py-1 transition-all duration-200 ease-out hover:scale-105 shrink-0"
        >
          <Image
            src="/logo.png"
            alt="Logo VokasIn"
            width={32}
            height={32}
            className="size-8 rounded-lg object-contain transition-transform duration-200 ease-out group-hover:scale-115"
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

        {/* Navigation Menu Links with Glass Magnifier Effect */}
        <ul className="hidden items-center gap-3 lg:gap-5 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`inline-block rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
                  isDarkGlass
                    ? "text-neutral-200 hover:text-slime-lime-300 hover:bg-white/15 hover:backdrop-blur-md hover:shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                    : "text-neutral-700 hover:text-slime-lime-800 hover:bg-neutral-900/8 hover:backdrop-blur-md hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
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

          {/* Public Tools with Glass Magnifier Effect */}
          {publicToolLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`inline-block rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
                  isDarkGlass
                    ? "text-neutral-200 hover:text-slime-lime-300 hover:bg-white/15 hover:backdrop-blur-md hover:shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                    : "text-neutral-700 hover:text-slime-lime-800 hover:bg-neutral-900/8 hover:backdrop-blur-md hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Button with Glass Glow Lift */}
        <Link
          href="/guru"
          className="inline-flex h-9 items-center rounded-full bg-slime-lime-500 px-5 text-sm font-bold text-neutral-950 shadow-sm transition-all duration-200 ease-out hover:scale-108 hover:bg-slime-lime-400 hover:shadow-[0_0_24px_rgba(180,240,0,0.45)] active:scale-95 shrink-0"
        >
          Mulai coba
        </Link>
      </nav>
    </header>
  );
}
