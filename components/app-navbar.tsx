"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, type MouseEvent } from "react";
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

const publicToolLinks = [
  { href: "/roadmap", label: "Roadmap" },
  { href: "/jelajah-kompetensi", label: "Jelajah" },
];

export function AppNavbar({ nama, role }: { nama: string; role: Role }) {
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
    <header className="fixed top-4 inset-x-0 mx-auto z-50 flex justify-center w-[92%] sm:w-[85%] max-w-7xl will-change-transform">
      <nav
        ref={navRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-between w-full rounded-full px-5 py-2 sm:px-7 sm:py-2.5 border border-neutral-200/90 bg-white/85 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl text-neutral-900 overflow-hidden transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
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

        {/* Right Section: Role Badge, Name, & Logout */}
        <div className="relative z-10 flex items-center gap-3">
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

          <div className="pl-1">
            <LogoutButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
