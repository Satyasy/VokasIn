"use client";

import { useMemo } from "react";
import { Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import type { JadwalPembelajaran, JpSummary } from "@/lib/types";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Badge } from "@/components/ui/badge";

interface GuruJpChartProps {
  jpSummary: JpSummary;
  jadwalList: JadwalPembelajaran[];
}

export function GuruJpChart({ jpSummary, jadwalList }: GuruJpChartProps) {
  // Hitung alokasi per pekan (Minggu 1 s.d. 18)
  const weeklyData = useMemo(() => {
    // Cari minggu maksimum yang ada atau default 16
    const maxMinggu = Math.max(16, ...jadwalList.map((j) => j.mingguKe));
    const weeks: {
      mingguKe: number;
      terlaksana: number;
      terjadwal: number;
      total: number;
      sesiCount: number;
    }[] = [];

    for (let w = 1; w <= Math.min(18, maxMinggu); w++) {
      const items = jadwalList.filter((j) => j.mingguKe === w);
      let terlaksana = 0;
      let terjadwal = 0;

      for (const item of items) {
        if (item.status === "terlaksana") terlaksana += item.alokasiJp;
        else if (item.status === "terjadwal") terjadwal += item.alokasiJp;
      }

      weeks.push({
        mingguKe: w,
        terlaksana,
        terjadwal,
        total: terlaksana + terjadwal,
        sesiCount: items.length,
      });
    }

    return weeks;
  }, [jadwalList]);

  const maxWeeklyJp = Math.max(10, ...weeklyData.map((w) => w.total));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Kartu 1: Visual Capaian Semester (Angka + Circular Ring) */}
      <div className="flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Realisasi Beban Mengajar
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-slime-lime-100 text-slime-lime-800">
              <Clock className="size-4" aria-hidden />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-neutral-900">
                  {jpSummary.jpTerlaksana}
                </span>
                <span className="text-sm font-bold text-neutral-500">
                  / {jpSummary.targetJpSemester} JP
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Sisa target: {Math.max(0, jpSummary.targetJpSemester - jpSummary.jpTerlaksana)} JP
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <Badge variant="brand" className="font-extrabold text-[11px]">
                  {jpSummary.persentaseTerlaksana}% Terpenuhi
                </Badge>
              </div>
            </div>

            {/* Circular Progress Ring SVG */}
            <div className="shrink-0">
              <CircularProgress
                value={jpSummary.persentaseTerlaksana}
                size={96}
                strokeWidth={9}
                label={`${jpSummary.persentaseTerlaksana}%`}
                sublabel="Selesai"
              />
            </div>
          </div>
        </div>

        {/* Breakdown status */}
        <div className="mt-6 border-t border-neutral-100 pt-4 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl bg-neutral-50 p-2.5">
            <span className="text-neutral-500 font-medium">Selesai</span>
            <p className="mt-0.5 font-bold text-neutral-900">{jpSummary.sesiTerlaksana} Sesi</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-2.5">
            <span className="text-neutral-500 font-medium">Terjadwal</span>
            <p className="mt-0.5 font-bold text-neutral-900">
              {jpSummary.totalSesi - jpSummary.sesiTerlaksana} Sesi
            </p>
          </div>
        </div>
      </div>

      {/* Kartu 2: Grafik Batang Timeline Distribusi JP per Pekan (Minggu 1-18) */}
      <div className="lg:col-span-2 flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Distribusi Jam Pelajaran per Pekan (Semester Ganjil)
              </h3>
              <p className="text-xs text-neutral-500">
                Visualisasi beban mengajar mingguan: jam tuntas praktikum vs agenda mendatang
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-neutral-700">
                <span className="size-2.5 rounded-sm bg-slime-lime-500" />
                Terlaksana
              </span>
              <span className="flex items-center gap-1.5 text-neutral-500">
                <span className="size-2.5 rounded-sm bg-neutral-200" />
                Terjadwal
              </span>
            </div>
          </div>

          {/* Histogram Chart Batang Mingguan */}
          <div className="mt-5 grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1.5 items-end h-32 pt-2">
            {weeklyData.slice(0, 16).map((w) => {
              const terlaksanaHeight =
                maxWeeklyJp > 0 ? (w.terlaksana / maxWeeklyJp) * 100 : 0;
              const terjadwalHeight =
                maxWeeklyJp > 0 ? (w.terjadwal / maxWeeklyJp) * 100 : 0;

              return (
                <div
                  key={w.mingguKe}
                  className="flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="rounded-lg bg-neutral-950 px-2 py-1 text-[10px] font-bold text-white shadow-lg whitespace-nowrap">
                      Mgg {w.mingguKe}: {w.terlaksana} JP selesai {w.terjadwal > 0 ? `(${w.terjadwal} JP terjadwal)` : ""}
                    </div>
                    <div className="size-1.5 rotate-45 bg-neutral-950 -mt-1" />
                  </div>

                  {/* Stacked bar */}
                  <div className="w-full max-w-[20px] bg-neutral-100 rounded-t-md overflow-hidden flex flex-col-reverse h-24">
                    {/* Terlaksana (Hijau Lime) */}
                    <div
                      className="w-full bg-slime-lime-500 transition-all duration-300"
                      style={{ height: `${terlaksanaHeight}%` }}
                    />
                    {/* Terjadwal (Abu-abu / Netral) */}
                    <div
                      className="w-full bg-neutral-300 transition-all duration-300"
                      style={{ height: `${terjadwalHeight}%` }}
                    />
                  </div>

                  <span className="mt-1.5 text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900 transition-colors">
                    M{w.mingguKe}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-600 flex items-center justify-between">
          <span>Rata-rata alokasi mengajar: <strong>~5 JP per sesi</strong> tatap muka lab</span>
          <span className="font-bold text-slime-lime-800">1 JP = 45 menit</span>
        </div>
      </div>
    </div>
  );
}
