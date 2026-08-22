"use client";

import { NotebookPen } from "lucide-react";
import type { ProgramKeahlian } from "@/lib/types";
import { useModulAjarDraft } from "@/lib/modul-ajar-draft-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Dipakai di /guru (titik mulai alami) DAN di kanvas /guru/susun/[unitId] —
// guru bisa saja mendarat langsung di halaman unit lewat tautan lama tanpa
// pernah memilih peminatan dulu.
export function DraftStatusBar({ programList }: { programList: ProgramKeahlian[] }) {
  const { programKeahlianId, unitGroups, jumlahKartu, mulaiDraftBaru, resetDraft } = useModulAjarDraft();

  if (programKeahlianId === null) {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-border p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Mulai draft modul ajar baru — pilih peminatan:</p>
        <div className="flex flex-wrap gap-2">
          {programList.map((p) => (
            <Button key={p.id} size="sm" variant="secondary" onClick={() => mulaiDraftBaru(p.id)}>
              {p.nama}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const program = programList.find((p) => p.id === programKeahlianId);

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <NotebookPen className="size-4 text-muted-foreground" aria-hidden />
        <span className="text-sm text-foreground">
          Draft aktif: <Badge variant="brand">{program?.nama ?? programKeahlianId}</Badge>
        </span>
        <span className="text-sm text-muted-foreground">
          {unitGroups.length} unit &middot; {jumlahKartu} kartu
        </span>
      </div>
      <Button size="sm" variant="ghost" onClick={resetDraft}>
        Mulai draft baru
      </Button>
    </div>
  );
}
