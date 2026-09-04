"use client";

import { useSyncExternalStore, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  Building2,
  Compass,
  CheckCircle2,
  BookOpen,
  Filter,
  ExternalLink,
} from "lucide-react";
import type { UnitKompetensi } from "@/lib/types";
import { type MitraIndustri, getMitraByUnit } from "@/lib/mitra-industri";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  mitraList = [],
  initialHighlight,
}: {
  programKeahlianId: string;
  units: UnitKompetensi[];
  mitraList?: MitraIndustri[];
  initialHighlight?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMitraId, setSelectedMitraId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "mastered" | "unmastered">("all");

  // Scroll otomatis ke unit yang di-highlight jika ada
  useEffect(() => {
    if (initialHighlight) {
      const el = document.getElementById(`unit-${initialHighlight}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [initialHighlight]);

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
  const persenDikuasai = units.length > 0 ? Math.round((jumlahDitandai / units.length) * 100) : 0;

  // Filter unit
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = u.judulUnit.toLowerCase().includes(q);
        const matchCode = u.kodeUnit.toLowerCase().includes(q);
        const matchElem = u.elemenKompetensi.some(
          (e) =>
            e.judul.toLowerCase().includes(q) ||
            e.kriteriaUnjukKerja.some((k) => k.teks.toLowerCase().includes(q))
        );
        if (!matchTitle && !matchCode && !matchElem) return false;
      }

      // 2. Mitra filter
      if (selectedMitraId !== "all") {
        const mitra = mitraList.find((m) => m.id === selectedMitraId);
        if (mitra) {
          const isRelated = mitra.unitSkkniTerkait.some(
            (item) =>
              item.unitId.toLowerCase() === u.id.toLowerCase() ||
              item.kodeUnit.toLowerCase() === u.kodeUnit.toLowerCase() ||
              u.kodeUnit.toLowerCase().includes(item.kodeUnit.toLowerCase())
          );
          if (!isRelated) return false;
        }
      }

      // 3. Status filter
      if (filterStatus === "mastered" && !checked.has(u.id)) return false;
      if (filterStatus === "unmastered" && checked.has(u.id)) return false;

      return true;
    });
  }, [units, searchQuery, selectedMitraId, filterStatus, checked, mitraList]);

  return (
    <div className="space-y-6">
      {/* Progress Penguasaan Siswa */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900">
              Progres Capaian Pembelajaran Siswa
            </h3>
            <p className="text-xs text-neutral-500">
              Tandai unit yang sudah dikuasai secara mandiri untuk memantau kesiapan magang dan uji kompetensi.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-xl font-black text-neutral-900">{persenDikuasai}%</span>
              <p className="text-[11px] font-semibold text-neutral-500">
                {jumlahDitandai} dari {units.length} Unit
              </p>
            </div>
            {jumlahDitandai > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmReset(true)}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100" role="presentation">
          <div
            className="h-full rounded-full bg-slime-lime-500 transition-all duration-500"
            style={{ width: `${persenDikuasai}%` }}
          />
        </div>
      </div>

      {/* Toolbar Pencarian & Filter Cerdas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" aria-hidden />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode unit, judul kompetensi, atau materi KUK..."
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-slime-lime-500 focus:outline-none focus:ring-1 focus:ring-slime-lime-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Filter Mitra Industri */}
          {mitraList.length > 0 && (
            <select
              value={selectedMitraId}
              onChange={(e) => setSelectedMitraId(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 focus:border-slime-lime-500 focus:outline-none focus:ring-1 focus:ring-slime-lime-500 shadow-2xs"
              aria-label="Filter Mitra Industri"
            >
              <option value="all">Semua Mitra Industri</option>
              {mitraList.map((m) => (
                <option key={m.id} value={m.id}>
                  Kebutuhan: {m.namaPerusahaan}
                </option>
              ))}
            </select>
          )}

          {/* Filter Status Penguasaan */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 focus:border-slime-lime-500 focus:outline-none focus:ring-1 focus:ring-slime-lime-500 shadow-2xs"
            aria-label="Filter Status"
          >
            <option value="all">Semua Status</option>
            <option value="mastered">Sudah Dikuasai</option>
            <option value="unmastered">Belum Dikuasai</option>
          </select>
        </div>
      </div>

      {/* Daftar Unit Kompetensi SKKNI */}
      <div className="flex flex-col gap-3.5">
        {filteredUnits.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-neutral-700">Tidak ada unit yang sesuai dengan filter.</p>
            <p className="mt-1 text-xs text-neutral-500">Coba gunakan kata kunci pencarian atau reset filter mitra.</p>
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const isChecked = checked.has(unit.id);
            const isHighlighted = initialHighlight === unit.id || initialHighlight === unit.kodeUnit;
            const relevantMitra = getMitraByUnit(unit.kodeUnit);

            return (
              <Card
                key={unit.id}
                id={`unit-${unit.id}`}
                className={cn(
                  "p-5 transition-all duration-300",
                  isChecked && "border-slime-lime-300 bg-slime-lime-50/20",
                  isHighlighted && "ring-2 ring-slime-lime-500 border-slime-lime-400 bg-slime-lime-50/40 shadow-md"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded accent-primary cursor-pointer"
                      checked={isChecked}
                      onChange={() => toggle(unit.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base font-bold text-neutral-900">
                          {unit.judulUnit}
                        </CardTitle>
                        {isChecked && (
                          <Badge variant="success" className="text-[10px] font-bold py-0">
                            <CheckCircle2 className="size-3" />
                            Dikuasai
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1 text-xs text-neutral-500">
                        <span className="font-semibold text-neutral-700">{unit.kodeUnit}</span> &middot; Dokumen:{" "}
                        {unit.dokumenSkkni || unit.sumber || "SKKNI Resmi Kemnaker"}
                      </CardDescription>
                    </div>
                  </label>

                  {/* Tombol Uji Portofolio di Jelajah */}
                  <Link
                    href={`/jelajah-kompetensi?prompt=${encodeURIComponent(unit.judulUnit)}`}
                    className="shrink-0"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
                      title="Uji kesesuaian proyek portofolio Anda dengan unit ini"
                    >
                      <Compass className="size-3.5 text-slime-lime-700" />
                      <span className="hidden sm:inline">Uji di Jelajah</span>
                    </Button>
                  </Link>
                </div>

                {/* Badge Mitra Industri yang Membutuhkan Unit Ini */}
                {relevantMitra.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap pt-2.5 border-t border-neutral-100">
                    <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                      <Building2 className="size-3 text-slime-lime-800" />
                      Dibutuhkan Mitra Industri:
                    </span>
                    {relevantMitra.map((m) => (
                      <Link key={m.id} href={`/kunjungan-industri`} title={m.studiKasusNyata}>
                        <Badge
                          variant="brand"
                          className="text-[11px] font-semibold hover:bg-slime-lime-300 transition-colors cursor-pointer"
                        >
                          {m.namaPerusahaan}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Elemen Kompetensi & KUK */}
                <div className="mt-4 flex flex-col divide-y divide-neutral-100 border-t border-neutral-100">
                  {unit.elemenKompetensi.map((elemen) => (
                    <details key={elemen.id} className="group py-2.5">
                      <summary className="cursor-pointer list-none text-xs sm:text-sm font-semibold text-neutral-800 outline-none flex items-center justify-between hover:text-neutral-950">
                        <span className="flex items-center gap-2">
                          <BookOpen className="size-3.5 text-neutral-400 group-hover:text-slime-lime-700" />
                          {elemen.judul}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium group-open:rotate-90 transition-transform">
                          ▶
                        </span>
                      </summary>
                      <ul className="mt-2 flex flex-col gap-1.5 pl-6 text-xs text-neutral-600">
                        {elemen.kriteriaUnjukKerja.map((kuk) => (
                          <li key={kuk.id} className="leading-relaxed">
                            <span className="font-bold text-neutral-800">{kuk.kode}</span> {kuk.teks}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Hapus semua catatan jalur ini?"
        description="Seluruh tanda centang penguasaan unit untuk program keahlian ini akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan."
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
