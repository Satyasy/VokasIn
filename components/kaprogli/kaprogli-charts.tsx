"use client";

import { Users, Gauge, CheckCircle2 } from "lucide-react";
import type { Guru, JadwalPembelajaran } from "@/lib/types";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Badge } from "@/components/ui/badge";

interface KaprogliChartsProps {
  guruList: Guru[];
  jadwalList: JadwalPembelajaran[];
  currentKaprogliProgramId: string;
}

export function KaprogliCharts({
  guruList,
  jadwalList,
  currentKaprogliProgramId,
}: KaprogliChartsProps) {
  const filteredGurus = guruList.filter(
    (g) => g.programKeahlianId === currentKaprogliProgramId || currentKaprogliProgramId === "all"
  );

  const teacherStats = filteredGurus.map((guru) => {
    const guruJadwal = jadwalList.filter((j) => j.guruId === guru.id);
    const targetJp = guru.role === "kaprogli" ? 96 : 144;
    let terlaksana = 0;
    let terjadwal = 0;

    for (const j of guruJadwal) {
      if (j.status === "terlaksana") terlaksana += j.alokasiJp;
      else if (j.status === "terjadwal") terjadwal += j.alokasiJp;
    }

    const persentase = Math.min(100, Math.round((terlaksana / targetJp) * 100));

    return {
      guru,
      targetJp,
      terlaksana,
      terjadwal,
      persentase,
      sesiCount: guruJadwal.length,
    };
  });

  const totalTargetDepartment = teacherStats.reduce((sum, t) => sum + t.targetJp, 0);
  const totalTerlaksanaDepartment = teacherStats.reduce((sum, t) => sum + t.terlaksana, 0);
  const departmentPersen =
    totalTargetDepartment > 0
      ? Math.min(100, Math.round((totalTerlaksanaDepartment / totalTargetDepartment) * 100))
      : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Kartu 1: Capaian Kumulatif Jurusan (Circular Ring) */}
      <div className="flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Capaian JP Jurusan
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-slime-lime-100 text-slime-lime-800">
              <Users className="size-4" aria-hidden />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-neutral-900">
                  {totalTerlaksanaDepartment}
                </span>
                <span className="text-sm font-bold text-neutral-500">
                  / {totalTargetDepartment} JP
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {teacherStats.length} Guru Produktif Terdaftar
              </p>
              <div className="mt-3">
                <Badge variant="brand" className="font-extrabold text-[11px]">
                  {departmentPersen}% Tuntas Terlaksana
                </Badge>
              </div>
            </div>

            <div className="shrink-0">
              <CircularProgress
                value={departmentPersen}
                size={96}
                strokeWidth={9}
                label={`${departmentPersen}%`}
                sublabel="Jurusan"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
          Target semester terbagi atas Kaprogli (96 JP) dan Guru Produktif (144 JP).
        </div>
      </div>

      {/* Kartu 2: Grafik Komparasi Beban JP Antar-Guru */}
      <div className="lg:col-span-2 flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Komparasi Ketercapaian JP Antar-Guru Produktif
              </h3>
              <p className="text-xs text-neutral-500">
                Pemantauan realisasi jam mengajar per pengampu kompetensi keahlian
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-neutral-700">
                <span className="size-2.5 rounded-sm bg-slime-lime-500" />
                Terlaksana
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="size-2.5 rounded-sm bg-neutral-200" />
                Target Sisa
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {teacherStats.map(({ guru, targetJp, terlaksana, persentase, sesiCount }) => (
              <div key={guru.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">{guru.nama}</span>
                    <Badge variant="default" className="text-[10px]">
                      {guru.role === "kaprogli" ? "Kaprogli" : "Guru"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-semibold">
                      {terlaksana} / {targetJp} JP ({sesiCount} Sesi)
                    </span>
                    <span className="font-black text-neutral-900 w-9 text-right">
                      {persentase}%
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-slime-lime-500 transition-all duration-500"
                    style={{ width: `${persentase}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <span>Supervisi berkala untuk memastikan pemenuhan jam kerja guru sertifikasi.</span>
        </div>
      </div>
    </div>
  );
}
