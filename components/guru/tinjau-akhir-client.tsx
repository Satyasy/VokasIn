"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Download, Inbox } from "lucide-react";
import type { ProgramKeahlian } from "@/lib/types";
import { useModulAjarDraft } from "@/lib/modul-ajar-draft-context";
import { buildModulAjarDocument, buildExportFilename, downloadBlob } from "@/lib/export-modul-ajar";
import { buildModulAjarMarkdown } from "@/lib/export-modul-ajar-md";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";

type Format = "md" | "pdf" | "docx";

// Tinjau Akhir — langkah HITL terakhir sebelum ekspor (ARCHITECTURE.md §Layer 4).
// Murni tampilan baca+edit ringan di atas ModulAjarDraft/SaranTopik yang sudah
// ada — TIDAK ADA logika pencarian/pencocokan baru di sini. Guru membaca ulang
// semua kartu yang sudah diterima dalam satu alur baca (bukan kartu kecil
// terpisah seperti di kanvas kerja), masih bisa menghapus satu kartu atau
// mengedit catatan pedagogi langsung di tempat, baru kemudian mengekspor.
export function TinjauAkhirClient({ programList }: { programList: ProgramKeahlian[] }) {
  const { programKeahlianId, unitGroups, jumlahKartu, ubahCatatanPedagogi, hapusDariDraft } = useModulAjarDraft();
  const [isExporting, setIsExporting] = useState<Format | null>(null);

  async function handleExport(format: Format) {
    const program = programList.find((p) => p.id === programKeahlianId);
    const slug = program?.singkatan ?? programKeahlianId ?? "draft";
    setIsExporting(format);
    try {
      const dokumen = buildModulAjarDocument(program?.nama ?? "(peminatan belum ditentukan)", unitGroups);
      if (format === "md") {
        downloadBlob(
          buildExportFilename(slug, "md"),
          new Blob([buildModulAjarMarkdown(dokumen)], { type: "text/markdown" })
        );
      } else if (format === "pdf") {
        const { buildModulAjarPdfBlob } = await import("@/lib/export-modul-ajar-pdf");
        downloadBlob(buildExportFilename(slug, "pdf"), await buildModulAjarPdfBlob(dokumen));
      } else {
        const { buildModulAjarDocx } = await import("@/lib/export-modul-ajar-docx");
        downloadBlob(buildExportFilename(slug, "docx"), await buildModulAjarDocx(dokumen));
      }
    } finally {
      setIsExporting(null);
    }
  }

  if (unitGroups.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="size-8" />}
        title="Belum ada kartu di draft"
        description="Kembali ke kanvas kerja dan terima beberapa kartu saran dulu sebelum meninjau."
        action={
          <Link href="/guru" className="text-sm font-medium text-primary hover:underline">
            Kembali ke pencarian unit
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {unitGroups.map((group) => (
        <section key={group.unit.id}>
          <div className="mb-4 border-b border-border pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{group.unit.kodeUnit}</Badge>
              <h2 className="text-lg font-semibold text-foreground">{group.unit.judulUnit}</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{group.unit.sumber}</p>
          </div>

          <div className="flex flex-col gap-6">
            {group.topikDiterima.map((topik, i) => (
              <Card key={topik.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground">
                    {i + 1}. {topik.judul}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => hapusDariDraft(group.unit.id, topik.id)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Hapus
                  </Button>
                </div>
                <p className="mt-2 text-sm italic text-muted-foreground">&ldquo;{topik.isiEkstraktif}&rdquo;</p>
                <Textarea
                  className="mt-3"
                  label="Catatan cara mengajar / strategi pedagogi"
                  placeholder="Mis. mulai dengan demo alat, lalu praktik berpasangan…"
                  rows={2}
                  value={topik.catatanPedagogi ?? ""}
                  onChange={(e) => ubahCatatanPedagogi(topik.id, e.target.value)}
                />
              </Card>
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
        <span className="mr-auto text-sm text-muted-foreground">{jumlahKartu} kartu siap diekspor</span>
        <div className="flex gap-1.5" role="group" aria-label="Format ekspor">
          {(["md", "pdf", "docx"] as const).map((format) => (
            <Button
              key={format}
              variant="secondary"
              disabled={isExporting !== null}
              onClick={() => handleExport(format)}
            >
              <Download className="size-4" aria-hidden />
              {isExporting === format ? "Membuat…" : format.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
