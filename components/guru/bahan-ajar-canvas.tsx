"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  Globe,
  Sliders,
  Plus,
  Trash2,
  Save,
  Printer,
  Sparkles,
  Layers,
  BookOpen,
  Check,
  Calculator,
  ShieldAlert,
  Flame,
  FileCheck,
} from "lucide-react";
import type {
  MataPelajaran,
  BahanAjarMapel,
  JobsheetItem,
  ProyekKelompokItem,
  RubrikKktpItem,
  AssessmentInput,
} from "@/lib/types";
import type { MataPelajaranWithDetails } from "@/lib/data-access-db";
import { evaluateKKTP, generateDefaultRubrikKktp } from "@/lib/kktp-evaluator";
import { saveBahanAjarAction } from "@/app/kaprogli/mapel-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface BahanAjarCanvasProps {
  mapel: MataPelajaranWithDetails;
  initialBahanAjar?: BahanAjarMapel;
  guruId: string;
}

export function BahanAjarCanvas({
  mapel,
  initialBahanAjar,
  guruId,
}: BahanAjarCanvasProps) {
  const [activeTab, setActiveTab] = useState<"teori" | "jobsheet" | "pbl" | "rubrik" | "kalkulator">("teori");

  // State Konten Bahan Ajar
  const [judul, setJudul] = useState(
    initialBahanAjar?.judul || `Perangkat Ajar & Jobsheet: ${mapel.namaMapel} (Kelas ${mapel.tingkatKelas})`
  );
  const [ringkasanTeori, setRingkasanTeori] = useState(
    initialBahanAjar?.ringkasanTeori ||
      `Mata pelajaran ${mapel.namaMapel} dirancang untuk membekali peserta didik dengan pemahaman arsitektur dasar dan kompetensi teknis sesuai standar SKKNI rujukan. Peserta didik diharapkan menguasai konsep kunci sebelum terjun ke laboratorium praktikum.`
  );

  const [jobsheetList, setJobsheetList] = useState<JobsheetItem[]>(
    initialBahanAjar?.jobsheetMingguan && initialBahanAjar.jobsheetMingguan.length > 0
      ? initialBahanAjar.jobsheetMingguan
      : [
          {
            mingguKe: 1,
            judulPraktik: `Praktikum Mandiri 01: Persiapan Lingkungan & Dasar ${mapel.namaMapel}`,
            instruksiKerja: "Lakukan instalasi dan verifikasi kelayakan perangkat kerja sesuai instruksi kerja terlampir.",
            k3Safety: "Gunakan gelang statis / patuhi SOP kelistrikan lab saat mengoperasikan komputer kerja.",
            alatDibutuhkan: ["Komputer Kerja", "Perangkat Lunak Terkait"],
            kriteriaKuk: mapel.units[0]
              ? [{ kode: "1.1", teks: `Mengidentifikasi spesifikasi kebutuhan ${mapel.units[0].judulUnit}.` }]
              : [{ kode: "1.1", teks: "Mempersiapkan alat kerja praktikum." }],
          },
          {
            mingguKe: 2,
            judulPraktik: `Praktikum Mandiri 02: Implementasi Prosedur Teknis Inti`,
            instruksiKerja: "Konfigurasikan modul utama dan lakukan pengujian fungsional dasar hingga zero-error.",
            k3Safety: "Pastikan sirkulasi udara lab terjaga dan kabel tertata rapi pada tray kabel.",
            alatDibutuhkan: ["Komputer Kerja", "Kabel Jaringan"],
            kriteriaKuk: [{ kode: "2.1", teks: "Menjalankan pengujian fungsional dan mencatat log hasil eksekusi." }],
          },
        ]
  );

  const [proyekList, setProyekList] = useState<ProyekKelompokItem[]>(
    initialBahanAjar?.proyekKelompok && initialBahanAjar.proyekKelompok.length > 0
      ? initialBahanAjar.proyekKelompok
      : [
          {
            judulProyek: `Mini-Project Kolaboratif: Rancang Bangun Solusi Terpadu ${mapel.namaMapel}`,
            deskripsi:
              "Kelompok beranggotakan 3-4 siswa bekerja sama menyusun produk kerja terpadu dari analisis hingga deployment.",
            pembagianPeran: ["Project Lead & QA", "System / Code Architect", "Tester & Technical Writer"],
            kriteriaKarya: [
              "Solusi terintegrasi penuh tanpa runtime error",
              "Repositori Git terkelola dengan commit message bermakna",
              "Dokumentasi laporan teknis dan video demonstrasi sistem",
            ],
          },
        ]
  );

  const [rubrikList, setRubrikList] = useState<RubrikKktpItem[]>(
    initialBahanAjar?.rubrikKktp && initialBahanAjar.rubrikKktp.length > 0
      ? initialBahanAjar.rubrikKktp
      : generateDefaultRubrikKktp(
          mapel.namaMapel,
          mapel.units.map((u) => u.judulUnit)
        )
  );

  const [instruksiK3, setInstruksiK3] = useState(
    initialBahanAjar?.instruksiK3Kritis ||
      "Siswa WAJIB mengenakan jas lab / atribut K3, memastikan grounding perangkat aman, dan dilarang mengubah konfigurasi jaringan inti sekolah tanpa izin instruktur."
  );

  // State Simpan
  const [isSaving, startSaveTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State Simulasi Penilaian KKTP (Client-Side Calculator)
  const [calcTeori, setCalcTeori] = useState(85);
  const [calcPraktik, setCalcPraktik] = useState(82);
  const [calcPbl, setCalcPbl] = useState(88);
  const [calcK3Violation, setCalcK3Violation] = useState(false);
  const [calcFatalError, setCalcFatalError] = useState(false);

  const evalResult = useMemo(() => {
    return evaluateKKTP({
      teori: calcTeori,
      praktikMingguan: calcPraktik,
      praktikKelompok: calcPbl,
      k3Violation: calcK3Violation,
      fatalError: calcFatalError,
      passingGrade: mapel.passingGradeMinimum,
    });
  }, [calcTeori, calcPraktik, calcPbl, calcK3Violation, calcFatalError, mapel.passingGradeMinimum]);

  function handleSave(status: "draft" | "final" = "draft") {
    startSaveTransition(async () => {
      const res = await saveBahanAjarAction({
        id: initialBahanAjar?.id,
        mataPelajaranId: mapel.id,
        guruId,
        judul,
        tingkatKelas: mapel.tingkatKelas,
        ringkasanTeori,
        jobsheetMingguan: jobsheetList,
        proyekKelompok: proyekList,
        rubrikKktp: rubrikList,
        instruksiK3Kritis: instruksiK3,
        status,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  }

  function addJobsheet() {
    const nextMinggu = jobsheetList.length + 1;
    setJobsheetList([
      ...jobsheetList,
      {
        mingguKe: nextMinggu,
        judulPraktik: `Praktikum Mandiri 0${nextMinggu}: Pengujian Lanjutan ${mapel.namaMapel}`,
        instruksiKerja: "Lakukan tahapan konfigurasi dan dokumentasikan verifikasi kerja pada lembar jobsheet.",
        k3Safety: "Patuhi prosedur keselamatan kerja kelistrikan laboratorium.",
        alatDibutuhkan: ["Komputer Kerja"],
        kriteriaKuk: [{ kode: `${nextMinggu}.1`, teks: "Menuntaskan tahapan prosedur kerja sesuai standar unjuk kerja." }],
      },
    ]);
  }

  function removeJobsheet(index: number) {
    setJobsheetList(jobsheetList.filter((_, idx) => idx !== index));
  }

  return (
    <div className="min-h-screen bg-neutral-50/70 pb-24">
      {/* Top Bar Navigasi */}
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/guru/bahan-ajar"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Katalog Mapel</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.print()}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold"
            >
              <Printer className="size-3.5 mr-1.5" />
              <span>Cetak Blanko Asesmen</span>
            </Button>

            <Button
              type="button"
              loading={isSaving}
              disabled={isSaving}
              onClick={() => handleSave("final")}
              className="rounded-full bg-slime-lime-500 px-5 py-1.5 text-xs font-black text-slime-lime-950 hover:bg-slime-lime-400 shadow-xs"
            >
              <Save className="size-3.5 mr-1.5" />
              <span>{saveSuccess ? "✓ Tersimpan!" : "Simpan Perangkat Ajar"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Header Mapel & Standar */}
      <section className="bg-white border-b border-neutral-200/60 py-6 px-4 sm:px-6 lg:px-8 print:border-none print:py-2">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slime-lime-950 bg-slime-lime-100 px-2.5 py-0.5 rounded-md">
                  {mapel.kodeMapel || `Kelas ${mapel.tingkatKelas}`}
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  Kelas {mapel.tingkatKelas} • Semester {mapel.semester} • {mapel.alokasiJpMingguan} JP/Minggu
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                {mapel.namaMapel}
              </h1>
            </div>

            {/* Badges Standar Ganda */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <div className="flex items-center gap-1.5 rounded-xl bg-neutral-50 px-3 py-1.5 border border-neutral-200 text-xs font-bold text-neutral-800">
                <Award className="size-3.5 text-slime-lime-700" />
                <span>SKKNI: {mapel.totalSkkniSync} Unit Disinkronkan</span>
              </div>

              {mapel.rujukanWsos && (
                <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 border border-blue-200 text-xs font-bold text-blue-900">
                  <Globe className="size-3.5 text-blue-600" />
                  <span>WSOS: {mapel.rujukanWsos}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 border border-purple-200 text-xs font-bold text-purple-900">
                <Sliders className="size-3.5 text-purple-600" />
                <span>Passing Grade: Min. {mapel.passingGradeMinimum}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        {/* Banner Bobot Tripartit Standar Industri */}
        <div className="mb-6 rounded-2xl bg-neutral-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-800 text-slime-lime-400">
              <Sliders className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Formula Pembobotan KKTP Tripartit BSKAP Kemendikdasmen
              </h4>
              <p className="text-xs text-neutral-400">
                Ambang batas kelulusan: <span className="font-bold text-slime-lime-400">{mapel.passingGradeMinimum} (Cakap)</span> • Pelanggaran K3 fatal / broken code memicu pembatalan kelulusan praktikum.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-300">
              20% Teori
            </span>
            <span className="text-neutral-500 font-bold">+</span>
            <span className="rounded-lg bg-slime-lime-500 px-2.5 py-1 text-xs font-extrabold text-slime-lime-950">
              40% Praktik Mandiri
            </span>
            <span className="text-neutral-500 font-bold">+</span>
            <span className="rounded-lg bg-slime-lime-400 px-2.5 py-1 text-xs font-extrabold text-slime-lime-950">
              40% Proyek PBL
            </span>
          </div>
        </div>

        {/* Tab Switcher Antara Komponen Bahan Ajar */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 pb-3 mb-6 print:hidden">
          {[
            { id: "teori", label: "1. Pengantar Teori & Konsep" },
            { id: "jobsheet", label: `2. Jobsheet Praktikum Mingguan (${jobsheetList.length})` },
            { id: "pbl", label: `3. Proyek Kelompok / PBL (${proyekList.length})` },
            { id: "rubrik", label: "4. Rubrik KKTP 4 Tingkat" },
            { id: "kalkulator", label: "🧮 Simulator Penilaian KKTP" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-slime-lime-500 text-slime-lime-950 shadow-xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PENGANTAR TEORI & KONSEP */}
        {activeTab === "teori" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 sm:p-7 border border-neutral-200 shadow-2xs space-y-4">
              <div>
                <label className="text-xs font-extrabold text-neutral-900 uppercase block mb-1">
                  Judul Dokumen Perangkat Ajar:
                </label>
                <Input
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="font-bold text-sm bg-neutral-50"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-neutral-900 uppercase block mb-1">
                  Ringkasan Materi Teori &amp; Konsep Kunci (Bobot 20%):
                </label>
                <Textarea
                  rows={6}
                  value={ringkasanTeori}
                  onChange={(e) => setRingkasanTeori(e.target.value)}
                  className="text-xs sm:text-sm leading-relaxed"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Materi pengantar di kelas sebelum peserta didik melaksanakan praktikum mandiri di bengkel/lab.
                </p>
              </div>

              {/* Rujukan Unit SKKNI */}
              <div className="border-t border-neutral-100 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Unit SKKNI Rujukan Resmi yang Ditugaskan Kaprogli:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mapel.units.map((u) => (
                    <div key={u.id} className="rounded-2xl bg-neutral-50 p-4 border border-neutral-200/80">
                      <span className="font-mono text-xs font-bold text-slime-lime-950 bg-slime-lime-100 px-2 py-0.5 rounded">
                        {u.kodeUnit}
                      </span>
                      <h5 className="text-sm font-bold text-neutral-900 mt-1.5 leading-snug">
                        {u.judulUnit}
                      </h5>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOBSHEET PRAKTIKUM MINGGUAN */}
        {activeTab === "jobsheet" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900">
                  Jobsheet Praktikum Mingguan (Bobot 40%)
                </h3>
                <p className="text-xs text-neutral-500">
                  Langkah kerja mandiri tiap peserta didik yang memetakan Kriteria Unjuk Kerja (KUK) resmi SKKNI.
                </p>
              </div>
              <Button
                type="button"
                onClick={addJobsheet}
                className="rounded-full bg-slime-lime-500 px-4 py-1.5 text-xs font-bold text-slime-lime-950 hover:bg-slime-lime-400"
              >
                <Plus className="size-3.5 mr-1" />
                <span>Tambah Sesi Praktikum</span>
              </Button>
            </div>

            <div className="space-y-5">
              {jobsheetList.map((job, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white p-6 border border-neutral-200 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-neutral-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
                        Minggu Ke-{job.mingguKe}
                      </span>
                      <Input
                        value={job.judulPraktik}
                        onChange={(e) => {
                          const next = [...jobsheetList];
                          next[idx].judulPraktik = e.target.value;
                          setJobsheetList(next);
                        }}
                        className="font-bold text-sm h-9 bg-neutral-50 flex-1 min-w-[280px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeJobsheet(idx)}
                      className="p-1 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Hapus Praktikum"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                      Instruksi Kerja &amp; Skenario Praktikum:
                    </label>
                    <Textarea
                      rows={3}
                      value={job.instruksiKerja}
                      onChange={(e) => {
                        const next = [...jobsheetList];
                        next[idx].instruksiKerja = e.target.value;
                        setJobsheetList(next);
                      }}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1 mb-1">
                        <Flame className="size-3.5" />
                        <span>Instruksi Keselamatan Kerja (K3):</span>
                      </label>
                      <Input
                        value={job.k3Safety}
                        onChange={(e) => {
                          const next = [...jobsheetList];
                          next[idx].k3Safety = e.target.value;
                          setJobsheetList(next);
                        }}
                        className="text-xs border-amber-200 bg-amber-50/40 text-amber-950"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                        Kebutuhan Alat &amp; Bahan Lab:
                      </label>
                      <Input
                        value={job.alatDibutuhkan.join(", ")}
                        onChange={(e) => {
                          const next = [...jobsheetList];
                          next[idx].alatDibutuhkan = e.target.value.split(",").map((s) => s.trim());
                          setJobsheetList(next);
                        }}
                        placeholder="Pisahkan dengan koma (mis. Komputer, Kabel LAN)"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROYEK KELOMPOK / PBL */}
        {activeTab === "pbl" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">
                Praktikum Kelompok / Mini-Project (Bobot 40%)
              </h3>
              <p className="text-xs text-neutral-500">
                Tugas kolaboratif Project-Based Learning (PBL) yang menggabungkan elemen kompetensi menjadi portofolio produk nyata.
              </p>
            </div>

            <div className="space-y-5">
              {proyekList.map((proyek, idx) => (
                <div key={idx} className="rounded-3xl bg-white p-6 border border-neutral-200 shadow-2xs space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 uppercase block mb-1">
                      Judul Tugas Mini-Project Kelompok:
                    </label>
                    <Input
                      value={proyek.judulProyek}
                      onChange={(e) => {
                        const next = [...proyekList];
                        next[idx].judulProyek = e.target.value;
                        setProyekList(next);
                      }}
                      className="font-bold text-sm bg-neutral-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 uppercase block mb-1">
                      Deskripsi Skenario Kasus Industri:
                    </label>
                    <Textarea
                      rows={3}
                      value={proyek.deskripsi}
                      onChange={(e) => {
                        const next = [...proyekList];
                        next[idx].deskripsi = e.target.value;
                        setProyekList(next);
                      }}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                        Pembagian Peran Anggota Tim:
                      </label>
                      <Input
                        value={proyek.pembagianPeran.join(", ")}
                        onChange={(e) => {
                          const next = [...proyekList];
                          next[idx].pembagianPeran = e.target.value.split(",").map((s) => s.trim());
                          setProyekList(next);
                        }}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
                        Kriteria Kelulusan Portofolio (Checklist Deliverable):
                      </label>
                      <Input
                        value={proyek.kriteriaKarya.join(", ")}
                        onChange={(e) => {
                          const next = [...proyekList];
                          next[idx].kriteriaKarya = e.target.value.split(",").map((s) => s.trim());
                          setProyekList(next);
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RUBRIK KKTP 4 TINGKAT */}
        {activeTab === "rubrik" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">
                Rubrik Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) 4 Tingkat
              </h3>
              <p className="text-xs text-neutral-500">
                Standar acuan penilaian bertingkat BSKAP Kemendikdasmen (Perlu Bimbingan, Cukup, Cakap [Passing Grade 80], dan Mahir).
              </p>
            </div>

            <div className="space-y-5">
              {rubrikList.map((rubrik, idx) => (
                <div key={idx} className="rounded-3xl bg-white p-6 border border-neutral-200 shadow-2xs space-y-4">
                  <div className="border-b border-neutral-100 pb-2.5">
                    <h4 className="text-sm font-extrabold text-neutral-900">
                      Aspek {idx + 1}: {rubrik.aspek}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{rubrik.indikator}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-2xl bg-red-50/60 p-3.5 border border-red-200">
                      <span className="font-bold text-red-900 block mb-1">Perlu Bimbingan (0 - 69)</span>
                      <p className="text-red-800 leading-relaxed">{rubrik.kriteria.perluBimbingan}</p>
                    </div>

                    <div className="rounded-2xl bg-amber-50/60 p-3.5 border border-amber-200">
                      <span className="font-bold text-amber-900 block mb-1">Cukup (70 - 79)</span>
                      <p className="text-amber-800 leading-relaxed">{rubrik.kriteria.cukup}</p>
                    </div>

                    <div className="rounded-2xl bg-slime-lime-50/80 p-3.5 border border-slime-lime-400 shadow-xs">
                      <span className="font-extrabold text-slime-lime-950 block mb-1">
                        ★ Cakap (80 - 89) [PASS]
                      </span>
                      <p className="text-slime-lime-950 leading-relaxed font-medium">
                        {rubrik.kriteria.cakap}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50/60 p-3.5 border border-blue-200">
                      <span className="font-bold text-blue-900 block mb-1">Mahir (90 - 100)</span>
                      <p className="text-blue-800 leading-relaxed">{rubrik.kriteria.mahir}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SIMULATOR & KALKULATOR PENILAIAN KKTP (Zero Student Storage) */}
        {activeTab === "kalkulator" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">
                Simulator Kalkulator Penilaian KKTP Kejuruan
              </h3>
              <p className="text-xs text-neutral-500">
                Uji perhitungan nilai gabungan tripartit dan simulasi aturan keselamatan kerja (Hard-Gate K3 &amp; Broken Code) langsung di browser Anda (100% Zero-Student DB, mematuhi UU PDP No. 27/2022).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Panel Input Nilai */}
              <div className="lg:col-span-7 rounded-3xl bg-white p-6 border border-neutral-200 shadow-2xs space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-extrabold text-neutral-900 uppercase">
                      Nilai Ujian Teori / Konsep (Bobot 20%):
                    </label>
                    <span className="font-bold text-neutral-900 text-sm">{calcTeori}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={calcTeori}
                    onChange={(e) => setCalcTeori(Number(e.target.value))}
                    className="w-full accent-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-extrabold text-slime-lime-950 uppercase">
                      Nilai Praktikum Mingguan Mandiri (Bobot 40%):
                    </label>
                    <span className="font-extrabold text-slime-lime-800 text-sm">{calcPraktik}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={calcPraktik}
                    onChange={(e) => setCalcPraktik(Number(e.target.value))}
                    className="w-full accent-slime-lime-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-extrabold text-slime-lime-950 uppercase">
                      Nilai Praktikum Kelompok / PBL (Bobot 40%):
                    </label>
                    <span className="font-extrabold text-slime-lime-800 text-sm">{calcPbl}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={calcPbl}
                    onChange={(e) => setCalcPbl(Number(e.target.value))}
                    className="w-full accent-slime-lime-600"
                  />
                </div>

                {/* Hard-Gate Safety Rule Toggles */}
                <div className="border-t border-neutral-100 pt-4 space-y-3">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Aturan Kritis Keselamatan Kerja &amp; Validasi Kode (Hard-Gate):
                  </span>

                  <label className="flex items-center gap-3 p-3 rounded-2xl border border-red-200 bg-red-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcK3Violation}
                      onChange={(e) => setCalcK3Violation(e.target.checked)}
                      className="size-4 accent-red-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-red-950 block">
                        Pelanggaran SOP Keselamatan Kerja (K3) Fatal
                      </span>
                      <span className="text-[11px] text-red-700">
                        Mengabaikan grounding/kelistrikan, tidak mengenakan APD, atau merusak alat bengkel.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-2xl border border-amber-200 bg-amber-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcFatalError}
                      onChange={(e) => setCalcFatalError(e.target.checked)}
                      className="size-4 accent-amber-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Fatal Runtime Error / Broken Build
                      </span>
                      <span className="text-[11px] text-amber-700">
                        Kode program tidak dapat dikompilasi atau topologi jaringan sama sekali tidak merespons.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Panel Hasil Evaluasi Real-Time */}
              <div className="lg:col-span-5 rounded-3xl bg-neutral-900 text-white p-6 border border-neutral-800 shadow-md space-y-5">
                <div className="text-center border-b border-neutral-800 pb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Nilai Akhir Agregat
                  </span>
                  <div className="text-5xl font-black text-white mt-1">
                    {evalResult.nilaiAkhir}
                  </div>
                  <div className="mt-2">
                    {evalResult.isPassing ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slime-lime-500 px-3.5 py-1 text-xs font-extrabold text-slime-lime-950">
                        <CheckCircle2 className="size-3.5" />
                        <span>TUNTAS PASSING GRADE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3.5 py-1 text-xs font-extrabold text-white">
                        <AlertTriangle className="size-3.5" />
                        <span>BELUM TUNTAS / REMEDIAL</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">Predikat KKTP:</span>
                    <span className="font-extrabold uppercase text-slime-lime-400">
                      {evalResult.predikat.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">Target Passing Grade:</span>
                    <span className="font-bold text-white">Min. {mapel.passingGradeMinimum}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block mb-1">Catatan Evaluasi:</span>
                    <p className="text-neutral-200 leading-relaxed bg-neutral-800 p-3 rounded-xl border border-neutral-700">
                      {evalResult.catatanEvaluasi}
                    </p>
                  </div>

                  {evalResult.remedialNote && (
                    <div>
                      <span className="text-red-400 block mb-1 font-bold">Instruksi Remedial:</span>
                      <p className="text-red-200 leading-relaxed bg-red-950/60 p-3 rounded-xl border border-red-800">
                        {evalResult.remedialNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
