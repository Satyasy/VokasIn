import { getSession } from "@/lib/auth";
import { getGuruById, getProgramKeahlian } from "@/lib/data-access";
import { listDokumenSkkni, listKandidat } from "@/lib/data-access-db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { KandidatCard } from "@/components/admin/kandidat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck } from "lucide-react";

export default async function TinjauKandidatPage() {
  const session = await getSession();
  const admin = session ? getGuruById(session.guruId) : undefined;
  const [kandidatList, dokumenList] = await Promise.all([listKandidat("menunggu"), listDokumenSkkni()]);
  const programList = getProgramKeahlian();

  const dokumenNama = new Map(dokumenList.map((d) => [d.id, d.namaFile ?? d.nomor]));
  const grouped = new Map<string, typeof kandidatList>();
  for (const k of kandidatList) {
    grouped.set(k.dokumenSkkniId, [...(grouped.get(k.dokumenSkkniId) ?? []), k]);
  }

  return (
    <>
      <AdminTopbar
        title="Tinjau Kandidat"
        context="Setiap kandidat wajib diproses satu per satu (bandingkan teks mentah vs hasil parsing)"
        nama={admin?.nama ?? "Admin"}
      />
      <main className="flex-1 px-8 py-6">
        {kandidatList.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="size-8" />}
            title="Tidak ada kandidat menunggu"
            description="Unggah dokumen SKKNI baru di halaman Dokumen SKKNI untuk menghasilkan kandidat."
          />
        ) : (
          <div className="flex flex-col gap-10">
            {[...grouped.entries()].map(([dokumenId, items]) => (
              <section key={dokumenId}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {dokumenNama.get(dokumenId) ?? dokumenId} ({items.length} kandidat)
                </h2>
                <div className="flex flex-col gap-4">
                  {items.map((kandidat) => (
                    <KandidatCard key={kandidat.id} kandidat={kandidat} programList={programList} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
