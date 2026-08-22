import { getSession } from "@/lib/auth";
import { getGuruById, getProgramKeahlian } from "@/lib/data-access";
import { listAllGuru } from "@/lib/data-access-db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { CreateGuruForm } from "@/components/admin/create-guru-form";
import { PenggunaTable } from "@/components/admin/pengguna-table";

export default async function PenggunaPage() {
  const session = await getSession();
  const admin = session ? getGuruById(session.guruId) : undefined;
  const guruList = await listAllGuru();
  const programList = getProgramKeahlian();

  return (
    <>
      <AdminTopbar
        title="Manajemen Pengguna"
        context="Guru produktif, kaprogli, dan admin — satu tabel akun untuk seluruh sekolah"
        nama={admin?.nama ?? "Admin"}
      />
      <main className="flex-1 px-8 py-6">
        <CreateGuruForm programList={programList} />
        <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Seluruh akun ({guruList.length})
        </h2>
        <PenggunaTable guruList={guruList} programList={programList} currentUserId={session?.guruId ?? ""} />
      </main>
    </>
  );
}
