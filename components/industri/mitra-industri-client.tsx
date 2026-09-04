"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Users,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Map,
  Compass,
} from "lucide-react";
import { MITRA_INDUSTRI_LIST, type MitraIndustri } from "@/lib/mitra-industri";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginatedList } from "@/components/ui/pagination";

export function MitraIndustriClient() {
  const [filterProgram, setFilterProgram] = useState<string>("all");

  const filteredMitra =
    filterProgram === "all"
      ? MITRA_INDUSTRI_LIST
      : MITRA_INDUSTRI_LIST.filter(
          (m) => m.programKeahlianId === filterProgram || m.programKeahlianId === "all"
        );

  return (
    <div className="space-y-6">
      {/* Banner Regulasi Penyelarasan SMK & DUDI */}
      <div className="rounded-2xl border border-slime-lime-300 bg-slime-lime-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 shrink-0 text-slime-lime-800 mt-0.5" aria-hidden />
          <div className="text-xs leading-relaxed text-neutral-800">
            <strong className="text-slime-lime-950 font-bold block mb-1">
              Penyelarasan Kurikulum SMK dengan Dunia Usaha &amp; Industri (Permendikdasmen No. 8/2026)
            </strong>
            Seluruh materi kunjungan industri dan pembelajaran lapangan di bawah ini telah dipetakan langsung ke unit kompetensi SKKNI resmi rujukan SMK. Hal ini memastikan pembelajaran lapangan memiliki landasan hukum yang sah dan tidak menyimpang dari capaian kompetensi nasional.
          </div>
        </div>
      </div>

      {/* Program Selector Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-3">
        <button
          type="button"
          onClick={() => setFilterProgram("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
            filterProgram === "all"
              ? "bg-slime-lime-500 text-neutral-950 shadow-sm"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Semua Mitra Industri ({MITRA_INDUSTRI_LIST.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterProgram("pk-tkj")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
            filterProgram === "pk-tkj"
              ? "bg-slime-lime-500 text-neutral-950 shadow-sm"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Teknik Komputer &amp; Jaringan (TKJ)
        </button>
        <button
          type="button"
          onClick={() => setFilterProgram("pk-rpl")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
            filterProgram === "pk-rpl"
              ? "bg-slime-lime-500 text-neutral-950 shadow-sm"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Rekayasa Perangkat Lunak (RPL)
        </button>
      </div>

      {/* Paginated Card List 10 items per page */}
      <PaginatedList<MitraIndustri>
        items={filteredMitra}
        itemsPerPage={10}
        searchPlaceholder="Cari perusahaan, kota, materi industri, atau unit SKKNI..."
        searchFilter={(m, q) =>
          m.namaPerusahaan.toLowerCase().includes(q) ||
          m.lokasi.toLowerCase().includes(q) ||
          m.sektorIndustri.toLowerCase().includes(q) ||
          m.fokusPembelajaran.some((f) => f.toLowerCase().includes(q)) ||
          m.unitSkkniTerkait.some((u) => u.kodeUnit.toLowerCase().includes(q) || u.judulUnit.toLowerCase().includes(q))
        }
        emptyState={
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <Building2 className="mx-auto size-10 text-neutral-400" aria-hidden />
            <p className="mt-3 text-sm font-bold text-neutral-900">
              Tidak ada mitra industri yang cocok dengan pencarian Anda.
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Coba sesuaikan kata kunci pencarian atau pilih program keahlian lain.
            </p>
          </div>
        }
        renderItem={(mitra) => (
          <Card key={mitra.id} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" className="font-bold">
                    {mitra.programSingkatan}
                  </Badge>
                  <span className="text-xs font-semibold text-neutral-500">
                    {mitra.sektorIndustri}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-neutral-900">
                  {mitra.namaPerusahaan}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-600 sm:self-start">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-slime-lime-800" aria-hidden />
                  {mitra.lokasi}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5 text-slime-lime-800" aria-hidden />
                  {mitra.kapasitasKunjungan}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              {mitra.deskripsi}
            </p>

            {/* Apa yang Dipelajari Siswa di Lapangan Industri */}
            <div className="mt-4 rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-slime-lime-700" aria-hidden />
                Fokus Pembelajaran Lapangan &amp; Mini Pelatihan:
              </h4>
              <ul className="space-y-1.5">
                {mitra.fokusPembelajaran.map((fokus, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed">
                    <CheckCircle2 className="size-3.5 text-slime-lime-600 mt-0.5 shrink-0" aria-hidden />
                    <span>{fokus}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Studi Kasus Nyata di Industri */}
            <div className="mt-4 text-xs text-neutral-700">
              <strong className="text-neutral-900 font-bold">Studi Kasus Lapangan: </strong>
              <span>&ldquo;{mitra.studiKasusNyata}&rdquo;</span>
            </div>

            {/* Keterkaitan dengan Unit SKKNI Resmi */}
            <div className="mt-5 border-t border-neutral-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Landasan Unit SKKNI Rujukan:
                </span>
                <span className="text-[11px] font-semibold text-slime-lime-800">
                  Terhubung ke Modul Ajar SMK
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {mitra.unitSkkniTerkait.map((u) => (
                  <div
                    key={u.unitId}
                    className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" className="font-extrabold text-[10px]">
                          {u.kodeUnit}
                        </Badge>
                        <span className="font-bold text-neutral-900 truncate">
                          {u.judulUnit}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-neutral-600 leading-relaxed">
                        {u.keterkaitan}
                      </p>
                    </div>

                    <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200/60">
                      <Link
                        href={`/roadmap/${mitra.programKeahlianId === "all" ? "pk-tkj" : mitra.programKeahlianId}?highlight=${u.unitId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slime-lime-100/70 hover:bg-slime-lime-200 px-2 py-1 text-[11px] font-bold text-slime-lime-950 transition-colors"
                        title="Lihat posisi unit ini di alur Roadmap SMK"
                      >
                        <Map className="size-3 text-slime-lime-800" />
                        <span>Lihat Alur di Roadmap</span>
                      </Link>

                      <Link
                        href={`/jelajah-kompetensi?prompt=${encodeURIComponent(u.judulUnit)}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-800 transition-colors"
                        title="Uji kesesuaian proyek portofolio Anda dengan unit industri ini"
                      >
                        <Compass className="size-3 text-slime-lime-700" />
                        <span>Cocokkan Portofolio</span>
                      </Link>

                      <Link
                        href={`/guru/susun/${u.unitId}`}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-800 ml-auto"
                        title="Untuk Guru Produktif"
                      >
                        <BookOpen className="size-2.5" />
                        <span>Susun Modul</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      />
    </div>
  );
}
