"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, NotebookPen, ArrowRight } from "lucide-react";
import { useModulAjarDraft } from "@/lib/modul-ajar-draft-context";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Kanvas draft — dipakai baik dari alur cari-unit-satu-per-satu
// (susun-modul-client.tsx) maupun alur "Asisten Kebutuhan Modul"
// (multi-unit-susun-client.tsx). Diekstrak supaya kedua alur berbagi satu
// implementasi kartu draft, bukan dua salinan yang bisa menyimpang.
//
// Ekspor TIDAK lagi bisa langsung dari sini — dipindah jadi langkah terakhir
// di /guru/tinjau (Tinjau Akhir) supaya guru selalu membaca ulang draft utuh
// sebelum mengekspor, bukan langsung dari kanvas kerja yang kartunya kecil-kecil.
export function DraftCanvas({ onDropTopikId }: { onDropTopikId: (topikId: string) => void }) {
  const { unitGroups, jumlahKartu, ubahCatatanPedagogi } = useModulAjarDraft();
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropTopikId(id);
  }

  const jumlahCatatanTerisi = unitGroups.reduce(
    (n, g) => n + g.topikDiterima.filter((t) => t.catatanPedagogi?.trim()).length,
    0
  );

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Modul ajar: {unitGroups.length} unit
        </h2>
        <div className="flex items-center gap-2">
          {jumlahKartu > 0 && (
            <Badge variant={jumlahCatatanTerisi === jumlahKartu ? "success" : "default"}>
              <NotebookPen className="size-3" aria-hidden />
              Catatan pedagogi {jumlahCatatanTerisi}/{jumlahKartu}
            </Badge>
          )}
          <Link
            href="/guru/tinjau"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-neutral-200"
          >
            Tinjau &amp; ekspor
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "min-h-[16rem] rounded-xl border-2 border-dashed p-4 transition-colors duration-(--duration-micro)",
          isDragOver ? "border-primary bg-slime-lime-50" : "border-border"
        )}
      >
        {unitGroups.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-8" />}
            title="Seret kartu saran ke sini"
            description="Atau gunakan tombol “Tambahkan ke modul ajar” pada tiap kartu. Kartu dari unit kompetensi lain yang sudah Anda buka sebelumnya juga akan terkumpul di sini."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {unitGroups.map((group) => (
              <div key={group.unit.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                <div className="mb-3 border-b border-neutral-200/80 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand" className="font-bold">{group.unit.kodeUnit}</Badge>
                    <span className="text-sm font-bold text-neutral-900">{group.unit.judulUnit}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-neutral-500">{group.unit.sumber}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {group.topikDiterima.map((topik, i) => (
                    <Card key={topik.id} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-slime-lime-100 text-xs font-extrabold text-slime-lime-950">
                          {i + 1}
                        </span>
                        <CardTitle className="text-sm font-bold text-neutral-900 leading-snug">{topik.judul}</CardTitle>
                      </div>
                      <Textarea
                        className="mt-3 text-xs"
                        label="Catatan cara mengajar / strategi pedagogi untuk kompetensi ini"
                        placeholder="Mis. mulai dengan demo alat di proyektor, lalu penugasan praktik berpasangan…"
                        rows={2}
                        value={topik.catatanPedagogi ?? ""}
                        onChange={(e) => ubahCatatanPedagogi(topik.id, e.target.value)}
                      />
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
