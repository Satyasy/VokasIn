"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ExternalLink,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAdminTheme } from "@/components/admin/admin-theme-context";
import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  badge?: string;
}

const MENU: MenuItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/skkni", label: "Dokumen SKKNI", icon: FileText, badge: "Kandidat" },
  { href: "/admin/pengguna", label: "Pengguna & Guru", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan Sistem", icon: Settings },
];

export function AdminSidebar() {
  const activePath = usePathname();
  const { theme, collapsed, toggleSidebar } = useAdminTheme();

  const isDark = theme === "dark";

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen shrink-0 flex-col justify-between p-3.5 transition-all duration-300 ease-in-out z-30 flex",
        collapsed ? "w-20" : "w-64",
        isDark
          ? "border-r border-slime-lime-900/60 bg-slime-lime-950/95 backdrop-blur-md text-neutral-200"
          : "border-r border-neutral-200 bg-white text-neutral-800 shadow-xs"
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Header & Collapse Toggle */}
        <div
          className={cn(
            "flex items-center pb-4 pt-1 border-b transition-all",
            collapsed ? "justify-center" : "justify-between px-2",
            isDark ? "border-neutral-800/80" : "border-neutral-100"
          )}
        >
          <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slime-lime-500 font-black text-neutral-950 text-sm shadow-md transition-transform hover:scale-105">
              V
            </div>
            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span
                  className={cn(
                    "text-base font-extrabold tracking-tight block truncate",
                    isDark ? "text-white" : "text-neutral-900"
                  )}
                >
                  VokasIn
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slime-lime-400">
                  <ShieldCheck className="size-3" />
                  Filament Admin
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Ciutkan Sidebar (Icon Rail)"
              className={cn(
                "rounded-lg p-1.5 transition-colors",
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>

        {/* Tombol Expand ketika Collapsed */}
        {collapsed && (
          <div className="flex justify-center -mt-2">
            <button
              type="button"
              onClick={toggleSidebar}
              title="Lebarkan Sidebar"
              className={cn(
                "rounded-lg p-1.5 transition-colors",
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <PanelLeftOpen className="size-4" />
            </button>
          </div>
        )}

        {/* Menu Navigasi Utama */}
        <nav className="flex flex-col gap-1.5" aria-label="Menu Admin">
          {MENU.map(({ href, label, icon: Icon, badge }) => {
            const active = href === "/admin" ? activePath === "/admin" : activePath.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl text-xs font-semibold transition-all",
                  collapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5",
                  active
                    ? isDark
                      ? "border-l-2 border-slime-lime-400 bg-slime-lime-500/15 text-slime-lime-300 shadow-xs"
                      : "border-l-2 border-slime-lime-600 bg-slime-lime-100/70 text-slime-lime-950 shadow-xs"
                    : isDark
                    ? "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform group-hover:scale-110",
                    active
                      ? isDark
                        ? "text-slime-lime-400"
                        : "text-slime-lime-700"
                      : isDark
                      ? "text-neutral-400"
                      : "text-neutral-500"
                  )}
                  aria-hidden
                />

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span className="truncate">{label}</span>
                    {badge && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
                          isDark
                            ? "bg-neutral-800 text-slime-lime-400 border border-slime-lime-400/20"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar: System Status & Portal Link */}
      <div
        className={cn(
          "border-t pt-4 flex flex-col gap-3",
          isDark ? "border-neutral-800/80" : "border-neutral-200"
        )}
      >
        {!collapsed ? (
          <>
            <div
              className={cn(
                "rounded-2xl p-3 text-xs border",
                isDark
                  ? "border-neutral-800 bg-neutral-900/60"
                  : "border-neutral-200 bg-neutral-50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slime-lime-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-slime-lime-500" />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-bold",
                    isDark ? "text-neutral-200" : "text-neutral-800"
                  )}
                >
                  Filament Engine Active
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-[10px]",
                  isDark ? "text-neutral-400" : "text-neutral-500"
                )}
              >
                Postgres &bull; 0 Error &bull; Live
              </p>
            </div>

            <Link
              href="/"
              className={cn(
                "inline-flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <span>Halaman Depan</span>
              <ExternalLink className="size-3.5 opacity-60" />
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span
              title="Sistem Aktif"
              className="flex size-3 items-center justify-center rounded-full bg-slime-lime-500"
            />
            <Link
              href="/"
              title="Halaman Depan"
              className={cn(
                "p-2 rounded-lg",
                isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <ExternalLink className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
