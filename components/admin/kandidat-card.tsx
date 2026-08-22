"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X, AlertTriangle } from "lucide-react";
import type { ProgramKeahlian } from "@/lib/types";
import type { UnitKompetensiKandidat } from "@/lib/types";
import {
  confirmKandidatAction,
  editThenConfirmKandidatAction,
  rejectKandidatAction,
} from "@/app/admin/skkni/kandidat/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Perbandingan teks mentah (pdftotext apa adanya) vs hasil parsing terstruktur
// berdampingan — supaya admin memutuskan berdasarkan bukti, bukan percaya
// parser begitu saja (CLAUDE.md Bagian D poin 2).
export function KandidatCard({
  kandidat,
  programList,
}: {
  kandidat: UnitKompetensiKandidat;
  programList: ProgramKeahlian[];
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">{kandidat.kodeUnit}</span>
            {kandidat.parsingUncertain && (
              <Badge variant="warning">
                <AlertTriangle className="size-3" aria-hidden />
                Perlu verifikasi manual
              </Badge>
            )}
          </div>
          <p className="mt-1 text-foreground">{kandidat.judulUnit}</p>
          <p className="mt-1 text-xs text-muted-foreground">{kandidat.sumber}</p>
        </div>
      </div>

      {kandidat.catatan && (
        <p className="mt-3 rounded-md bg-warning/20 px-3 py-2 text-sm text-neutral-900">{kandidat.catatan}</p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Teks mentah (pdftotext)
          </p>
          <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap text-foreground">
            {kandidat.teksMentah}
          </pre>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Hasil parsing terstruktur
          </p>
          <div className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
            {kandidat.elemenKompetensi.length === 0 ? (
              <p className="text-muted-foreground">(tidak ada elemen terstruktur — lihat teks mentah)</p>
            ) : (
              kandidat.elemenKompetensi.map((e, i) => (
                <div key={i} className="mb-2">
                  <p className="font-medium">{e.judul}</p>
                  <ul className="ml-3 list-disc">
                    {e.kriteriaUnjukKerja.map((k, j) => (
                      <li key={j}>
                        {k.kode} {k.teks}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <form
          action={(formData) => startTransition(() => editThenConfirmKandidatAction(kandidat.id, formData))}
          className="mt-4 flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Kode unit" name="kodeUnit" defaultValue={kandidat.kodeUnit} required />
            <Input label="Judul unit" name="judulUnit" defaultValue={kandidat.judulUnit} required />
            <Input label="Sumber (Kepmenaker + halaman)" name="sumber" defaultValue={kandidat.sumber} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor={`prog-${kandidat.id}`}>
                Program keahlian
              </label>
              <select
                id={`prog-${kandidat.id}`}
                name="programKeahlianId"
                defaultValue={kandidat.programKeahlianId}
                className="h-10 rounded-lg border border-border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {programList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={pending}>
              <Check className="size-4" aria-hidden />
              Simpan &amp; Konfirmasi
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={pending}>
              Batal
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            loading={pending}
            onClick={() => startTransition(() => confirmKandidatAction(kandidat.id))}
          >
            <Check className="size-4" aria-hidden />
            Konfirmasi
          </Button>
          <Button variant="secondary" size="sm" disabled={pending} onClick={() => setEditing(true)}>
            <Pencil className="size-4" aria-hidden />
            Edit lalu Konfirmasi
          </Button>
          <Button
            variant="destructive"
            size="sm"
            loading={pending}
            onClick={() => startTransition(() => rejectKandidatAction(kandidat.id))}
          >
            <X className="size-4" aria-hidden />
            Tolak
          </Button>
        </div>
      )}
    </Card>
  );
}
