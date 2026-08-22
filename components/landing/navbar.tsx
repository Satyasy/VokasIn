"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionContainer } from "@/components/landing/section-container";

const links = [
  { href: "#masalah", label: "Masalah" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#kenapa", label: "Kenapa VokasIn" },
  { href: "#regulasi", label: "Regulasi & Dana" },
  { href: "#faq", label: "FAQ" },
];

// Rute publik (bukan section landing page) — bisa diakses siapa pun tanpa
// login, karenanya pakai Link biasa, bukan anchor scroll seperti `links` di atas.
const publicToolLinks = [
  { href: "/roadmap", label: "Roadmap Kompetensi" },
  { href: "/jelajah-kompetensi", label: "Jelajah Kompetensi" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const threshold = hero ? hero.offsetHeight : 400;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-sm transition-colors duration-(--duration-ui) ${
        scrolled
          ? "glass glass-nav border-black/10 bg-background/75 dark:border-white/10"
          : "border-transparent bg-background/40"
      }`}
    >
      <SectionContainer as="nav" className="flex items-center justify-between gap-4 py-3">
        <Link href="#hero" className="text-sm font-semibold tracking-tight text-foreground">
          VokasIn
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
          {publicToolLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/guru"
          className="inline-flex h-9 items-center rounded-lg bg-cta-primary px-4 text-sm font-medium text-cta-primary-foreground transition-colors hover:bg-neutral-800"
        >
          Mulai coba
        </Link>
      </SectionContainer>
    </header>
  );
}
