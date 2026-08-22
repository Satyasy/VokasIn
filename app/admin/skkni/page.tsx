import { CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { listDokumenSkkni } from "@/lib/data-access-db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UploadSkkniForm } from "@/components/admin/upload-skkni-form";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export default async function AdminSkkniPage({
  searchParams,
}: {
  searchParams: Promise<{ diunggah?: string }>;
}) {
  const session = await getSession();
  const admin = session ? getGuruById(session.guruId) : undefined;
  const dokumen = await listDokumenSkkni();
  const { diunggah } = await searchParams;

  return (
    <>
      <AdminTopbar
        title="Dokumen SKKNI"
        context="Unggah PDF SKKNI baru, hasil parsing masuk sebagai kandidat menunggu tinjauan"
        nama={admin?.nama ?? "Admin"}
      />
      <main className="flex-1 px-8 py-6">
        {diunggah && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-success/15 px-4 py-3 text-sm text-success-fg">
            <CheckCircle2 className="size-4" aria-hidden />
            {diunggah} kandidat unit baru siap ditinjau di halaman Tinjau Kandidat.
          </div>
        )}

        <UploadSkkniForm />

        <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Riwayat unggahan
        </h2>
        {dokumen.length === 0 ? (
          <EmptyState icon={<FileText className="size-8" />} title="Belum ada dokumen SKKNI" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Nomor Dokumen</th>
                  <th className="px-4 py-2.5 font-medium">Nama File</th>
                  <th className="px-4 py-2.5 font-medium">Diunggah</th>
                </tr>
              </thead>
              <tbody>
                {dokumen.map((d, i) => (
                  <tr key={d.id} className={i % 2 === 1 ? "bg-neutral-50" : undefined}>
                    <td className="px-4 py-2.5 text-foreground">{d.nomor}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{d.namaFile ?? "(seed manual)"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {d.diuploadPada ? new Date(d.diuploadPada).toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
