"use client";

import { useSyncExternalStore, useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import type { UnitKompetensi } from "@/lib/types";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

function storageKey(programKeahlianId: string) {
  return `vokasin-roadmap-${programKeahlianId}`;
}

const listeners = new Set<() => void>();
function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(key: string): string {
  if (typeof window === "undefined") return "[]";
  try {
    return window.localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

export function RoadmapJalurClient({
  programKeahlianId,
  units,
}: {
  programKeahlianId: string;
  units: UnitKompetensi[];
}) {
  const key = storageKey(programKeahlianId);
  const rawChecked = useSyncExternalStore(
    subscribe,
    () => getSnapshot(key),
    getServerSnapshot
  );

  const checked = useMemo(() => {
    try {
      return new Set(JSON.parse(rawChecked) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [rawChecked]);

  const [confirmReset, setConfirmReset] = useState(false);

  function toggle(unitId: string) {
    const next = new Set(checked);
    if (next.has(unitId)) next.delete(unitId);
    else next.add(unitId);
    try {
      window.localStorage.setItem(key, JSON.stringify([...next]));
      emitChange();
    } catch {}
  }

  function resetCatatan() {
    try {
      window.localStorage.removeItem(key);
      emitChange();
    } catch {}
    setConfirmReset(false);
  }

  const jumlahDitandai = [...checked].filter((id) => units.some((u) => u.id === id)).length;

  return (
    <div className="mt-6">
      <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
        Tanda centang ini murni catatan pribadi Anda. Tersimpan hanya di perangkat ini, tidak
        dikirim ke mana pun, dan bukan penilaian dari sistem.
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground">
          {jumlahDitandai} dari {units.length} ditandai
        </p>
        <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>
          <RotateCcw className="size-4" aria-hidden />
          Reset catatan
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {units.map((unit) => (
          <Card key={unit.id}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={checked.has(unit.id)}
                onChange={() => toggle(unit.id)}
              />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base">{unit.judulUnit}</CardTitle>
                <CardDescription className="mt-1">
                  {unit.kodeUnit} &middot; Sumber: {unit.sumber}
                </CardDescription>
                <span className="mt-1 block text-sm text-foreground">Sudah saya kuasai</span>
              </div>
            </label>

            <div className="mt-3 flex flex-col divide-y divide-border border-t border-border">
              {unit.elemenKompetensi.map((elemen) => (
                <details key={elemen.id} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {elemen.judul}
                  </summary>
                  <ul className="mt-2 flex flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
                    {elemen.kriteriaUnjukKerja.map((kuk) => (
                      <li key={kuk.id}>
                        <span className="font-medium text-foreground">{kuk.kode}</span> {kuk.teks}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Hapus semua catatan jalur ini?"
        description="Seluruh tanda centang untuk program keahlian ini akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmReset(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={resetCatatan}>
            Hapus catatan
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
