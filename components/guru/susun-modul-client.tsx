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
  programList,
}: {
  unit: UnitKompetensi;
  saranAwal: SaranTopik[];
  feasibilityByTopikId: Record<string, FeasibilityResult>;
  programList: ProgramKeahlian[];
}) {
  const { programKeahlianId, tambahKeDraft } = useModulAjarDraft();
  const [tersedia, setTersedia] = useState(saranAwal);
  const [koreksiLog, setKoreksiLog] = useState<KoreksiLogEntry[]>([]);
  const [dialogTopik, setDialogTopik] = useState<SaranTopik | null>(null);

  const draftAktif = programKeahlianId !== null;

  function terimaTopik(id: string) {
    if (!draftAktif) return;
    const topik = tersedia.find((t) => t.id === id);
    if (!topik) return;
    tambahKeDraft(unit, topik);
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="kartu-saran-heading">
        <h2 id="kartu-saran-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Kartu saran ({tersedia.length})
        </h2>
        {!draftAktif && (
          <p className="mb-3 text-sm text-muted-foreground">
            Pilih peminatan di panel “Modul ajar” di sebelah kanan dulu sebelum menambahkan kartu.
          </p>
        )}
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
        {!draftAktif ? (
          <>
            <h2 id="kanvas-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Modul ajar
            </h2>
            <DraftStatusBar programList={programList} />
          </>
        ) : (
          <DraftCanvas onDropTopikId={terimaTopik} />
        )}
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
