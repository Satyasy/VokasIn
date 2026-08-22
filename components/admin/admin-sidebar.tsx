"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/skkni", label: "Dokumen SKKNI", icon: FileText },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

// Sidebar kiri khusus admin — berbeda dari AppNavbar (top nav) yang dipakai
// guru/kaprogli, sesuai spek visual CLAUDE.md/pola admin (Bagian B). Item aktif
// ditandai border kiri primary + background pudar (bukan warna berbeda per item).
export function AdminSidebar() {
  const activePath = usePathname();
  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-1 border-r border-border bg-card px-3 py-4">
      <Link href="/admin" className="mb-4 px-3 text-sm font-semibold tracking-tight text-foreground">
        VokasIn
      </Link>
      {MENU.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? activePath === "/admin" : activePath.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors duration-(--duration-micro)",
              active
                ? "border-primary bg-slime-lime-50 text-foreground"
                : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
