import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureGuruCacheFresh } from "@/lib/data-access-db";
import { getGuruById } from "@/lib/data-access";
import { ModulAjarDraftProvider } from "@/lib/modul-ajar-draft-context";
import { AppNavbar } from "@/components/app-navbar";

// Provider di sini (bukan di tiap page) supaya draft modul ajar selamat dari
// navigasi client-side antara /guru (pilih unit) dan /guru/susun/[unitId] —
// keduanya tetap di bawah layout yang sama sehingga tidak di-unmount.
//
// AppNavbar juga dipasang di sini (bukan per-page) supaya navbar guru yang
// sudah login tampil konsisten di SEMUA halaman turunan /guru/*, termasuk
// /guru/susun/[unitId], /guru/susun/multi, dan /guru/tinjau — sebelumnya
// halaman-halaman ini sama sekali tidak memanggil navbar apa pun (LandingNavbar
// hanya dipanggil manual di app/page.tsx), bukan navbar yang tersembunyi/rusak.
export default async function GuruLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureGuruCacheFresh();
  const guru = getGuruById(session.guruId);

  return (
    <ModulAjarDraftProvider>
      <AppNavbar nama={guru?.nama ?? ""} role={session.role} />
      {children}
    </ModulAjarDraftProvider>
  );
}
