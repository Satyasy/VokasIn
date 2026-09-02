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
        <section key={group.unit.id} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-5 border-b border-neutral-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" className="font-bold">{group.unit.kodeUnit}</Badge>
              <h2 className="text-lg font-bold text-neutral-900">{group.unit.judulUnit}</h2>
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">{group.unit.sumber}</p>
          </div>

          <div className="flex flex-col gap-4">
            {group.topikDiterima.map((topik, i) => (
              <Card key={topik.id} className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-neutral-900 leading-snug">
                    {i + 1}. {topik.judul}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => hapusDariDraft(group.unit.id, topik.id)}
                    className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-3.5 mr-1" aria-hidden />
                    Hapus
                  </Button>
                </div>

                <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3.5 text-xs font-medium leading-relaxed text-neutral-800">
                  &ldquo;{topik.isiEkstraktif}&rdquo;
                </div>

                <Textarea
                  className="mt-3.5 text-xs"
                  label="Catatan cara mengajar / strategi pedagogi guru"
                  placeholder="Mis. mulai dengan demonstrasi langsung pada server, lalu praktik berpasangan…"
                  rows={2}
                  value={topik.catatanPedagogi ?? ""}
                  onChange={(e) => ubahCatatanPedagogi(topik.id, e.target.value)}
                />
              </Card>
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 bg-neutral-50 p-4 rounded-2xl">
        <span className="mr-auto text-sm font-bold text-neutral-900">
          {jumlahKartu} kartu materi praktikum siap diekspor
        </span>
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
