"use client";

import { FileText, CheckCircle2, Users, Calendar, Award, ShieldCheck, Wrench, BarChart3 } from "lucide-react";
import type { AdminAnalyticsData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface AdminAnalyticsProps {
  analytics: AdminAnalyticsData;
}

export function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  const topStats = [
    {
      label: "Dokumen SKKNI Resmi",
      value: analytics.totalDokumen,
      sub: "Katalog standar nasional",
      icon: FileText,
    },
    {
      label: "Unit Terverifikasi",
      value: analytics.unitTerverifikasi,
      sub: `${analytics.kandidatMenunggu} kandidat menunggu tinjau`,
      icon: CheckCircle2,
    },
    {
      label: "Guru & Kaprogli Aktif",
      value: analytics.totalPengguna,
      sub: "Akun sekolah terdaftar",
      icon: Users,
    },
    {
      label: "Total Sesi Mengajar",
      value: analytics.totalSesiJadwal,
      sub: `${analytics.totalJpTerlaksana} JP terlaksana`,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Kartu Metrik Makro */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topStats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {label}
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-slime-lime-800">
                <Icon className="size-4" aria-hidden />
              </div>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-neutral-900">{value}</p>
            <p className="mt-1 text-xs text-neutral-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Grid Grafik Analitik Riil */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grafik 1: Ketercakupan Modul SKKNI per Program Keahlian */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Ketercakupan Unit SKKNI ke Perangkat Ajar
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Persentase unit kompetensi resmi yang telah masuk ke modul ajar nyata
              </p>
            </div>
            <Award className="size-5 text-slime-lime-700 shrink-0" aria-hidden />
          </div>

          <div className="mt-6 space-y-5">
            {analytics.programMetrics.map((prog) => (
              <div key={prog.programId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-neutral-800">
                    {prog.programNama} ({prog.programSingkatan})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">
                      {prog.unitTerajarkan} / {prog.totalUnitSkkni} Unit
                    </span>
                    <Badge variant="brand" className="font-extrabold">
                      {prog.persentaseModul}%
                    </Badge>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-slime-lime-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, prog.persentaseModul)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600 leading-relaxed">
            Data dihitung berdasarkan rujukan unit kompetensi resmi SKKNI yang telah ditautkan pada modul ajar dan agenda kelas aktif.
          </p>
        </div>

        {/* Grafik 2: Realisasi Jam Pelajaran (JP) Sekolah */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Realisasi Jam Pelajaran (JP) Semester
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Akumulasi jam tatap muka praktikum yang telah terlaksana vs target kurikulum
              </p>
            </div>
            <BarChart3 className="size-5 text-slime-lime-700 shrink-0" aria-hidden />
          </div>

          <div className="mt-6 space-y-5">
            {analytics.programMetrics.map((prog) => (
              <div key={prog.programId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-neutral-800">
                    {prog.programSingkatan} - Target {prog.targetJpSemester} JP
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500">
                      {prog.jpTerlaksana} JP Terlaksana
                    </span>
                    <span className="text-xs font-black text-neutral-900">
                      {prog.persentaseJp}%
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-slime-lime-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, prog.persentaseJp)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5">
            <span className="text-xs font-bold text-neutral-700">Rata-rata Sekolah:</span>
            <span className="text-sm font-extrabold text-neutral-900">
              {analytics.totalJpTerlaksana} / {analytics.totalTargetJp} JP ({analytics.overallJpPersen}%)
            </span>
          </div>
        </div>

        {/* Grafik 3: Kesiapan Alat Lab & Praktikum */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Kesiapan Fasilitas Lab Kejuruan
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Kelayakan alat praktik sekolah terhadap kebutuhan modul SKKNI
              </p>
            </div>
            <Wrench className="size-5 text-slime-lime-700 shrink-0" aria-hidden />
          </div>

          <div className="mt-6 space-y-4">
            {analytics.programMetrics.map((prog) => (
              <div key={prog.programId} className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
                <div>
                  <h4 className="font-bold text-neutral-900">{prog.programNama}</h4>
                  <p className="text-xs text-neutral-500">Kesiapan alat praktikum bengkel</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-neutral-900">
                    {prog.labKesiapanPersen}%
                  </span>
                  <p className="text-[11px] font-semibold text-slime-lime-800">
                    {prog.labKesiapanPersen >= 80 ? "Memadai" : "Perlu Tambahan"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grafik 4: Kualitas Validasi Human-in-the-Loop (HITL) */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Validasi Kurikulum Human-in-the-Loop (HITL)
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Tingkat konfirmasi eksplisit guru terhadap kartu saran sistem
              </p>
            </div>
            <ShieldCheck className="size-5 text-slime-lime-700 shrink-0" aria-hidden />
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Tingkat Penerimaan Saran
              </span>
              <span className="text-2xl font-black text-neutral-900">
                {analytics.hitlMetrics.persenTerima}%
              </span>
            </div>

            {/* Segmented multi-color bar */}
            <div className="mt-3 flex h-3.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                title={`Diterima: ${analytics.hitlMetrics.terima}`}
                className="h-full bg-slime-lime-500"
                style={{
                  width: `${(analytics.hitlMetrics.terima / analytics.hitlMetrics.total) * 100}%`,
                }}
              />
              <div
                title={`Dimodifikasi: ${analytics.hitlMetrics.modifikasi}`}
                className="h-full bg-amber-400"
                style={{
                  width: `${(analytics.hitlMetrics.modifikasi / analytics.hitlMetrics.total) * 100}%`,
                }}
              />
              <div
                title={`Ditolak: ${analytics.hitlMetrics.tolak}`}
                className="h-full bg-red-400"
                style={{
                  width: `${(analytics.hitlMetrics.tolak / analytics.hitlMetrics.total) * 100}%`,
                }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5">
                <p className="text-[11px] font-semibold text-neutral-500">Diterima</p>
                <p className="text-sm font-extrabold text-neutral-900">{analytics.hitlMetrics.terima}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5">
                <p className="text-[11px] font-semibold text-neutral-500">Dimodifikasi</p>
                <p className="text-sm font-extrabold text-neutral-900">{analytics.hitlMetrics.modifikasi}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5">
                <p className="text-[11px] font-semibold text-neutral-500">Ditolak</p>
                <p className="text-sm font-extrabold text-neutral-900">{analytics.hitlMetrics.tolak}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-neutral-500 leading-relaxed italic">
              Bukti akuntabilitas bahwa setiap butir kompetensi wajib dikonfirmasi guru dan tidak ada keputusan otomatis oleh sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
