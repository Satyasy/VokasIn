import Link from "next/link";
import type { Role } from "@/lib/types";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL: Record<Role, string> = {
  guru_produktif: "Guru Produktif",
  kaprogli: "Kaprogli",
};

const ROLE_HOME: Record<Role, string> = {
  guru_produktif: "/guru",
  kaprogli: "/kaprogli",
};

// Navbar untuk halaman yang sudah login (guru & kaprogli) — BEDA dari
// LandingNavbar (components/landing/navbar.tsx) yang isinya tautan section
// landing page (#masalah, #cara-kerja, dst). Menampilkan navbar publik itu di
// sini akan salah konteks (section-section itu tidak ada di halaman guru),
// jadi ini dibuat sebagai varian terpisah. Dipasang sekali di app/guru/layout.tsx
// dan app/kaprogli/layout.tsx supaya tampil konsisten di SEMUA halaman
// turunannya, termasuk /guru/susun/[unitId], /guru/susun/multi, dan /guru/tinjau.
export function AppNavbar({ nama, role }: { nama: string; role: Role }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href={ROLE_HOME[role]} className="text-sm font-semibold tracking-tight text-foreground">
          VokasIn
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="default">{ROLE_LABEL[role]}</Badge>
          {nama && <span className="hidden text-sm text-muted-foreground sm:inline">{nama}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
