import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Varian navbar paling sederhana — dipakai HANYA di /login. Guru yang belum
// masuk tidak butuh (dan tidak bisa memakai) tautan section landing page
// publik, tapi tetap butuh jalan kembali/orientasi (Bagian A.2), jadi cukup
// nama VokasIn + tautan kembali ke beranda.
export function LoginNavbar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <span className="text-sm font-semibold tracking-tight text-foreground">VokasIn</span>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke beranda
        </Link>
      </div>
    </header>
  );
}
