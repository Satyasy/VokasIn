import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Layers,
  Award,
  Globe,
  Sliders,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { listMapelForGuru } from "@/lib/data-access-db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function GuruBahanAjarPage({
  searchParams,
}: {
  searchParams?: Promise<{ tingkat?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const guru = getGuruById(session.guruId);
  const mapelList = await listMapelForGuru(session.guruId);

  const params = searchParams ? await searchParams : undefined;
  const currentTingkat = params?.tingkat || "ALL";

  const filteredMapel = currentTingkat === "ALL"
    ? mapelList
    : mapelList.filter((m) => m.tingkatKelas === currentTingkat);

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-20">
      {/* Top Breadcrumb Header */}
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/guru"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Dasbor Guru</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="brand" className="text-xs font-bold font-mono">
              Kurikulum Berbasis KKTP
            </Badge>
            <span className="hidden sm:inline text-xs text-neutral-400 font-medium">•</span>
            <span className="hidden sm:inline text-xs text-neutral-500 font-semibold">
              SKKNI &amp; WorldSkills Standards
            </span>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-white border-b border-neutral-200/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slime-lime-100 text-slime-lime-950 text-xs font-extrabold mb-3">
            <Sparkles className="size-3.5" />
            <span>Katalog Bahan Ajar Mata Pelajaran Kejuruan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
            Bahan Ajar, Jobsheet &amp; Rubrik KKTP
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
            Pilih mata pelajaran yang Anda ampu untuk menyusun modul ajar tripartit (Teori 20%, Praktikum Mingguan Mandiri 40%, dan Proyek Kelompok 40%), otomatis tersinkronisasi dengan rujukan SKKNI Kemnaker dan WorldSkills (WSOS).
          </p>

          {/* Tab Filter Tingkat Kelas */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: "ALL", label: `Semua Mata Pelajaran (${mapelList.length})` },
              { id: "X", label: "Kelas X" },
              { id: "XI", label: "Kelas XI" },
              { id: "XII", label: "Kelas XII" },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={tab.id === "ALL" ? "/guru/bahan-ajar" : `/guru/bahan-ajar?tingkat=${tab.id}`}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  currentTingkat === tab.id
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Mata Pelajaran */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {filteredMapel.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto size-12 text-neutral-300 mb-3" />
            <h3 className="text-base font-bold text-neutral-800">
              Belum Ada Mata Pelajaran untuk Kategori Ini
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Silakan hubungi Kaprogli untuk mendaftarkan mata pelajaran atau menyinkronkan unit SKKNI ke jurusan Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMapel.map((mapel) => (
              <article
                key={mapel.id}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slime-lime-950 bg-slime-lime-100 px-2.5 py-0.5 rounded-md">
                      {mapel.kodeMapel || `Kelas ${mapel.tingkatKelas}`}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-500">
                      Kelas {mapel.tingkatKelas} • Sem {mapel.semester}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-neutral-900 leading-snug mb-2">
                    {mapel.namaMapel}
                  </h3>

                  {mapel.deskripsi && (
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-4">
                      {mapel.deskripsi}
                    </p>
                  )}

                  {/* Lencana Ganda Standar */}
                  <div className="space-y-2 rounded-2xl bg-neutral-50 p-3 border border-neutral-100 text-xs mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 flex items-center gap-1.5 font-medium">
                        <Award className="size-3.5 text-slime-lime-700" />
                        <span>Rujukan SKKNI:</span>
                      </span>
                      <span className="font-bold text-neutral-900">
                        {mapel.totalSkkniSync} Unit Disinkronkan
                      </span>
                    </div>

                    {mapel.rujukanWsos && (
                      <div className="flex items-center justify-between border-t border-neutral-200/50 pt-1.5">
                        <span className="text-neutral-500 flex items-center gap-1.5 font-medium">
                          <Globe className="size-3.5 text-blue-600" />
                          <span>WorldSkills (WSOS):</span>
                        </span>
                        <span className="font-bold text-blue-900 truncate max-w-[150px]">
                          {mapel.rujukanWsos}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-neutral-200/50 pt-1.5">
                      <span className="text-neutral-500 flex items-center gap-1.5 font-medium">
                        <Sliders className="size-3.5 text-purple-600" />
                        <span>Passing Grade:</span>
                      </span>
                      <span className="font-extrabold text-slime-lime-950 bg-slime-lime-200 px-2 py-0.5 rounded">
                        Min. {mapel.passingGradeMinimum} (Cakap)
                      </span>
                    </div>
                  </div>

                  {/* Cuplikan Unit Kompetensi */}
                  {mapel.units.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Capaian Unit SKKNI:
                      </span>
                      {mapel.units.slice(0, 2).map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between gap-2 text-xs bg-neutral-50 rounded-lg p-2 border border-neutral-100"
                        >
                          <span className="font-mono text-[10px] font-bold text-neutral-500">
                            {u.kodeUnit}
                          </span>
                          <span className="text-neutral-800 font-semibold truncate flex-1 text-right">
                            {u.judulUnit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tombol Aksi Masuk Kanvas Bahan Ajar */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-neutral-500 font-semibold">
                    {mapel.alokasiJpMingguan} JP / Minggu
                  </div>

                  <Link
                    href={`/guru/bahan-ajar/${mapel.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slime-lime-500 px-4 py-2 text-xs font-extrabold text-slime-lime-950 hover:bg-slime-lime-400 transition-colors shadow-2xs"
                  >
                    <span>Susun Bahan Ajar</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
