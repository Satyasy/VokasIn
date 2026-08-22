import { Bell } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

// Top bar area konten admin: judul halaman + konteks di kiri, notifikasi +
// menu akun (inisial dalam lingkaran) di kanan — CLAUDE.md Bagian B.
export function AdminTopbar({ title, context, nama }: { title: string; context?: string; nama: string }) {
  const inisial = nama.trim().charAt(0).toUpperCase() || "A";
  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-8 py-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {context && <p className="text-sm text-muted-foreground">{context}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifikasi"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-5" aria-hidden />
        </button>
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            aria-hidden
          >
            {inisial}
          </span>
          <span className="hidden text-sm text-foreground sm:inline">{nama}</span>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
