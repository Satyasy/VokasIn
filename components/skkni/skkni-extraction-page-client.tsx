"use client";

import { useState, useTransition, useActionState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  AlertCircle,
  Loader2,
  Search,
  X,
  Layers,
  ArrowLeft,
  Filter,
  CheckSquare,
  Square,
  BookOpen,
} from "lucide-react";
import {
  parseSkkniPdfAction,
  importSelectedSkkniUnitsAction,
  uploadSkkniMandiriAction,
  type UploadSkkniMandiriResponse,
} from "@/app/guru/upload-skkni-action";
import type { ExtractedUnit, ParsedSkkniDocument } from "@/lib/skkni-text-extractor";
import { extractPdfTextInBrowser, type ParseProgress } from "@/lib/client-pdf-parser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface SkkniExtractionPageClientProps {
  role: "guru" | "kaprogli";
  defaultProgramId?: string;
}

const SAMPLE_CUSTOM_SKKNI = {
  nomor: "Kepmenaker No. 120 Tahun 2026",
  kode: "J.620100.012.01",
  judul: "Mengonfigurasi Kontainer Docker dan Klaster Kubernetes",
  programId: "pk-tkj",
  elemen: `1. Mempersiapkan Lingkungan Kontainerisasi
1.1 Docker engine dipasang dan dikonfigurasi pada server Linux
1.2 Dockerfile disusun sesuai arsitektur layanan mikro
2. Mengelola Orkestrasi dan Layanan Kubernetes
2.1 Manifes deployment dan service YAML disusun secara presisi
2.2 Pengujian aksesibilitas cluster dilakukan melalui perintah kubectl`,
};

export function SkkniExtractionPageClient({
  role,
  defaultProgramId = "pk-tkj",
}: SkkniExtractionPageClientProps) {
  const dashboardUrl = role === "kaprogli" ? "/kaprogli" : "/guru";
  const dashboardLabel = role === "kaprogli" ? "Dasbor Kaprogli" : "Dasbor Guru";

  const [activeTab, setActiveTab] = useState<"pdf" | "manual">("pdf");

  // State untuk alur PDF Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [parseProgress, setParseProgress] = useState<ParseProgress>({
    currentPage: 0,
    totalPages: 0,
    percent: 0,
    statusText: "Menyiapkan parser...",
  });
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedDoc, setParsedDoc] = useState<ParsedSkkniDocument | null>(null);
  const [editableNomor, setEditableNomor] = useState("");
  const [pdfProgramId, setPdfProgramId] = useState(defaultProgramId);
  const [selectedUnitCodes, setSelectedUnitCodes] = useState<Set<string>>(new Set());
  const [editableUnits, setEditableUnits] = useState<Record<string, { kodeUnit: string; judulUnit: string }>>({});
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [expandedUnitCodes, setExpandedUnitCodes] = useState<Set<string>>(new Set());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSelection, setFilterSelection] = useState<"all" | "selected" | "unselected">("all");

  // Import batch transition
  const [isImporting, startImportTransition] = useTransition();
  const [importSuccess, setImportSuccess] = useState<{ count: number; firstUnitId?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk alur manual cadangan
  const [manualState, manualFormAction, manualPending] = useActionState<UploadSkkniMandiriResponse | null, FormData>(
    uploadSkkniMandiriAction,
    null
  );
  const [nomor, setNomor] = useState("");
  const [kode, setKode] = useState("");
  const [judul, setJudul] = useState("");
  const [programId, setProgramId] = useState(defaultProgramId);
  const [elemen, setElemen] = useState("");

  function fillSample() {
    setNomor(SAMPLE_CUSTOM_SKKNI.nomor);
    setKode(SAMPLE_CUSTOM_SKKNI.kode);
    setJudul(SAMPLE_CUSTOM_SKKNI.judul);
    setProgramId(SAMPLE_CUSTOM_SKKNI.programId);
    setElemen(SAMPLE_CUSTOM_SKKNI.elemen);
  }

  // Handle PDF Drag & Drop & Client-Side Parsing
  async function handlePdfFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setParseError("File harus berekstensi .pdf resmi dari Kemnaker.");
      return;
    }

    setIsParsing(true);
    setCurrentFileName(file.name);
    setParseError(null);
    setImportSuccess(null);
    setSearchQuery("");
    setParseProgress({
      currentPage: 0,
      totalPages: 0,
      percent: 5,
      statusText: "Membaca dokumen ke memori...",
    });

    try {
      // 1. Ekstraksi langsung di browser (Client-Side) via PDF.js
      const doc = await extractPdfTextInBrowser(file, (p) => {
        setParseProgress(p);
      });

      setParsedDoc(doc);
      setEditableNomor(doc.nomorDokumen);

      const allCodes = new Set(doc.units.map((u) => u.kodeUnit));
      setSelectedUnitCodes(allCodes);

      const edits: Record<string, { kodeUnit: string; judulUnit: string }> = {};
      doc.units.forEach((u) => {
        edits[u.kodeUnit] = { kodeUnit: u.kodeUnit, judulUnit: u.judulUnit };
      });
      setEditableUnits(edits);
      setIsParsing(false);
    } catch (err: unknown) {
      console.warn("Ekstraksi browser mengalami kendala, beralih ke server parser:", err);
      try {
        setParseProgress({
          currentPage: 0,
          totalPages: 0,
          percent: 50,
          statusText: "Memproses lewat server fallback...",
        });
        const formData = new FormData();
        formData.append("pdfFile", file);
        const res = await parseSkkniPdfAction(formData);

        if (!res.success || !res.document) {
          throw new Error(res.error || "Gagal membaca berkas PDF.");
        }

        setParsedDoc(res.document);
        setEditableNomor(res.document.nomorDokumen);

        const allCodes = new Set(res.document.units.map((u) => u.kodeUnit));
        setSelectedUnitCodes(allCodes);

        const edits: Record<string, { kodeUnit: string; judulUnit: string }> = {};
        res.document.units.forEach((u) => {
          edits[u.kodeUnit] = { kodeUnit: u.kodeUnit, judulUnit: u.judulUnit };
        });
        setEditableUnits(edits);
      } catch (fallbackErr: unknown) {
        setParseError(
          fallbackErr instanceof Error
            ? fallbackErr.message
            : "Gagal mengekstrak PDF. Pastikan file bukan hasil foto/scan murni."
        );
      } finally {
        setIsParsing(false);
      }
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handlePdfFile(e.target.files[0]);
    }
  }

  function toggleSelectAllFiltered() {
    if (!filteredUnits.length) return;
    const allFilteredCodes = filteredUnits.map((u) => u.kodeUnit);
    const areAllSelected = allFilteredCodes.every((code) => selectedUnitCodes.has(code));

    const next = new Set(selectedUnitCodes);
    if (areAllSelected) {
      allFilteredCodes.forEach((code) => next.delete(code));
    } else {
      allFilteredCodes.forEach((code) => next.add(code));
    }
    setSelectedUnitCodes(next);
  }

  function toggleUnit(kodeUnit: string) {
    const next = new Set(selectedUnitCodes);
    if (next.has(kodeUnit)) {
      next.delete(kodeUnit);
    } else {
      next.add(kodeUnit);
    }
    setSelectedUnitCodes(next);
  }

  function toggleAccordion(kodeUnit: string) {
    const next = new Set(expandedUnitCodes);
    if (next.has(kodeUnit)) {
      next.delete(kodeUnit);
    } else {
      next.add(kodeUnit);
    }
    setExpandedUnitCodes(next);
  }

  function handleSaveImport() {
    if (!parsedDoc || selectedUnitCodes.size === 0) return;

    const unitsToImport = parsedDoc.units
      .filter((u) => selectedUnitCodes.has(u.kodeUnit))
      .map((u) => {
        const edited = editableUnits[u.kodeUnit] || u;
        return {
          kodeUnit: edited.kodeUnit,
          judulUnit: edited.judulUnit,
          rawElemenText: u.rawElemenText,
        };
      });

    startImportTransition(async () => {
      const res = await importSelectedSkkniUnitsAction({
        nomorDokumen: editableNomor,
        programKeahlianId: pdfProgramId,
        selectedUnits: unitsToImport,
      });

      if (res.success && res.importedCount) {
        setImportSuccess({
          count: res.importedCount,
          firstUnitId: res.units?.[0]?.id,
        });
      } else {
        setParseError(res.error || "Gagal mengimpor unit kompetensi.");
      }
    });
  }

  // Filter unit berdasarkan Search Query & Status Pilihan
  const filteredUnits = useMemo(() => {
    if (!parsedDoc) return [];

    return parsedDoc.units.filter((unit) => {
      const edit = editableUnits[unit.kodeUnit] || unit;
      const q = searchQuery.toLowerCase().trim();

      const matchSearch =
        !q ||
        edit.kodeUnit.toLowerCase().includes(q) ||
        edit.judulUnit.toLowerCase().includes(q) ||
        unit.elemen.some(
          (el) =>
            el.judul.toLowerCase().includes(q) ||
            el.kuk.some((k) => k.teks.toLowerCase().includes(q) || k.kode.includes(q))
        );

      const isSelected = selectedUnitCodes.has(unit.kodeUnit);
      const matchFilter =
        filterSelection === "all" ||
        (filterSelection === "selected" && isSelected) ||
        (filterSelection === "unselected" && !isSelected);

      return matchSearch && matchFilter;
    });
  }, [parsedDoc, searchQuery, filterSelection, selectedUnitCodes, editableUnits]);

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Top Header & Breadcrumb */}
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href={dashboardUrl}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke {dashboardLabel}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="brand" className="text-xs font-bold font-mono">
              ETL Pipeline Mandiri
            </Badge>
            <span className="hidden sm:inline text-xs text-neutral-400 font-medium">•</span>
            <span className="hidden sm:inline text-xs text-neutral-500 font-semibold">
              Dual-Tier SKKNI Verification
            </span>
          </div>
        </div>
      </header>

      {/* Hero Title Section */}
      <section className="bg-white border-b border-neutral-200/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
            Unggah &amp; Ekstraksi Unit SKKNI Kemnaker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
            Letakkan berkas PDF SKKNI resmi dari Kementerian Ketenagakerjaan. Sistem akan membedah teks langsung di komputer Anda, mengekstrak seluruh unit kompetensi secara instan, dan menyediakan mesin pencari kata kunci untuk penelaahan kurikulum yang cepat dan nyaman dibaca.
          </p>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {/* Banner Sukses Impor Batch */}
        {importSuccess && (
          <div className="mb-8 rounded-3xl border-2 border-slime-lime-500 bg-slime-lime-50/90 p-8 text-center animate-in zoom-in-95 shadow-sm">
            <CheckCircle2 className="mx-auto size-14 text-slime-lime-600" />
            <h2 className="mt-4 text-xl sm:text-2xl font-black text-slime-lime-950">
              {importSuccess.count} Unit Kompetensi Berhasil Didaftarkan!
            </h2>
            <p className="mt-2 text-sm text-slime-lime-800 max-w-xl mx-auto leading-relaxed">
              Seluruh unit telah siap Anda gunakan di kanvas Modul Ajar dan otomatis tercatat pada antrean verifikasi Kaprogli untuk pengesahan standar jurusan.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {importSuccess.firstUnitId && (
                <Link
                  href={`/guru/susun/${importSuccess.firstUnitId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-slime-lime-500 px-6 py-3 text-sm font-extrabold text-slime-lime-950 hover:bg-slime-lime-400 transition-colors shadow-md"
                >
                  <span>Mulai Susun Modul Ajar</span>
                  <ArrowRight className="size-4" />
                </Link>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setParsedDoc(null);
                  setImportSuccess(null);
                }}
                className="rounded-full px-6 text-sm"
              >
                Unggah Berkas PDF Lain
              </Button>
              <Link
                href={dashboardUrl}
                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Kembali ke Dasbor
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI: KONTROL DOKUMEN & DROPZONE (4 Kolom) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Tab Selector Mode */}
            <div className="rounded-2xl bg-neutral-200/60 p-1 flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "pdf"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <FileCheck className="size-4 text-slime-lime-600" />
                <span>PDF Kemnaker</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "manual"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <FileText className="size-4 text-neutral-500" />
                <span>Input Teks Manual</span>
              </button>
            </div>

            {/* TAB PDF: DROPZONE & METADATA */}
            {activeTab === "pdf" && (
              <div className="space-y-6">
                {!parsedDoc ? (
                  <div className="rounded-3xl bg-white p-6 border border-neutral-200 shadow-sm space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => {
                        if (!isParsing) fileInputRef.current?.click();
                      }}
                      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                        isParsing
                          ? "border-slime-lime-500 bg-slime-lime-50/40 cursor-default"
                          : isDragging
                          ? "border-slime-lime-500 bg-slime-lime-50/60 scale-[1.01] cursor-pointer"
                          : "border-neutral-300 hover:border-slime-lime-500 hover:bg-neutral-50/60 cursor-pointer"
                      }`}
                    >
                      {isParsing ? (
                        <div className="w-full py-4 text-center space-y-4">
                          <Loader2 className="mx-auto size-8 animate-spin text-slime-lime-600" />
                          <p className="text-sm font-extrabold text-neutral-900">
                            {parseProgress.statusText}
                          </p>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-neutral-600">
                              <span className="font-semibold truncate max-w-[170px]">
                                {currentFileName || "Membaca berkas..."}
                              </span>
                              <span className="font-bold text-slime-lime-700">{parseProgress.percent}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-slime-lime-500 transition-all duration-150"
                                style={{ width: `${parseProgress.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex size-14 items-center justify-center rounded-2xl bg-slime-lime-100 text-slime-lime-800 mb-3 shadow-inner">
                            <UploadCloud className="size-7" />
                          </div>
                          <h3 className="text-sm font-bold text-neutral-900">
                            Tarik &amp; Letakkan PDF SKKNI di Sini
                          </h3>
                          <p className="mt-1 text-xs text-neutral-500">
                            Atau <span className="font-bold text-slime-lime-700 underline">pilih dari komputer</span>
                          </p>
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
                            <ShieldCheck className="size-3.5 text-slime-lime-600" />
                            <span>Mendukung seluruh format SKKNI Kemnaker</span>
                          </div>
                        </>
                      )}
                    </div>

                    {parseError && (
                      <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <p>{parseError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* KONTROL DOKUMEN HASIL EKSTRAKSI */
                  <div className="rounded-3xl bg-white p-6 border border-neutral-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Dokumen Aktif
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 truncate max-w-[220px]">
                          {currentFileName}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setParsedDoc(null);
                          setParseError(null);
                        }}
                        className="text-xs font-bold text-neutral-500 hover:text-neutral-900 underline"
                      >
                        Ganti File
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                        Nomor Rujukan SKKNI (Dapat Disesuaikan):
                      </label>
                      <Input
                        value={editableNomor}
                        onChange={(e) => setEditableNomor(e.target.value)}
                        className="text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                        Jurusan Sasaran di Sekolah:
                      </label>
                      <select
                        value={pdfProgramId}
                        onChange={(e) => setPdfProgramId(e.target.value)}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800 focus:border-slime-lime-500 focus:outline-hidden"
                      >
                        <option value="pk-tkj">Teknik Jaringan Komputer &amp; Telekomunikasi (TJKT)</option>
                        <option value="pk-rpl">Rekayasa Perangkat Lunak (RPL)</option>
                      </select>
                    </div>

                    {/* Ringkasan Angka */}
                    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-neutral-50 p-3 text-center border border-neutral-100">
                      <div>
                        <span className="block text-lg font-black text-neutral-900">
                          {parsedDoc.units.length}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Unit Total</span>
                      </div>
                      <div>
                        <span className="block text-lg font-black text-slime-lime-700">
                          {selectedUnitCodes.size}
                        </span>
                        <span className="text-[10px] font-bold text-slime-lime-800 uppercase">Dipilih</span>
                      </div>
                      <div>
                        <span className="block text-lg font-black text-neutral-700">
                          {parsedDoc.units.reduce((acc, u) => acc + u.totalKuk, 0)}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Total KUK</span>
                      </div>
                    </div>

                    {/* Tombol Simpan / Impor */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        loading={isImporting}
                        disabled={isImporting || selectedUnitCodes.size === 0}
                        onClick={handleSaveImport}
                        className="w-full h-12 bg-slime-lime-500 text-slime-lime-950 font-black hover:bg-slime-lime-400 text-xs sm:text-sm rounded-2xl shadow-sm"
                      >
                        <Check className="size-4 mr-2" />
                        <span>Impor {selectedUnitCodes.size} Unit ke Modul Ajar</span>
                      </Button>
                      <p className="mt-2 text-center text-[11px] text-neutral-400">
                        Otomatis masuk antrean verifikasi Kaprogli
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB INPUT MANUAL (CADANGAN) */}
            {activeTab === "manual" && (
              <form action={manualFormAction} className="rounded-3xl bg-white p-6 border border-neutral-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                  <span className="text-xs font-bold text-neutral-800">Form Salin Potongan Teks</span>
                  <button
                    type="button"
                    onClick={fillSample}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slime-lime-800 hover:text-slime-lime-900 bg-slime-lime-50 px-2.5 py-1 rounded-full border border-slime-lime-200"
                  >
                    <Sparkles className="size-3" />
                    <span>Contoh Unit</span>
                  </button>
                </div>

                {manualState?.error && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                    {manualState.error}
                  </div>
                )}

                {manualState?.success && (
                  <div className="rounded-xl bg-slime-lime-50 p-3 border border-slime-lime-300 text-xs text-slime-lime-950 space-y-1">
                    <p className="font-bold">Unit {manualState.kodeUnit} Berhasil Diproses!</p>
                    <Link
                      href={`/guru/susun/${manualState.unitId}`}
                      className="inline-flex items-center gap-1 font-bold text-slime-lime-800 underline"
                    >
                      Buka Kanvas Penyusun Modul Ajar &rarr;
                    </Link>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                    Nomor SKKNI / Rujukan
                  </label>
                  <Input
                    name="nomorDokumen"
                    placeholder="Contoh: Kepmenaker No. 56 Tahun 2018"
                    value={nomor}
                    onChange={(e) => setNomor(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                    Kode Unit SKKNI
                  </label>
                  <Input
                    name="kodeUnit"
                    placeholder="Contoh: J.620100.005.02"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                    Judul Unit Kompetensi
                  </label>
                  <Input
                    name="judulUnit"
                    placeholder="Contoh: Mengimplementasikan Pemrograman Terstruktur"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                    Program Keahlian (Jurusan)
                  </label>
                  <select
                    name="programKeahlianId"
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800"
                  >
                    <option value="pk-tkj">Teknik Komputer &amp; Jaringan (TKJ)</option>
                    <option value="pk-rpl">Rekayasa Perangkat Lunak (RPL)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                    Elemen Kompetensi &amp; KUK
                  </label>
                  <Textarea
                    name="elemenRawText"
                    rows={5}
                    placeholder={"1. Menyiapkan perangkat lunak\n1.1 Spesifikasi sistem dianalisis\n2. Menjalankan pengujian..."}
                    value={elemen}
                    onChange={(e) => setElemen(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  loading={manualPending}
                  className="w-full bg-slime-lime-500 text-slime-lime-950 font-bold hover:bg-slime-lime-400 text-xs"
                >
                  Ekstrak &amp; Simpan Unit Manual
                </Button>
              </form>
            )}
          </div>

          {/* KOLOM KANAN: BILAH PENCARIAN & KANVAS PENELAAHAN UNIT (8 Kolom) */}
          <div className="lg:col-span-8 space-y-6">
            {!parsedDoc ? (
              /* EMPTY STATE SEBELUM UPLOAD */
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-xs">
                <BookOpen className="mx-auto size-12 text-neutral-300 mb-3" />
                <h3 className="text-lg font-bold text-neutral-900">
                  Belum Ada Dokumen yang Diunggah
                </h3>
                <p className="mt-1 text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                  Silakan letakkan atau pilih file PDF SKKNI Kemnaker di panel kiri. Hasil ekstraksi unit, elemen, dan seluruh KUK akan muncul di area luas ini lengkap dengan bilah pencari.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-neutral-50 px-4 py-2.5 text-xs text-neutral-600 border border-neutral-100">
                  <ShieldCheck className="size-4 text-slime-lime-600" />
                  <span>Mendukung pencarian kata kunci seperti Docker, Routing, Database, API, dll.</span>
                </div>
              </div>
            ) : (
              /* SEARCH & UNIT CARDS CONTAINER */
              <div className="space-y-6">
                {/* BILAH PENCARIAN UTAMA */}
                <div className="rounded-3xl bg-white p-5 border border-neutral-200 shadow-xs space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kompetensi, kata kunci (mis. 'routing', 'docker', 'database', 'api'), atau kode unit..."
                      className="w-full h-13 pl-12 pr-11 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-sm sm:text-base font-semibold text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-slime-lime-500 focus:outline-hidden focus:ring-4 focus:ring-slime-lime-100 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Filter Chips & Batch Selection Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFilterSelection("all")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          filterSelection === "all"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        Semua ({parsedDoc.units.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterSelection("selected")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          filterSelection === "selected"
                            ? "bg-slime-lime-500 text-slime-lime-950 font-extrabold"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        Hanya Dipilih ({selectedUnitCodes.size})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterSelection("unselected")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          filterSelection === "unselected"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        Belum Dipilih ({parsedDoc.units.length - selectedUnitCodes.size})
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleSelectAllFiltered}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slime-lime-800 hover:text-slime-lime-950 underline"
                      >
                        <CheckSquare className="size-3.5" />
                        <span>Pilih / Batal Semua Hasil</span>
                      </button>
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="text-xs text-neutral-500 font-medium">
                      Menemukan <span className="font-bold text-neutral-900">{filteredUnits.length}</span> dari {parsedDoc.units.length} unit yang memuat kata &ldquo;{searchQuery}&rdquo;.
                    </div>
                  )}
                </div>

                {/* DAFTAR KARTU UNIT KOMPETENSI (Ukuran Font Besar, Renggang, Nyaman Dibaca) */}
                {filteredUnits.length === 0 ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center">
                    <Search className="mx-auto size-10 text-neutral-300 mb-2" />
                    <p className="text-base font-bold text-neutral-900">
                      Tidak Ada Unit yang Cocok
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Coba ubah kata kunci pencarian atau bersihkan filter pilihan Anda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUnits.map((unit) => {
                      const isSelected = selectedUnitCodes.has(unit.kodeUnit);
                      const isExpanded = expandedUnitCodes.has(unit.kodeUnit);
                      const isEditing = editingCode === unit.kodeUnit;
                      const currentEdit = editableUnits[unit.kodeUnit] || unit;

                      return (
                        <article
                          key={unit.idTemp}
                          className={`rounded-3xl border-2 p-6 sm:p-7 transition-all bg-white ${
                            isSelected
                              ? "border-slime-lime-400 shadow-sm bg-slime-lime-50/20"
                              : "border-neutral-200 hover:border-neutral-300 opacity-80"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox Besar */}
                            <button
                              type="button"
                              onClick={() => toggleUnit(unit.kodeUnit)}
                              className="mt-1 shrink-0 text-neutral-400 hover:text-slime-lime-600 transition-colors"
                              title={isSelected ? "Batal Pilih" : "Pilih Unit Ini"}
                            >
                              {isSelected ? (
                                <div className="flex size-6 items-center justify-center rounded-lg bg-slime-lime-500 text-slime-lime-950 font-black">
                                  <Check className="size-4 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="size-6 rounded-lg border-2 border-neutral-300 bg-white hover:border-neutral-500" />
                              )}
                            </button>

                            {/* Konten Utama Unit */}
                            <div className="flex-1 min-w-0">
                              {/* Metadata Badges & Edit Button */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs sm:text-sm font-extrabold text-slime-lime-950 bg-slime-lime-100/90 px-3 py-1 rounded-lg border border-slime-lime-200">
                                    {currentEdit.kodeUnit}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-neutral-500">
                                    {unit.totalElemen} Elemen Kompetensi • {unit.totalKuk} KUK
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setEditingCode(isEditing ? null : unit.kodeUnit)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg transition-colors"
                                  title="Koreksi Kode / Judul Unit"
                                >
                                  <Edit2 className="size-3" />
                                  <span>{isEditing ? "Batal" : "Koreksi"}</span>
                                </button>
                              </div>

                              {/* Judul Unit (Font Besar & Nyaman Dibaca) */}
                              {isEditing ? (
                                <div className="mt-2 space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                                  <div>
                                    <label className="text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                                      Judul Unit:
                                    </label>
                                    <Input
                                      value={currentEdit.judulUnit}
                                      onChange={(e) =>
                                        setEditableUnits((prev) => ({
                                          ...prev,
                                          [unit.kodeUnit]: { ...currentEdit, judulUnit: e.target.value },
                                        }))
                                      }
                                      className="text-sm font-semibold bg-white"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCode(null)}
                                    className="rounded-lg bg-slime-lime-500 px-3 py-1.5 text-xs font-bold text-slime-lime-950 hover:bg-slime-lime-400"
                                  >
                                    Simpan Koreksi Judul
                                  </button>
                                </div>
                              ) : (
                                <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-neutral-900 leading-relaxed tracking-tight">
                                  {currentEdit.judulUnit}
                                </h2>
                              )}

                              {/* Deskripsi Unit jika ada */}
                              {unit.deskripsiUnit && (
                                <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                                  {unit.deskripsiUnit}
                                </p>
                              )}

                              {/* Toggle Accordion untuk Intip KUK */}
                              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(unit.kodeUnit)}
                                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="size-4 text-slime-lime-700" />
                                      <span>Tutup Rincian KUK</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="size-4 text-neutral-400" />
                                      <span>Intip Rincian Elemen &amp; KUK ({unit.totalElemen} Elemen, {unit.totalKuk} KUK)</span>
                                    </>
                                  )}
                                </button>

                                <span className={`text-xs font-bold ${isSelected ? "text-slime-lime-700" : "text-neutral-400"}`}>
                                  {isSelected ? "✓ Termasuk diimpor" : "Dilewati"}
                                </span>
                              </div>

                              {/* Detail Elemen & KUK dengan Tipografi Longgar & Jelas */}
                              {isExpanded && (
                                <div className="mt-4 rounded-2xl bg-neutral-50/80 p-5 sm:p-6 border border-neutral-200/80 space-y-5 animate-in fade-in">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                    Struktur Elemen Kompetensi &amp; Kriteria Unjuk Kerja (KUK):
                                  </h4>

                                  <div className="space-y-4">
                                    {unit.elemen.map((el, elIdx) => (
                                      <div key={elIdx} className="rounded-xl bg-white p-4 border border-neutral-200 shadow-2xs">
                                        <h5 className="text-sm sm:text-base font-extrabold text-neutral-900 leading-snug mb-3">
                                          {elIdx + 1}. {el.judul}
                                        </h5>

                                        <ul className="space-y-2.5 pl-3 border-l-2 border-slime-lime-300">
                                          {el.kuk.map((k, kIdx) => (
                                            <li key={kIdx} className="text-xs sm:text-sm text-neutral-700 flex items-start gap-2.5 leading-relaxed">
                                              <span className="font-mono text-xs font-bold text-slime-lime-900 bg-slime-lime-100 px-1.5 py-0.5 rounded shrink-0">
                                                {k.kode}
                                              </span>
                                              <span>{k.teks}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
