"use client";

import { useState } from "react";
import { Users, Clock, Calendar, BookOpen, Filter } from "lucide-react";
import type { Guru, JadwalPembelajaran } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface GuruJpBreakdown {
  guru: Guru;
  targetJp: number;
  jpTerlaksana: number;
  jpTerjadwal: number;
  persentase: number;
  sesiCount: number;
}

interface KaprogliSupervisiTabProps {
  guruList: Guru[];
  jadwalList: JadwalPembelajaran[];
  currentKaprogliProgramId: string;
}

export function KaprogliSupervisiTab({
  guruList,
  jadwalList,
  currentKaprogliProgramId,
}: KaprogliSupervisiTabProps) {
  const [filterGuruId, setFilterGuruId] = useState("all");

  // Hitung agregat beban JP per guru di jurusan ini
  const programGuruList = guruList.filter(
    (g) => g.programKeahlianId === currentKaprogliProgramId || currentKaprogliProgramId === "all"
  );

  const breakdownList: GuruJpBreakdown[] = programGuruList.map((g) => {
    const guruJadwal = jadwalList.filter((j) => j.guruId === g.id);
    const targetJp = g.role === "kaprogli" ? 96 : 144;
    let jpTerlaksana = 0;
    let jpTerjadwal = 0;

    for (const j of guruJadwal) {
      if (j.status === "terlaksana") {
        jpTerlaksana += j.alokasiJp;
      } else if (j.status === "terjadwal") {
        jpTerjadwal += j.alokasiJp;
      }
    }

    const persentase = Math.min(100, Math.round((jpTerlaksana / targetJp) * 100));

    return {
      guru: g,
      targetJp,
      jpTerlaksana,
      jpTerjadwal,
      persentase,
      sesiCount: guruJadwal.length,
    };
  });

  // Filter jadwal sesuai guru yang dipilih
  const filteredJadwal = jadwalList.filter((j) => {
    if (filterGuruId !== "all" && j.guruId !== filterGuruId) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Rekapitulasi Tabel Ketercapaian JP Guru */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-2 border-b border-neutral-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Rekapitulasi Ketercapaian Beban Mengajar (JP)
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Pemantauan beban jam pelajaran semesteran guru produktif di bawah program keahlian Anda.
            </p>
          </div>
          <Badge variant="brand" className="self-start text-xs font-bold">
            Semester Ganjil 2026/2027
          </Badge>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-800">
            <thead>
              <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <th className="pb-3 pl-1">Nama Guru</th>
                <th className="pb-3">Peran</th>
                <th className="pb-3 text-center">Beban Smt</th>
                <th className="pb-3 text-center">Realisasi JP</th>
                <th className="pb-3 text-center">Sesi</th>
                <th className="pb-3 pr-1">Progres Ketercapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {breakdownList.map(({ guru, targetJp, jpTerlaksana, persentase, sesiCount }) => (
                <tr key={guru.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-4 pl-1 font-bold text-neutral-900">
                    {guru.nama}
                  </td>
                  <td className="py-4">
                    <Badge variant={guru.role === "kaprogli" ? "brand" : "default"}>
                      {guru.role === "kaprogli" ? "Kaprogli" : "Guru Produktif"}
                    </Badge>
                  </td>
                  <td className="py-4 text-center font-semibold text-neutral-600">
                    {targetJp} JP
                  </td>
                  <td className="py-4 text-center">
                    <span className="font-extrabold text-neutral-900">{jpTerlaksana}</span>
                    <span className="text-xs text-neutral-500"> / {targetJp} JP</span>
                  </td>
                  <td className="py-4 text-center font-bold text-neutral-700">
                    {sesiCount} Sesi
                  </td>
                  <td className="py-4 pr-1 min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-slime-lime-500 transition-all duration-500"
                          style={{ width: `${persentase}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-neutral-900 w-10 text-right">
                        {persentase}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitoring Master Jadwal Praktikum Lab */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Master Jadwal &amp; Penggunaan Lab
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Daftar sesi tatap muka bengkel/lab untuk memastikan fasilitas dan inventaris alat tidak bentrok.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-neutral-500" aria-hidden />
            <span className="text-xs font-semibold text-neutral-600">Filter Guru:</span>
            <select
              value={filterGuruId}
              onChange={(e) => setFilterGuruId(e.target.value)}
              className="h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-800 focus:border-slime-lime-600 focus:outline-none"
            >
              <option value="all">Seluruh Guru ({programGuruList.length})</option>
              {programGuruList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filteredJadwal.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Tidak ada sesi jadwal pada filter ini.
            </p>
          ) : (
            filteredJadwal.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 transition-all sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.status === "terlaksana" ? "success" : "brand"}>
                      {item.status === "terlaksana" ? "Terlaksana" : "Terjadwal"}
                    </Badge>
                    <span className="font-bold text-neutral-900">{item.kelas}</span>
                    <span className="text-xs text-neutral-500">&bull; Pengampu: {item.namaGuru}</span>
                    <Badge variant="default" className="font-extrabold text-neutral-800">
                      {item.alokasiJp} JP
                    </Badge>
                  </div>
                  <h4 className="mt-1.5 text-sm font-bold text-neutral-900">
                    {item.judulMateri}
                  </h4>
                  {item.kodeUnit && (
                    <p className="mt-1 text-xs text-neutral-600">
                      Unit SKKNI: <span className="font-semibold text-neutral-900">{item.kodeUnit}</span>
                    </p>
                  )}
                </div>

                <div className="text-right text-xs font-medium text-neutral-500 sm:self-center">
                  <p>{item.tanggal}</p>
                  <p className="font-semibold text-neutral-800">{item.jamMulai} - {item.jamSelesai} WIB</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
