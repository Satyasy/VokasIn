"use client";

import { useMemo, useState } from "react";
import { Inbox, Download, FileWarning } from "lucide-react";
import type { SaranTopik, UnitKompetensi } from "@/lib/types";
import type { FeasibilityResult } from "@/lib/data-access";
import { buildModulAjarMarkdown, downloadModulAjar } from "@/lib/export-modul-ajar";
import { SuggestionCard } from "./suggestion-card";
import { KoreksiDialog } from "./koreksi-dialog";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface KoreksiLogEntry {
  topikId: string;
  judul: string;
  tindakan: "tolak" | "modifikasi";
  catatan: string;
  waktu: string;
}

export function SusunModulClient({
  unit,
  saranAwal,
  feasibilityByTopikId,
}: {
  unit: UnitKompetensi;
  saranAwal: SaranTopik[];
  feasibilityByTopikId: Record<string, FeasibilityResult>;
}) {
  const [tersedia, setTersedia] = useState(saranAwal);
  const [diterima, setDiterima] = useState<SaranTopik[]>([]);
  const [koreksiLog, setKoreksiLog] = useState<KoreksiLogEntry[]>([]);
  const [dialogTopik, setDialogTopik] = useState<SaranTopik | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function terimaTopik(id: string) {
    const topik = tersedia.find((t) => t.id === id);
    if (!topik) return;
    setDiterima((prev) => [...prev, topik]);
    setTersedia((prev) => prev.filter((t) => t.id !== id));
  }

  function bukaDialogKoreksi(id: string) {
    const topik = tersedia.find((t) => t.id === id) ?? null;
    setDialogTopik(topik);
  }

  function simpanKoreksi(tindakan: "tolak" | "modifikasi", catatan: string) {
    if (!dialogTopik) return;
    setKoreksiLog((prev) => [
      ...prev,
      {
        topikId: dialogTopik.id,
        judul: dialogTopik.judul,
        tindakan,
        catatan,
        waktu: new Date().toISOString(),
      },
    ]);
    setTersedia((prev) => prev.filter((t) => t.id !== dialogTopik.id));
    setDialogTopik(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) terimaTopik(id);
  }

  function handleExport() {
    const markdown = buildModulAjarMarkdown(unit, diterima);
    downloadModulAjar(`modul-ajar-${unit.kodeUnit}.md`, markdown);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="kartu-saran-heading">
        <h2 id="kartu-saran-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Kartu saran ({tersedia.length})
        </h2>
        {tersedia.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-8" />}
            title="Tidak ada kartu saran tersisa"
            description="Semua kartu sudah diterima atau dikoreksi."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {tersedia.map((topik) => (
              <SuggestionCard
                key={topik.id}
                topik={topik}
                kodeUnit={unit.kodeUnit}
                feasibility={feasibilityByTopikId[topik.id]}
                onTerima={terimaTopik}
                onTolakModifikasi={bukaDialogKoreksi}
              />
            ))}
          </div>
        )}

        {koreksiLog.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Log koreksi guru ({koreksiLog.length})
            </h3>
            <div className="flex flex-col gap-2">
              {koreksiLog.map((entry) => (
                <Card key={entry.topikId} className="p-3">
                  <div className="flex items-center gap-2">
                    <FileWarning className="size-4 text-warning" aria-hidden />
                    <span className="text-sm font-medium">{entry.judul}</span>
                    <Badge variant={entry.tindakan === "tolak" ? "error" : "warning"}>
                      {entry.tindakan}
                    </Badge>
                  </div>
                  {entry.catatan && (
                    <p className="mt-1 text-sm text-muted-foreground">{entry.catatan}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="kanvas-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="kanvas-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Modul ajar — {unit.judulUnit}
          </h2>
          <Button size="sm" variant="secondary" disabled={diterima.length === 0} onClick={handleExport}>
            <Download className="size-4" aria-hidden />
            Ekspor
          </Button>
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
          {diterima.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-8" />}
              title="Seret kartu saran ke sini"
              description="Atau gunakan tombol “Tambahkan ke modul ajar” pada tiap kartu."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {diterima.map((topik, i) => (
                <Card key={topik.id} className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <CardTitle className="text-sm">{topik.judul}</CardTitle>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <KoreksiDialog
        open={dialogTopik !== null}
        judulTopik={dialogTopik?.judul ?? ""}
        onClose={() => setDialogTopik(null)}
        onSubmit={simpanKoreksi}
      />
    </div>
  );
}
