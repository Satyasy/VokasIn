"use client";

import { useState, useTransition, useActionState, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  FileCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  parseSkkniPdfAction,
  importSelectedSkkniUnitsAction,
  uploadSkkniMandiriAction,
  type UploadSkkniMandiriResponse,
} from "@/app/guru/upload-skkni-action";
import type { ExtractedUnit, ParsedSkkniDocument } from "@/lib/skkni-pdf-parser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

export function UploadSkkniModal({ defaultProgramId = "pk-tkj" }: { defaultProgramId?: string }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"pdf" | "manual">("pdf");

  // State untuk alur PDF Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedDoc, setParsedDoc] = useState<ParsedSkkniDocument | null>(null);
  const [editableNomor, setEditableNomor] = useState("");
  const [pdfProgramId, setPdfProgramId] = useState(defaultProgramId);
  const [selectedUnitCodes, setSelectedUnitCodes] = useState<Set<string>>(new Set());
  const [editableUnits, setEditableUnits] = useState<Record<string, { kodeUnit: string; judulUnit: string }>>({});
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [expandedUnitCode, setExpandedUnitCode] = useState<string | null>(null);

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

  function handleClose() {
    setOpen(false);
  }

  // Handle PDF Drag & Drop & Parsing
  async function handlePdfFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setParseError("File harus berekstensi .pdf resmi dari Kemnaker.");
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setImportSuccess(null);

    const formData = new FormData();
    formData.append("pdfFile", file);

    const res = await parseSkkniPdfAction(formData);
    setIsParsing(false);

    if (!res.success || !res.document) {
      setParseError(res.error || "Gagal membaca berkas PDF.");
      return;
    }

    setParsedDoc(res.document);
    setEditableNomor(res.document.nomorDokumen);

    // Default: pilih semua unit
    const allCodes = new Set(res.document.units.map((u) => u.kodeUnit));
    setSelectedUnitCodes(allCodes);

    // Inisialisasi state edit
    const edits: Record<string, { kodeUnit: string; judulUnit: string }> = {};
    res.document.units.forEach((u) => {
      edits[u.kodeUnit] = { kodeUnit: u.kodeUnit, judulUnit: u.judulUnit };
    });
    setEditableUnits(edits);
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

  function toggleSelectAll() {
    if (!parsedDoc) return;
    if (selectedUnitCodes.size === parsedDoc.units.length) {
      setSelectedUnitCodes(new Set());
    } else {
      setSelectedUnitCodes(new Set(parsedDoc.units.map((u) => u.kodeUnit)));
    }
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

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border-slime-lime-300 bg-slime-lime-50 text-slime-lime-950 hover:bg-slime-lime-100 font-bold text-xs"
      >
        <UploadCloud className="size-4 text-slime-lime-800" aria-hidden />
        <span>Unggah / Tambah SKKNI Mandiri</span>
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto"
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="brand" className="font-extrabold text-xs">
                    ETL Pipeline Mandiri
                  </Badge>
                  <span className="text-xs text-neutral-500 font-medium">Dual-Tier Verification</span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-neutral-900 leading-snug">
                  Unggah &amp; Ekstraksi Unit SKKNI Mandiri
                </h3>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                  Unggah langsung dokumen PDF resmi Kemnaker tanpa perlu input manual. Sistem otomatis mengekstrak unit, elemen, dan KUK ke kanvas modul ajar Anda serta mendaftarkannya ke antrean Kaprogli.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Navigasi Tab Ganda */}
            <div className="mt-5 flex gap-2 border-b border-neutral-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "pdf"
                    ? "bg-slime-lime-500 text-slime-lime-950 shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <FileCheck className="size-4" />
                <span>Unggah PDF Otomatis (Kemnaker)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "manual"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <FileText className="size-4" />
                <span>Input Teks Manual (Cadangan)</span>
              </button>
            </div>

            {/* TAB 1: PDF DRAG & DROP OTOMATIS */}
            {activeTab === "pdf" && (
              <div className="mt-6 space-y-6">
                {/* Banner Sukses Impor Batch */}
                {importSuccess ? (
                  <div className="rounded-2xl border border-slime-lime-400 bg-slime-lime-50/80 p-6 text-center animate-in zoom-in-95">
                    <CheckCircle2 className="mx-auto size-12 text-slime-lime-600" />
                    <h4 className="mt-3 text-base font-extrabold text-slime-lime-950">
                      {importSuccess.count} Unit Kompetensi Berhasil Diimpor &amp; Didaftarkan!
                    </h4>
                    <p className="mt-1 text-xs text-slime-lime-800 max-w-lg mx-auto leading-relaxed">
                      Seluruh unit telah siap Anda gunakan di kanvas Modul Ajar dan otomatis tercatat pada antrean verifikasi Kaprogli untuk pengesahan standar jurusan.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      {importSuccess.firstUnitId && (
                        <Link
                          href={`/guru/susun/${importSuccess.firstUnitId}`}
                          onClick={handleClose}
                          className="inline-flex items-center gap-2 rounded-full bg-slime-lime-500 px-5 py-2.5 text-xs font-extrabold text-slime-lime-950 hover:bg-slime-lime-400 transition-colors shadow-sm"
                        >
                          <span>Mulai Susun Modul Ajar</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setParsedDoc(null);
                          setImportSuccess(null);
                        }}
                        className="text-xs"
                      >
                        Unggah PDF Lain
                      </Button>
                    </div>
                  </div>
                ) : !parsedDoc ? (
                  /* DROPZONE AREA */
                  <div>
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
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-slime-lime-500 bg-slime-lime-50/60 scale-[1.01]"
                          : "border-neutral-300 hover:border-slime-lime-500 hover:bg-neutral-50/60"
                      }`}
                    >
                      {isParsing ? (
                        <div className="py-8 text-center space-y-3">
                          <Loader2 className="mx-auto size-10 animate-spin text-slime-lime-600" />
                          <p className="text-sm font-bold text-neutral-900">
                            Membaca &amp; Mengekstrak Unit SKKNI Kemnaker...
                          </p>
                          <p className="text-xs text-neutral-500 max-w-sm">
                            Sistem sedang membedah dokumen PDF, mengurai Kode Unit, Judul, Elemen, dan KUK.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex size-16 items-center justify-center rounded-2xl bg-slime-lime-100 text-slime-lime-800 mb-3 shadow-inner">
                            <UploadCloud className="size-8" />
                          </div>
                          <h4 className="text-base font-bold text-neutral-900">
                            Tarik &amp; Letakkan Berkas PDF SKKNI di Sini
                          </h4>
                          <p className="mt-1 text-xs text-neutral-500 max-w-md">
                            Atau <span className="font-bold text-slime-lime-700 underline">klik untuk memilih file</span> dari komputer Anda (PDF resmi Kemnaker tanpa perlu input manual per poin).
                          </p>
                          <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-400">
                            <ShieldCheck className="size-4 text-slime-lime-600" />
                            <span>Mendukung seluruh format SKKNI Kemnaker (Cloud Computing, IoT, RPL, TKJ, dll.)</span>
                          </div>
                        </>
                      )}
                    </div>

                    {parseError && (
                      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <p>{parseError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* UNIT SELECTOR & PREVIEW AREA */
                  <div className="space-y-5 animate-in fade-in">
                    {/* Header Dokumen yang Ditemukan */}
                    <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-200">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                            Rujukan SKKNI (Dapat Disesuaikan):
                          </label>
                          <Input
                            value={editableNomor}
                            onChange={(e) => setEditableNomor(e.target.value)}
                            className="text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                            Jurusan Sasaran:
                          </label>
                          <select
                            value={pdfProgramId}
                            onChange={(e) => setPdfProgramId(e.target.value)}
                            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800"
                          >
                            <option value="pk-tkj">Teknik Jaringan Komputer dan Telekomunikasi (TJKT)</option>
                            <option value="pk-rpl">Rekayasa Perangkat Lunak (RPL)</option>
                          </select>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-neutral-500">
                        Topik Dokumen: <span className="font-semibold text-neutral-700">{parsedDoc.judulDokumen}</span>
                      </p>
                    </div>

                    {/* Toolbar Pemilih Unit */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-800">
                          {parsedDoc.units.length} Unit Terdeteksi
                        </span>
                        <Badge variant="brand" className="text-[10px]">
                          {selectedUnitCodes.size} Dipilih
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-xs font-semibold text-slime-lime-800 hover:underline"
                        >
                          {selectedUnitCodes.size === parsedDoc.units.length ? "Batalkan Semua" : "Pilih Semua Unit"}
                        </button>
                        <span className="text-neutral-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setParsedDoc(null);
                            setParseError(null);
                          }}
                          className="text-xs text-neutral-500 hover:text-neutral-800"
                        >
                          Ganti PDF
                        </button>
                      </div>
                    </div>

                    {/* Daftar Card Unit */}
                    <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
                      {parsedDoc.units.map((unit) => {
                        const isSelected = selectedUnitCodes.has(unit.kodeUnit);
                        const isExpanded = expandedUnitCode === unit.kodeUnit;
                        const isEditing = editingCode === unit.kodeUnit;
                        const currentEdit = editableUnits[unit.kodeUnit] || unit;

                        return (
                          <div
                            key={unit.idTemp}
                            className={`rounded-2xl border p-3.5 transition-all ${
                              isSelected
                                ? "border-slime-lime-400 bg-slime-lime-50/30"
                                : "border-neutral-200 bg-white opacity-70"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleUnit(unit.kodeUnit)}
                                className="mt-1 size-4 rounded accent-slime-lime-600 cursor-pointer"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="brand" className="text-[10px] font-mono">
                                    {currentEdit.kodeUnit}
                                  </Badge>
                                  <span className="text-[11px] text-neutral-500">
                                    {unit.totalElemen} Elemen • {unit.totalKuk} KUK
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => setEditingCode(isEditing ? null : unit.kodeUnit)}
                                    className="ml-auto text-neutral-400 hover:text-neutral-700 p-1"
                                    title="Edit Kode/Judul"
                                  >
                                    <Edit2 className="size-3.5" />
                                  </button>
                                </div>

                                {isEditing ? (
                                  <div className="mt-2 space-y-2">
                                    <Input
                                      value={currentEdit.judulUnit}
                                      onChange={(e) =>
                                        setEditableUnits((prev) => ({
                                          ...prev,
                                          [unit.kodeUnit]: { ...currentEdit, judulUnit: e.target.value },
                                        }))
                                      }
                                      className="text-xs h-8 bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setEditingCode(null)}
                                      className="text-[11px] font-bold text-slime-lime-800"
                                    >
                                      Selesai Mengedit
                                    </button>
                                  </div>
                                ) : (
                                  <p className="mt-1 text-xs font-bold text-neutral-900 leading-snug">
                                    {currentEdit.judulUnit}
                                  </p>
                                )}

                                {/* Tombol intip Elemen & KUK */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedUnitCode(isExpanded ? null : unit.kodeUnit)}
                                  className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800"
                                >
                                  {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                                  <span>{isExpanded ? "Tutup rincian KUK" : "Intip daftar KUK"}</span>
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 rounded-xl bg-white p-3 border border-neutral-200 text-[11px] space-y-2">
                                    {unit.elemen.map((el, elIdx) => (
                                      <div key={elIdx}>
                                        <span className="font-bold text-neutral-800">
                                          {elIdx + 1}. {el.judul}
                                        </span>
                                        <ul className="pl-3 list-disc text-neutral-600 mt-0.5 space-y-0.5">
                                          {el.kuk.map((k, kIdx) => (
                                            <li key={kIdx}>
                                              <span className="font-mono text-[10px] text-neutral-400 mr-1">{k.kode}</span>
                                              {k.teks}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tombol Eksekusi Impor */}
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                      <span className="text-xs text-neutral-500">
                        {selectedUnitCodes.size} unit siap diimpor ke akun Anda
                      </span>
                      <Button
                        type="button"
                        loading={isImporting}
                        disabled={isImporting || selectedUnitCodes.size === 0}
                        onClick={handleSaveImport}
                        className="bg-slime-lime-500 text-slime-lime-950 font-bold hover:bg-slime-lime-400 text-xs px-6 py-2.5 rounded-full"
                      >
                        <Check className="size-4 mr-1.5" />
                        <span>Impor {selectedUnitCodes.size} Unit ke Modul Ajar</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INPUT TEKS MANUAL (CADANGAN) */}
            {activeTab === "manual" && (
              <form action={manualFormAction} className="mt-6 space-y-4">
                {manualState?.error && (
                  <div className="rounded-2xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
                    {manualState.error}
                  </div>
                )}

                {manualState?.success && (
                  <div className="rounded-2xl bg-slime-lime-50 p-4 border border-slime-lime-300 text-xs text-slime-lime-950 space-y-2">
                    <p className="font-bold">Unit {manualState.kodeUnit} Berhasil Diproses!</p>
                    <Link
                      href={`/guru/susun/${manualState.unitId}`}
                      onClick={handleClose}
                      className="inline-flex items-center gap-1 font-bold text-slime-lime-800 underline"
                    >
                      Buka Kanvas Penyusun Modul Ajar &rarr;
                    </Link>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={fillSample}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slime-lime-800 hover:text-slime-lime-900 bg-slime-lime-50 hover:bg-slime-lime-100 px-3 py-1.5 rounded-full border border-slime-lime-200"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Coba Contoh Unit</span>
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
                    >
                      <option value="pk-tkj">Teknik Komputer &amp; Jaringan (TKJ)</option>
                      <option value="pk-rpl">Rekayasa Perangkat Lunak (RPL)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                    Elemen Kompetensi &amp; KUK (Tempelkan Teks Dokumen)
                  </label>
                  <Textarea
                    name="elemenRawText"
                    rows={6}
                    placeholder={"1. Menyiapkan perangkat lunak\n1.1 Spesifikasi sistem dianalisis\n2. Menjalankan pengujian..."}
                    value={elemen}
                    onChange={(e) => setElemen(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-neutral-100 pt-3">
                  <Button type="button" variant="secondary" onClick={handleClose} disabled={manualPending}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={manualPending}
                    className="bg-slime-lime-500 text-slime-lime-950 font-bold hover:bg-slime-lime-400"
                  >
                    Ekstrak &amp; Simpan Unit
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
