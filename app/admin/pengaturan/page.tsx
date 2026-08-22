import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { AdminTopbar } from "@/components/admin/admin-topbar";

// ponytail: halaman placeholder — Pengaturan ada di sidebar (spek visual)
// tapi isinya belum ditentukan (di luar cakupan sesi ini, CLAUDE.md Bagian F).
export default async function PengaturanPage() {
  const session = await getSession();
  const admin = session ? getGuruById(session.guruId) : undefined;
  return (
    <>
      <AdminTopbar title="Pengaturan" nama={admin?.nama ?? "Admin"} />
      <main className="flex-1 px-8 py-6">
        <p className="text-muted-foreground">Belum ada pengaturan yang bisa diubah di sesi ini.</p>
      </main>
    </>
  );
}
