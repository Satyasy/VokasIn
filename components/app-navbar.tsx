"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import type { Role } from "@/lib/types";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL: Record<Role, string> = {
  guru_produktif: "Guru Produktif",
  kaprogli: "Kaprogli",
  admin: "Admin",
};

const ROLE_HOME: Record<Role, string> = {
  guru_produktif: "/guru",
  kaprogli: "/kaprogli",
  admin: "/admin",
};

const ROLE_WORKSPACE_LABEL: Record<Role, string> = {
  guru_produktif: "Ruang Guru",
  kaprogli: "Dasbor Kaprogli",
  admin: "Dasbor Admin",
};

const publicToolLinks = [
  { href: "/roadmap", label: "Roadmap" },
  { href: "/jelajah-kompetensi", label: "Jelajah" },
];

export function AppNavbar({ nama, role }: { nama: string; role: Role }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

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
      highlightRef.current.style.background = `radial-gradient(circle 200px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(255, 255, 255, 0.95) 0%, rgba(180, 240, 0, 0.18) 40%, transparent 70%)`;
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
        className="relative flex items-center justify-between w-full rounded-full px-4 py-2 sm:px-7 sm:py-2.5 border border-neutral-200/90 bg-white/85 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl text-neutral-900 overflow-hidden transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Specular Liquid Glass Highlight */}
        <div
          ref={highlightRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ease-out will-change-[opacity,background]"
        />

        {/* Left Section: Logo & Links */}
        <div className="relative z-10 flex items-center gap-6">
          <Link
            href={ROLE_HOME[role]}
            className="group flex items-center gap-2.5 rounded-full px-2 py-1 transition-transform duration-200 ease-out hover:scale-105 shrink-0"
          >
            <Image
              src="/logo.png"
              alt="Logo VokasIn"
              width={30}
              height={30}
              className="size-7 rounded-lg object-contain transition-transform duration-200 ease-out group-hover:scale-115"
              priority
            />
            <span className="text-base font-extrabold tracking-tight text-neutral-900">
              VokasIn
            </span>
          </Link>

          <ul className="hidden items-center gap-2 md:flex">
            <li>
              <Link
                href={ROLE_HOME[role]}
                className="rounded-full px-3 py-1 text-xs font-bold text-slime-lime-900 bg-slime-lime-100/90 border border-slime-lime-300/80 transition-all duration-200 hover:bg-slime-lime-200"
              >
                {ROLE_WORKSPACE_LABEL[role]}
              </Link>
            </li>
            {publicToolLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-3.5 py-1 text-sm font-semibold text-neutral-700 transition-all duration-200 ease-out hover:scale-108 hover:bg-neutral-900/8 hover:text-slime-lime-900 active:scale-95"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section: Role Badge, Name, Logout & Mobile Button */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <Badge
            variant="brand"
            className="rounded-full border border-slime-lime-300 bg-slime-lime-100 px-3 py-0.5 text-xs font-bold text-slime-lime-950 shadow-sm"
          >
            {ROLE_LABEL[role]}
          </Badge>

          {nama && (
            <span className="hidden text-sm font-semibold text-neutral-700 lg:inline">
              {nama}
            </span>
          )}

          <div className="hidden sm:inline-block pl-1">
            <LogoutButton />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex md:hidden size-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-95"
          >
            {mobileMenuOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </nav>

      {/* Floating Glass Dropdown Card for Mobile */}
      {mobileMenuOpen && (
        <div className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white/95 p-4 text-neutral-900 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-300 md:hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-1.5">
            {nama && (
              <div className="px-3 py-1.5 border-b border-neutral-100 mb-1">
                <p className="text-xs text-neutral-500">Masuk sebagai</p>
                <p className="text-sm font-bold text-neutral-900">{nama}</p>
              </div>
            )}

            <Link
              href={ROLE_HOME[role]}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slime-lime-900 bg-slime-lime-100/70 transition-colors"
            >
              {ROLE_WORKSPACE_LABEL[role]}
            </Link>

            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slime-lime-700">
              Alat &amp; Referensi SKKNI
            </p>
            {publicToolLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-neutral-100 hover:text-slime-lime-900"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Akhiri sesi akun</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
