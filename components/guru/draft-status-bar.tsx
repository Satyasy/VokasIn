"use client";

import { useState } from "react";
import { NotebookPen, AlertCircle, RefreshCw } from "lucide-react";
import type { ProgramKeahlian } from "@/lib/types";
import { useModulAjarDraft } from "@/lib/modul-ajar-draft-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DraftStatusBar({ programList }: { programList: ProgramKeahlian[] }) {
  const { programKeahlianId, unitGroups, jumlahKartu, mulaiDraftBaru, resetDraft } = useModulAjarDraft();
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (programKeahlianId === null) {
    return (
      <div className="mb-8 rounded-2xl border-2 border-dashed border-slime-lime-300 bg-slime-lime-50/50 p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold text-neutral-900">
          Mulai draft modul ajar baru. Pilih program keahlian:
        </p>
        <div className="flex flex-wrap gap-2.5">
          {programList.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant="secondary"
              onClick={() => mulaiDraftBaru(p.id)}
              className="rounded-lg border border-slime-lime-300 bg-white font-bold text-slime-lime-950 hover:bg-slime-lime-100 active:scale-95"
            >
              {p.nama}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const program = programList.find((p) => p.id === programKeahlianId);

  const handleResetConfirm = () => {
    resetDraft();
    setConfirmingReset(false);
  };

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-slime-lime-100 text-slime-lime-800">
          <NotebookPen className="size-4" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Draft Aktif:</span>
            <Badge variant="brand" className="font-bold">
              {program?.nama ?? programKeahlianId}
            </Badge>
          </div>
          <p className="text-xs text-neutral-500">
            {unitGroups.length} unit kompetensi &middot; {jumlahKartu} kartu saran tersusun
          </p>
        </div>
      </div>

      <div>
        {confirmingReset ? (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle className="size-3.5" aria-hidden />
              Hapus seluruh draft?
            </span>
            <button
              type="button"
              onClick={handleResetConfirm}
              className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700"
            >
              Ya, Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Batal
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (jumlahKartu > 0) {
                setConfirmingReset(true);
              } else {
                resetDraft();
              }
            }}
            className="text-xs font-semibold text-neutral-600 hover:text-red-700"
          >
            <RefreshCw className="size-3.5 mr-1.5" aria-hidden />
            Mulai draft baru
          </Button>
        )}
      </div>
    </div>
  );
}
