import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureGuruCacheFresh } from "@/lib/data-access-db";
import { getGuruById } from "@/lib/data-access";
import { AppNavbar } from "@/components/app-navbar";

// Sama seperti app/guru/layout.tsx — sebelumnya /kaprogli dan /kaprogli/lab
// tidak memanggil navbar apa pun sama sekali, cukup tombol "Keluar" lepas per
// halaman. Dipasang di sini supaya navbar tampil konsisten di semua turunannya.
export default async function KaprogliLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureGuruCacheFresh();
  const guru = getGuruById(session.guruId);

  return (
    <>
      <AppNavbar nama={guru?.nama ?? ""} role={session.role} />
      {children}
    </>
  );
}
