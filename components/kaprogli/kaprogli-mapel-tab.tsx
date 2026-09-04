"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Layers,
  Globe,
  Sliders,
  Sparkles,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { TingkatKelas, UnitKompetensi, MataPelajaranWithDetails } from "@/lib/types";
import { syncMapelAction, createMapelAction, getSuggestedUnitsRrfAction } from "@/app/kaprogli/mapel-actions";
import type { SearchHit } from "@/lib/data-access-db";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface KaprogliMapelTabProps {
  mapelList: MataPelajaranWithDetails[];
  availableUnits: { id: string; kodeUnit: string; judulUnit: string; programKeahlianId: string }[];
  currentProgramId: string;
}

export function KaprogliMapelTab({
  mapelList,
  availableUnits,
  currentProgramId,
}: KaprogliMapelTabProps) {
  const [selectedTingkat, setSelectedTingkat] = useState<"ALL" | TingkatKelas>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal Tambah Mapel
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPending, startAddTransition] = useTransition();
  const [addError, setAddError] = useState<string | null>(null);

  // State Modal Sinkronisasi SKKNI
  const [syncingMapel, setSyncingMapel] = useState<MataPelajaranWithDetails | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [syncSearch, setSyncSearch] = useState("");
  const [syncPending, startSyncTransition] = useTransition();
  const [syncSuccess, setSyncSuccess] = useState(false);

  // State Rekomendasi RRF & Ekspansi Kata Kunci
  const [rrfSuggestions, setRrfSuggestions] = useState<SearchHit[]>([]);
  const [matchedSynonyms, setMatchedSynonyms] = useState<string[]>([]);
  const [showExpansionDetails, setShowExpansionDetails] = useState(false);
  const [isRrfLoading, setIsRrfLoading] = useState(false);

  // Efek RRF Dinamis & Adaptif (Konteks Mapel + Pencarian)
  useEffect(() => {
    if (!syncingMapel) {
      setRrfSuggestions([]);
      setMatchedSynonyms([]);
      setIsRrfLoading(false);
      return;
    }

    const trimmedSearch = syncSearch.trim();
    // Jika ada pencarian, gunakan query pencarian. Jika kosong, gunakan konteks penuh Mapel
    const query = trimmedSearch
      ? trimmedSearch
      : [syncingMapel.namaMapel, syncingMapel.deskripsi, syncingMapel.rujukanWsos].filter(Boolean).join(" ");

    const delay = trimmedSearch ? 300 : 0;
    setIsRrfLoading(true);

    const timer = setTimeout(() => {
      getSuggestedUnitsRrfAction(query, 5)
        .then((res) => {
          setRrfSuggestions(res.hits || []);
          setMatchedSynonyms(res.matchedSynonyms || []);
        })
        .catch((e) => {
          console.error("Gagal memuat saran RRF:", e);
        })
        .finally(() => {
          setIsRrfLoading(false);
        });
    }, delay);

    return () => clearTimeout(timer);
  }, [syncSearch, syncingMapel]);

  // Section 2: Katalog unit SKKNI lainnya (Deduplikasi dari Top RRF)
  const otherUnits = useMemo(() => {
    const rrfIdSet = new Set(rrfSuggestions.map((s) => s.id));
    return availableUnits.filter((u) => {
      if (rrfIdSet.has(u.id)) return false;
      if (syncSearch.trim()) {
        const q = syncSearch.toLowerCase().trim();
        return u.kodeUnit.toLowerCase().includes(q) || u.judulUnit.toLowerCase().includes(q);
      }
      return true;
    });
  }, [availableUnits, rrfSuggestions, syncSearch]);

  // Filter Mata Pelajaran
  const filteredMapel = useMemo(() => {
    return mapelList.filter((m) => {
      const matchTingkat = selectedTingkat === "ALL" || m.tingkatKelas === selectedTingkat;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.namaMapel.toLowerCase().includes(q) ||
        m.kodeMapel?.toLowerCase().includes(q) ||
        m.rujukanWsos?.toLowerCase().includes(q);
      return matchTingkat && matchSearch;
    });
  }, [mapelList, selectedTingkat, searchQuery]);

  function openSyncModal(mapel: MataPelajaranWithDetails) {
    setSyncingMapel(mapel);
    setSelectedUnitIds(new Set(mapel.units.map((u) => u.id)));
    setSyncSearch("");
    setSyncSuccess(false);
    setMatchedSynonyms([]);
    setShowExpansionDetails(false);
  }

  function toggleUnitSelection(unitId: string) {
    const next = new Set(selectedUnitIds);
    if (next.has(unitId)) {
      next.delete(unitId);
    } else {
      next.add(unitId);
    }
    setSelectedUnitIds(next);
  }

  function handleSaveSync() {
    if (!syncingMapel) return;
    startSyncTransition(async () => {
      const res = await syncMapelAction(syncingMapel.id, Array.from(selectedUnitIds));
      if (res.success) {
        setSyncSuccess(true);
        setTimeout(() => {
          setSyncingMapel(null);
        }, 1200);
      }
    });
  }

  function handleCreateMapel(formData: FormData) {
    formData.append("programKeahlianId", currentProgramId);
    startAddTransition(async () => {
      const res = await createMapelAction(formData);
      if (res.success) {
        setShowAddModal(false);
        setAddError(null);
      } else {
        setAddError(res.error || "Gagal menambahkan mata pelajaran.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header & Aksi Tambah */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">
            Kurikulum &amp; Mata Pelajaran Kejuruan (X, XI, XII)
          </h3>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed mt-0.5">
            Sinkronisasikan mata pelajaran sekolah Anda dengan Standar Kompetensi Kerja Nasional Indonesia (SKKNI) dan standar WorldSkills (WSOS), lengkap dengan passing grade industri 80 berbasis KKTP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-full bg-slime-lime-500 px-4 py-2 text-xs font-bold text-slime-lime-950 hover:bg-slime-lime-400 shadow-xs"
          >
            <Plus className="size-3.5 mr-1.5" />
            <span>Tambah Mata Pelajaran</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tab Tingkat Kelas */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-neutral-100 p-1">
          {(["ALL", "X", "XI", "XII"] as const).map((tingkat) => (
            <button
              key={tingkat}
              type="button"
              onClick={() => setSelectedTingkat(tingkat)}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${
                selectedTingkat === tingkat
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {tingkat === "ALL" ? `Semua Kelas (${mapelList.length})` : `Kelas ${tingkat}`}
            </button>
          ))}
        </div>

        {/* Search Bar Input */}
        <div className="relative min-w-[260px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Cari mata pelajaran, kode, atau WSOS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 pr-3 text-xs bg-white rounded-xl"
          />
        </div>
      </div>

      {/* Grid Kartu Mata Pelajaran */}
      {filteredMapel.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto size-10 text-neutral-300 mb-2" />
          <h4 className="text-sm font-bold text-neutral-800">
            Tidak Ada Mata Pelajaran yang Sesuai
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Ubah kata kunci pencarian atau klik &ldquo;Tambah Mata Pelajaran&rdquo; untuk mendaftarkan kurikulum baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMapel.map((mapel) => (
            <article
              key={mapel.id}
              className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slime-lime-950 bg-slime-lime-100 px-2 py-0.5 rounded-md">
                        {mapel.kodeMapel || `Kelas ${mapel.tingkatKelas}`}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-400">
                        Kelas {mapel.tingkatKelas} • Semester {mapel.semester}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-neutral-900 leading-snug">
                      {mapel.namaMapel}
                    </h4>
                  </div>

                  {/* Live Feasibility Badge */}
                  {mapel.totalSkkniSync > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="size-3" />
                      <span>Lab 100% Siap</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 border border-amber-200 shrink-0">
                      <AlertCircle className="size-3" />
                      <span>Belum Ada SKKNI</span>
                    </span>
                  )}
                </div>

                {/* Deskripsi Singkat */}
                {mapel.deskripsi && (
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-4">
                    {mapel.deskripsi}
                  </p>
                )}

                {/* Lencana Ganda Standar: SKKNI & WSOS */}
                <div className="space-y-2 rounded-2xl bg-neutral-50/80 p-3.5 border border-neutral-100 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <Award className="size-3.5 text-slime-lime-700" />
                      <span>Standar Nasional SKKNI:</span>
                    </span>
                    <span className="font-bold text-neutral-900">
                      {mapel.totalSkkniSync} Unit Disinkronkan
                    </span>
                  </div>

                  {mapel.rujukanWsos && (
                    <div className="flex items-center justify-between text-xs border-t border-neutral-200/50 pt-1.5">
                      <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                        <Globe className="size-3.5 text-blue-600" />
                        <span>Rujukan WorldSkills (WSOS):</span>
                      </span>
                      <span className="font-bold text-blue-900 truncate max-w-[190px]">
                        {mapel.rujukanWsos}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs border-t border-neutral-200/50 pt-1.5">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <Sliders className="size-3.5 text-purple-600" />
                      <span>Passing Grade (KKTP):</span>
                    </span>
                    <span className="font-extrabold text-slime-lime-950 bg-slime-lime-200/70 px-2 py-0.5 rounded">
                      Min. {mapel.passingGradeMinimum} (Cakap)
                    </span>
                  </div>
                </div>

                {/* Daftar Cuplikan Unit SKKNI yang Terhubung */}
                {mapel.units.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Unit SKKNI Terhubung:
                    </span>
                    <div className="space-y-1">
                      {mapel.units.slice(0, 2).map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between gap-2 text-xs bg-white rounded-lg p-1.5 border border-neutral-200"
                        >
                          <span className="font-mono text-[10px] font-bold text-neutral-600">
                            {u.kodeUnit}
                          </span>
                          <span className="text-neutral-800 font-semibold truncate flex-1 text-right">
                            {u.judulUnit}
                          </span>
                        </div>
                      ))}
                      {mapel.units.length > 2 && (
                        <span className="text-[10px] font-bold text-slime-lime-800 pl-1">
                          +{mapel.units.length - 2} unit kompetensi lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Aksi Tombol */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100 mt-2">
                <div className="text-[11px] text-neutral-500 font-medium">
                  Alokasi: <span className="font-bold text-neutral-900">{mapel.alokasiJpMingguan} JP/Minggu</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => openSyncModal(mapel)}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100"
                  >
                    <Layers className="size-3.5 mr-1" />
                    <span>Sinkronkan SKKNI</span>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL SINKRONISASI SKKNI / WSOS */}
      {syncingMapel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl border border-neutral-200 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="font-mono text-[10px] font-extrabold text-slime-lime-900 uppercase">
                  {syncingMapel.kodeMapel || `Kelas ${syncingMapel.tingkatKelas}`}
                </span>
                <h4 className="text-lg font-extrabold text-neutral-900">
                  Sinkronisasi SKKNI &amp; WSOS: {syncingMapel.namaMapel}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Centang unit-unit kompetensi SKKNI resmi yang menjadi rujukan capaian pembelajaran mata pelajaran ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSyncingMapel(null)}
                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Bilah Cari Unit */}
            <div className="my-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Cari kode unit atau kata kunci kompetensi..."
                value={syncSearch}
                onChange={(e) => setSyncSearch(e.target.value)}
                className="pl-9 text-xs rounded-xl"
              />
            </div>

            {/* Alert Info: Konteks Pencarian Diperluas (Collapsible) */}
            {matchedSynonyms.length > 0 && (
              <div className="mb-3 rounded-2xl border border-blue-200/80 bg-blue-50/60 p-2.5 text-xs text-blue-900 transition-all">
                <button
                  type="button"
                  onClick={() => setShowExpansionDetails(!showExpansionDetails)}
                  className="flex w-full items-center justify-between text-left font-bold text-blue-950 hover:text-blue-800"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Sparkles className="size-3.5 text-blue-600 shrink-0" />
                    <span>Konteks Pencarian Diperluas (AI &amp; Tesaurus Vokasi)</span>
                    <span className="rounded-full bg-blue-200/70 px-2 py-0.5 text-[10px] font-black text-blue-800">
                      +{matchedSynonyms.length} Istilah Padanan
                    </span>
                  </div>
                  {showExpansionDetails ? (
                    <ChevronUp className="size-4 text-blue-700 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-blue-700 shrink-0" />
                  )}
                </button>

                {showExpansionDetails && (
                  <div className="mt-2.5 pt-2 border-t border-blue-200/60 text-[11px] space-y-1.5 text-blue-900 animate-in fade-in duration-200">
                    <p className="text-neutral-600">
                      Kata kunci teknis SKKNI yang otomatis dipadankan untuk memaksimalkan akurasi pencarian:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {matchedSynonyms.map((syn, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-white/90 px-2 py-0.5 font-mono text-[10.5px] font-bold text-blue-950 border border-blue-200 shadow-2xs"
                        >
                          #{syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List Unit Kompetensi Checkbox (2 Section: TOP RRF & Katalog Umum) */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1.5 max-h-[420px]">
              {/* SECTION 1: TOP HASIL DARI RRF (Reciprocal Rank Fusion) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-lg bg-gradient-to-tr from-[#4285F4] via-[#9B72CB] to-[#D96570] text-white shadow-xs">
                      <Sparkles className="size-3 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                      Rekomendasi Unggulan (TOP RRF)
                    </span>
                    <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                      {rrfSuggestions.length} Unit Paling Relevan
                    </span>
                  </div>

                  {isRrfLoading && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-600">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Mencari kecocokan...</span>
                    </div>
                  )}
                </div>

                {/* Skeletons saat loading */}
                {isRrfLoading && rrfSuggestions.length === 0 ? (
                  <div className="space-y-2.5">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#4285F4]/40 via-[#9B72CB]/40 to-[#D96570]/40 animate-pulse"
                      >
                        <div className="h-16 rounded-[14.5px] bg-neutral-50 p-3.5 flex items-center gap-3">
                          <div className="size-5 rounded-md bg-neutral-200 shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-1/4 rounded bg-neutral-200" />
                            <div className="h-3.5 w-3/4 rounded bg-neutral-200" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : rrfSuggestions.length > 0 ? (
                  <div className="space-y-2.5">
                    {rrfSuggestions.map((unit, idx) => {
                      const isChecked = selectedUnitIds.has(unit.id);
                      return (
                        <div
                          key={unit.id}
                          onClick={() => toggleUnitSelection(unit.id)}
                          className={cn(
                            "group relative rounded-2xl p-[1.5px] transition-all duration-200 cursor-pointer",
                            // Outline gradient khas Gemini (Google AI: Biru - Ungu - Coral)
                            "bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]",
                            "hover:shadow-[0_0_16px_rgba(155,114,203,0.35)] shadow-xs"
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-start gap-3 p-3.5 rounded-[14.5px] transition-colors",
                              isChecked
                                ? "bg-purple-50/80"
                                : "bg-white hover:bg-neutral-50/90"
                            )}
                          >
                            <button
                              type="button"
                              className="mt-0.5 shrink-0"
                              title={isChecked ? "Batal Pilih" : "Pilih Unit"}
                            >
                              {isChecked ? (
                                <div className="flex size-5 items-center justify-center rounded-md bg-slime-lime-500 text-slime-lime-950 font-bold">
                                  <Check className="size-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="size-5 rounded-md border-2 border-neutral-300 bg-white group-hover:border-purple-400 transition-colors" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-mono text-xs font-extrabold text-neutral-800">
                                  {unit.kodeUnit}
                                </span>
                                {unit.programKeahlian && (
                                  <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-600 uppercase">
                                    {unit.programKeahlian}
                                  </span>
                                )}
                                <div className="flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-full ml-auto">
                                  <Sparkles className="size-2.5 text-purple-600" />
                                  <span>Top RRF #{idx + 1}</span>
                                </div>
                              </div>
                              <p className="text-xs font-bold text-neutral-900 leading-snug">
                                {unit.judulUnit}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4 text-center text-xs text-neutral-600">
                    <p className="font-semibold">Belum ada unit SKKNI yang cukup cocok untuk mata pelajaran ini.</p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Pilih dari katalog di bawah atau tambahkan unit SKKNI baru melalui menu verifikasi.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 2: KATALOG SKKNI TI LAINNYA (DILUAR HASIL TOP RRF) */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-700">
                    Katalog SKKNI TI Lainnya
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-600">
                    {otherUnits.length} Unit
                  </span>
                </div>

                {otherUnits.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-3 text-center">
                    Tidak ada unit SKKNI tambahan yang sesuai kriteria pencarian.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {otherUnits.map((unit) => {
                      const isChecked = selectedUnitIds.has(unit.id);
                      return (
                        <div
                          key={unit.id}
                          onClick={() => toggleUnitSelection(unit.id)}
                          className={cn(
                            "flex items-start gap-3 p-3.5 rounded-2xl border transition-colors cursor-pointer",
                            isChecked
                              ? "border-slime-lime-400 bg-slime-lime-50/30"
                              : "border-neutral-200 hover:border-neutral-300 bg-white"
                          )}
                        >
                          <button
                            type="button"
                            className="mt-0.5 shrink-0"
                            title={isChecked ? "Batal Pilih" : "Pilih Unit"}
                          >
                            {isChecked ? (
                              <div className="flex size-5 items-center justify-center rounded-md bg-slime-lime-500 text-slime-lime-950 font-bold">
                                <Check className="size-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="size-5 rounded-md border-2 border-neutral-300 bg-white" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-xs font-bold text-neutral-700">
                                {unit.kodeUnit}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-neutral-900 leading-snug">
                              {unit.judulUnit}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="border-t border-neutral-100 pt-4 mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600">
                {selectedUnitIds.size} unit kompetensi terpilih
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSyncingMapel(null)}
                  className="rounded-full px-4 text-xs font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  loading={syncPending}
                  disabled={syncPending}
                  onClick={handleSaveSync}
                  className="rounded-full bg-slime-lime-500 px-5 text-xs font-bold text-slime-lime-950 hover:bg-slime-lime-400 shadow-xs"
                >
                  {syncSuccess ? "✓ Tersimpan!" : "Simpan Sinkronisasi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MATA PELAJARAN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl border border-neutral-200">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3 mb-4">
              <div>
                <h4 className="text-base font-extrabold text-neutral-900">
                  Tambah Mata Pelajaran Kejuruan Baru
                </h4>
                <p className="text-xs text-neutral-500">
                  Daftarkan mata pelajaran untuk kurikulum sekolah tingkat X, XI, atau XII.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {addError}
              </div>
            )}

            <form action={handleCreateMapel} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                  Nama Mata Pelajaran:
                </label>
                <Input
                  name="namaMapel"
                  placeholder="Contoh: Pemrograman Berorientasi Objek"
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                    Kode Mapel (Opsional):
                  </label>
                  <Input name="kodeMapel" placeholder="Contoh: RPL-XI-03" className="text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                    Tingkat Kelas:
                  </label>
                  <select
                    name="tingkatKelas"
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800"
                    defaultValue="X"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                    Semester:
                  </label>
                  <select
                    name="semester"
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800"
                    defaultValue="1"
                  >
                    <option value="1">Semester 1 (Ganjil)</option>
                    <option value="2">Semester 2 (Genap)</option>
                    <option value="3">Semester 3 (Ganjil)</option>
                    <option value="4">Semester 4 (Genap)</option>
                    <option value="5">Semester 5 (Ganjil)</option>
                    <option value="6">Semester 6 (Genap)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                    Alokasi JP Mingguan:
                  </label>
                  <Input
                    name="alokasiJpMingguan"
                    type="number"
                    defaultValue={4}
                    min={1}
                    max={12}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                  Rujukan WorldSkills (WSOS):
                </label>
                <Input
                  name="rujukanWsos"
                  placeholder="Contoh: Skill 09: Software Application Development"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                  Deskripsi Ruang Lingkup Mapel:
                </label>
                <Input
                  name="deskripsi"
                  placeholder="Cakupan materi dan target capaian praktikum..."
                  className="text-xs"
                />
              </div>

              <div className="border-t border-neutral-100 pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full px-4 text-xs font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={addPending}
                  className="rounded-full bg-slime-lime-500 px-5 text-xs font-bold text-slime-lime-950 hover:bg-slime-lime-400"
                >
                  Simpan Mata Pelajaran
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
