"use client";

import { Sun, Moon } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { NotificationDropdown } from "@/components/admin/notification-dropdown";
import { useAdminTheme } from "@/components/admin/admin-theme-context";
import { cn } from "@/lib/utils";

export function AdminTopbar({
  title,
  context,
  nama,
}: {
  title: string;
  context?: string;
  nama: string;
}) {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";
  const inisial = nama.trim().charAt(0).toUpperCase() || "A";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4 transition-colors duration-200",
        isDark
          ? "border-slime-lime-900/60 bg-slime-lime-950/80 backdrop-blur-md text-neutral-100"
          : "border-neutral-200/80 bg-white/80 backdrop-blur-md text-neutral-900"
      )}
    >
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        {context && (
          <p className={cn("mt-0.5 text-xs", isDark ? "text-neutral-400" : "text-neutral-500")}>
            {context}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Theme Dual-Mode (Filament Dark Atmosphere vs Clean Light) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Ganti ke Mode Terang (Filament Clean)" : "Ganti ke Mode Gelap (Hero Atmosphere)"}
          className={cn(
            "flex size-9 items-center justify-center rounded-xl border transition-colors",
            isDark
              ? "border-neutral-800 bg-neutral-900/80 text-slime-lime-400 hover:bg-neutral-800"
              : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          )}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* Lonceng Notifikasi Interaktif */}
        <NotificationDropdown />

        <div className={cn("h-6 w-px", isDark ? "bg-neutral-800" : "bg-neutral-200")} aria-hidden />

        {/* User Badge Profile */}
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-xl bg-slime-lime-500 text-xs font-black text-neutral-950 shadow-xs"
            aria-hidden
          >
            {inisial}
          </span>
          <span className="hidden text-xs font-bold sm:inline">{nama}</span>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}
