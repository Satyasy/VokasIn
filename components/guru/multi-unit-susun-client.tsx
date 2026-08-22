"use client";

import { useState } from "react";
import { Inbox, FileWarning } from "lucide-react";
import type { SaranTopik, UnitKompetensi, ProgramKeahlian } from "@/lib/types";
import type { FeasibilityResult } from "@/lib/data-access";
import { useModulAjarDraft } from "@/lib/modul-ajar-draft-context";
import { SuggestionCard } from "./suggestion-card";
import { KoreksiDialog } from "./koreksi-dialog";
import { DraftStatusBar } from "./draft-status-bar";
import { DraftCanvas } from "./draft-canvas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { KoreksiLogEntry } from "./susun-modul-client";

export interface UnitSaranBundle {
  unit: UnitKompetensi;
  saranAwal: SaranTopik[];
  feasibilityByTopikId: Record<string, FeasibilityResult>;
}

// Hasil dari "Asisten Kebutuhan Modul" (Bagian C, PRD) — tinjauan kartu saran
// EKSTRAKTIF dari BEBERAPA unit sekaligus, tapi mekanisme kartunya sendiri
// (SuggestionCard, KoreksiDialog, DraftCanvas) sama persis dengan alur
// cari-unit-satu-per-satu di susun-modul-client.tsx, tidak dibuat ulang.
export function MultiUnitSusunClient({
  bundles,
  programList,
}: {
  bundles: UnitSaranBundle[];
  programList: ProgramKeahlian[];
}) {
  const { programKeahlianId, tambahKeDraft } = useModulAjarDraft();
  const [tersediaByUnit, setTersediaByUnit] = useState<Record<string, SaranTopik[]>>(() =>
    Object.fromEntries(bundles.map((b) => [b.unit.id, b.saranAwal]))
  );
  const [koreksiLog, setKoreksiLog] = useState<KoreksiLogEntry[]>([]);
  const [dialog, setDialog] = useState<{ unitId: string; topik: SaranTopik } | null>(null);

  const draftAktif = programKeahlianId !== null;

  function terima(unitId: string, topikId: string) {
    if (!draftAktif) return;
    const bundle = bundles.find((b) => b.unit.id === unitId);
    const topik = tersediaByUnit[unitId]?.find((t) => t.id === topikId);
    if (!bundle || !topik) return;
    tambahKeDraft(bundle.unit, topik);
    setTersediaByUnit((prev) => ({ ...prev, [unitId]: prev[unitId].filter((t) => t.id !== topikId) }));
  }

  function bukaDialogKoreksi(unitId: string, topikId: string) {
    const topik = tersediaByUnit[unitId]?.find((t) => t.id === topikId) ?? null;
    setDialog(topik ? { unitId, topik } : null);
  }

  function simpanKoreksi(tindakan: "tolak" | "modifikasi", catatan: string) {
    if (!dialog) return;
    setKoreksiLog((prev) => [
      ...prev,
      {
        topikId: dialog.topik.id,
        judul: dialog.topik.judul,
        tindakan,
        catatan,
        waktu: new Date().toISOString(),
      },
    ]);
    setTersediaByUnit((prev) => ({
      ...prev,
      [dialog.unitId]: prev[dialog.unitId].filter((t) => t.id !== dialog.topik.id),
    }));
    setDialog(null);
  }

  // Drop di kanvas hanya membawa topikId — cari unit pemiliknya sendiri di
  // sini karena DraftCanvas generik, tidak tahu pemetaan unit-per-kartu.
  function handleDropTopikId(topikId: string) {
    const unitId = Object.keys(tersediaByUnit).find((id) => tersediaByUnit[id].some((t) => t.id === topikId));
    if (unitId) terima(unitId, topikId);
  }

  const totalTersedia = Object.values(tersediaByUnit).reduce((n, arr) => n + arr.length, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="kartu-saran-heading">
        <h2 id="kartu-saran-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Kartu saran dari {bundles.length} unit terpilih ({totalTersedia})
        </h2>
        {!draftAktif && (
          <p className="mb-3 text-sm text-muted-foreground">
            Pilih peminatan di panel “Modul ajar” di sebelah kanan dulu sebelum menambahkan kartu.
          </p>
        )}

        <div className="flex flex-col gap-6">
          {bundles.map((b) => {
            const tersedia = tersediaByUnit[b.unit.id] ?? [];
            return (
              <div key={b.unit.id}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{b.unit.kodeUnit}</Badge>
                  <span className="text-sm font-semibold text-foreground">{b.unit.judulUnit}</span>
                </div>
                {tersedia.length === 0 ? (
                  <EmptyState
                    icon={<Inbox className="size-8" />}
                    title="Tidak ada kartu saran tersisa"
                    description="Semua kartu unit ini sudah diterima atau dikoreksi."
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {tersedia.map((topik) => (
                      <SuggestionCard
                        key={topik.id}
                        topik={topik}
                        kodeUnit={b.unit.kodeUnit}
                        feasibility={b.feasibilityByTopikId[topik.id]}
                        onTerima={(id) => terima(b.unit.id, id)}
                        onTolakModifikasi={(id) => bukaDialogKoreksi(b.unit.id, id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
                    <Badge variant={entry.tindakan === "tolak" ? "error" : "warning"}>{entry.tindakan}</Badge>
                  </div>
                  {entry.catatan && <p className="mt-1 text-sm text-muted-foreground">{entry.catatan}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="kanvas-heading">
        {!draftAktif ? (
          <>
            <h2 id="kanvas-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Modul ajar
            </h2>
            <DraftStatusBar programList={programList} />
          </>
        ) : (
          <DraftCanvas programList={programList} onDropTopikId={handleDropTopikId} />
        )}
      </section>

      <KoreksiDialog
        open={dialog !== null}
        judulTopik={dialog?.topik.judul ?? ""}
        onClose={() => setDialog(null)}
        onSubmit={simpanKoreksi}
      />
    </div>
  );
}
