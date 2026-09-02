"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/skkni", label: "Dokumen SKKNI", icon: FileText },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

export function AdminSidebar() {
  const activePath = usePathname();

  return (
    <aside className="flex min-h-screen w-60 shrink-0 flex-col justify-between border-r border-neutral-800 bg-neutral-950 p-4 text-neutral-200">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="border-b border-neutral-800/80 pb-4 px-2">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-slime-lime-500 font-black text-neutral-950 text-sm shadow-md">
              V
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">
                VokasIn
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slime-lime-400">
                <ShieldCheck className="size-3" />
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="flex flex-col gap-1.5" aria-label="Menu Admin">
          {MENU.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? activePath === "/admin" : activePath.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                  active
                    ? "border-l-2 border-slime-lime-400 bg-slime-lime-500/15 text-slime-lime-300 shadow-xs"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                )}
              >
                <Icon
                  className={cn("size-4 shrink-0", active ? "text-slime-lime-400" : "text-neutral-500")}
                  aria-hidden
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar: System Health & Quick Exit */}
      <div className="border-t border-neutral-800/80 pt-4 flex flex-col gap-3">
        <div className="rounded-xl border border-neutral-800/90 bg-neutral-900/60 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slime-lime-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-slime-lime-500" />
            </span>
            <span className="text-[11px] font-bold text-neutral-300">Sistem Aktif &amp; Siap</span>
          </div>
          <p className="mt-1 text-[10px] text-neutral-500">Postgres DB &bull; 0 Error</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
        >
          <span>Halaman Beranda</span>
          <ExternalLink className="size-3.5 text-neutral-500" />
        </Link>
      </div>
    </aside>
  );
}
