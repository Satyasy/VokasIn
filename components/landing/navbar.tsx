"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionContainer } from "@/components/landing/section-container";

const links = [
  { href: "#stats", label: "Tantangan" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#kenapa", label: "Kenapa VokasIn" },
  { href: "#regulasi", label: "Regulasi" },
  { href: "#faq", label: "FAQ" },
];

const publicToolLinks = [
  { href: "/roadmap", label: "Roadmap Kompetensi" },
  { href: "/jelajah-kompetensi", label: "Jelajah Kompetensi" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const threshold = hero ? hero.offsetHeight * 0.6 : 400;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-neutral-950/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <SectionContainer as="nav" className="flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-50">
          <Image
            src="/logo.png"
            alt="Logo VokasIn"
            width={36}
            height={36}
            className="rounded-md object-contain"
            priority
          />
          <span>VokasIn</span>
        </Link>
        <ul className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-neutral-300 transition-colors hover:text-neutral-50"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="h-4 w-px bg-white/20" aria-hidden />
          {publicToolLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-neutral-300 transition-colors hover:text-neutral-50"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/guru"
          className="inline-flex h-9 items-center rounded-lg bg-slime-lime-500 px-4 text-sm font-medium text-neutral-950 transition-colors hover:bg-slime-lime-400"
        >
          Mulai coba
        </Link>
      </SectionContainer>
    </header>
  );
}
