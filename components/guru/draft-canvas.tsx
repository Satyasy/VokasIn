"use client";

import { useState } from "react";
import { Inbox, Download, NotebookPen } from "lucide-react";
import type { ProgramKeahlian } from "@/lib/types";
import { useModulAjarDraft } from "@/lib/modul-ajar-draft-context";
import { buildModulAjarDocument, buildExportFilename, downloadBlob } from "@/lib/export-modul-ajar";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Kanvas draft — dipakai baik dari alur cari-unit-satu-per-satu
// (susun-modul-client.tsx) maupun alur "Asisten Kebutuhan Modul"
// (multi-unit-susun-client.tsx). Diekstrak supaya kedua alur berbagi satu
// implementasi kartu draft/ekspor, bukan dua salinan yang bisa menyimpang.
export function DraftCanvas({
  programList,
  onDropTopikId,
}: {
  programList: ProgramKeahlian[];
  onDropTopikId: (topikId: string) => void;
}) {
  const { programKeahlianId, unitGroups, jumlahKartu, ubahCatatanPedagogi } = useModulAjarDraft();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropTopikId(id);
  }

  async function handleExport(format: "pdf" | "docx") {
    const program = programList.find((p) => p.id === programKeahlianId);
    const slug = program?.singkatan ?? programKeahlianId ?? "draft";
    setIsExporting(format);
    try {
      const dokumen = buildModulAjarDocument(program?.nama ?? "(peminatan belum ditentukan)", unitGroups);
      if (format === "pdf") {
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

  const jumlahCatatanTerisi = unitGroups.reduce(
    (n, g) => n + g.topikDiterima.filter((t) => t.catatanPedagogi?.trim()).length,
    0
  );

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Modul ajar — {unitGroups.length} unit
        </h2>
        <div className="flex items-center gap-2">
          {jumlahKartu > 0 && (
            <Badge variant={jumlahCatatanTerisi === jumlahKartu ? "success" : "default"}>
              <NotebookPen className="size-3" aria-hidden />
              Catatan pedagogi {jumlahCatatanTerisi}/{jumlahKartu}
            </Badge>
          )}
          <div className="flex gap-1.5" role="group" aria-label="Format ekspor">
            {(["pdf", "docx"] as const).map((format) => (
              <Button
                key={format}
                size="sm"
                variant="secondary"
                disabled={jumlahKartu === 0 || isExporting !== null}
                onClick={() => handleExport(format)}
              >
                <Download className="size-4" aria-hidden />
                {isExporting === format ? "Membuat…" : format.toUpperCase()}
              </Button>
            ))}
          </div>
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
              <div key={group.unit.id}>
                <div className="mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand">{group.unit.kodeUnit}</Badge>
                    <span className="text-sm font-semibold text-foreground">{group.unit.judulUnit}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{group.unit.sumber}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {group.topikDiterima.map((topik, i) => (
                    <Card key={topik.id} className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {i + 1}
                        </span>
                        <CardTitle className="text-sm">{topik.judul}</CardTitle>
                      </div>
                      <Textarea
                        className="mt-2"
                        label="Catatan cara mengajar / strategi pedagogi untuk kompetensi ini"
                        placeholder="Mis. mulai dengan demo alat, lalu praktik berpasangan…"
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
