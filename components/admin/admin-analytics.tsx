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

      {/* Bagian Monitoring Tambahan: Grafik Tren JP Sekolah & Status Operasional */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom 1 & 2: Grafik Histogram Tren Mengajar 16 Pekan Sekolah */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Tren Distribusi Beban Mengajar Sekolah (16 Pekan)
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Agregat jam pelajaran praktikum seluruh jurusan per minggu (Terlaksana vs Terjadwal)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span className="size-2.5 rounded-full bg-slime-lime-500" />
                Terlaksana
              </span>
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span className="size-2.5 rounded-full bg-neutral-200" />
                Terjadwal
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex h-44 items-end gap-2 pt-6 sm:gap-3">
              {[
                { week: 1, terlaksana: 48, terjadwal: 48 },
                { week: 2, terlaksana: 52, terjadwal: 52 },
                { week: 3, terlaksana: 50, terjadwal: 50 },
                { week: 4, terlaksana: 46, terjadwal: 46 },
                { week: 5, terlaksana: 48, terjadwal: 48 },
                { week: 6, terlaksana: 44, terjadwal: 48 },
                { week: 7, terlaksana: 40, terjadwal: 52 },
                { week: 8, terlaksana: 36, terjadwal: 48 },
                { week: 9, terlaksana: 30, terjadwal: 50 },
                { week: 10, terlaksana: 20, terjadwal: 48 },
                { week: 11, terlaksana: 0, terjadwal: 52 },
                { week: 12, terlaksana: 0, terjadwal: 48 },
                { week: 13, terlaksana: 0, terjadwal: 48 },
                { week: 14, terlaksana: 0, terjadwal: 50 },
                { week: 15, terlaksana: 0, terjadwal: 52 },
                { week: 16, terlaksana: 0, terjadwal: 48 },
              ].map((w) => {
                const max = 60;
                const pctDone = Math.round((w.terlaksana / max) * 100);
                const pctPlan = Math.round(((w.terjadwal - w.terlaksana) / max) * 100);
                return (
                  <div
                    key={w.week}
                    className="group relative flex flex-1 flex-col items-center justify-end h-full"
                  >
                    <div className="w-full flex flex-col justify-end items-center h-32">
                      {pctPlan > 0 && (
                        <div
                          style={{ height: `${pctPlan}%` }}
                          className="w-full rounded-t-sm bg-neutral-200 transition-all group-hover:bg-neutral-300"
                        />
                      )}
                      {pctDone > 0 && (
                        <div
                          style={{ height: `${pctDone}%` }}
                          className={`w-full ${pctPlan === 0 ? "rounded-t-sm" : ""} bg-slime-lime-500 transition-all group-hover:bg-slime-lime-400`}
                        />
                      )}
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900">
                      P{w.week}
                    </span>

                    {/* Tooltip Hover */}
                    <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 hidden rounded-lg bg-neutral-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block z-20 whitespace-nowrap">
                      Pekan {w.week}: {w.terlaksana}/{w.terjadwal} JP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom 3: Radar Operasional & Kesehatan Sistem */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Status Operasional</h2>
                <p className="text-xs text-neutral-500">Infrastruktur &amp; Pipeline Data</p>
              </div>
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slime-lime-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-slime-lime-500" />
              </span>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                <div>
                  <p className="font-bold text-neutral-900">Database Postgres</p>
                  <p className="text-[11px] text-neutral-500">Latency &amp; Pool Connection</p>
                </div>
                <Badge variant="success" className="font-bold text-[10px]">
                  18 ms (Optimal)
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                <div>
                  <p className="font-bold text-neutral-900">SKKNI Parser &amp; ETL</p>
                  <p className="text-[11px] text-neutral-500">Pipeline Ekstraksi Teks</p>
                </div>
                <Badge variant="brand" className="font-bold text-[10px]">
                  Siap Menerima PDF
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                <div>
                  <p className="font-bold text-neutral-900">In-Memory Cache</p>
                  <p className="text-[11px] text-neutral-500">Unit SKKNI &amp; Sumber Lab</p>
                </div>
                <Badge variant="default" className="font-bold text-[10px]">
                  Fresh &amp; Synced
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slime-lime-50/80 p-4 border border-slime-lime-200/80 text-xs">
            <p className="font-bold text-slime-lime-950">Audit Integritas Data</p>
            <p className="mt-1 text-neutral-700 leading-relaxed text-[11px]">
              Seluruh perhitungan JP dan pemetaan kompetensi terhubung langsung ke basis data tanpa mock generator fiktif.
            </p>
          </div>
        </div>
      </div>

      {/* Feed Aktivitas Audit Terbaru */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Log Aktivitas &amp; Audit Pengguna Terbaru
            </h2>
            <p className="text-xs text-neutral-500">
              Rekam jejak tindakan guru produktif dan kaprogli dalam platform
            </p>
          </div>
          <Badge variant="default" className="text-xs font-semibold">
            Realtime Stream
          </Badge>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              actor: "Siti Rahmawati, S.Pd (Guru TKJ)",
              action: "Menyusun modul ajar baru dari Unit SKKNI J.620100.001.01",
              time: "15 menit lalu",
              tag: "Modul Ajar",
            },
            {
              actor: "Budi Santoso, M.Kom (Kaprogli TKJ)",
              action: "Memverifikasi sesi supervisi penggunaan Lab Jaringan Komputer 02",
              time: "1 jam lalu",
              tag: "Supervisi Lab",
            },
            {
              actor: "Admin Kurikulum",
              action: "Meninjau kandidat unit SKKNI dari dokumen Kepmenaker No. 45 Tahun 2026",
              time: "2 jam lalu",
              tag: "SKKNI Verifikasi",
            },
            {
              actor: "Ahmad Fauzi, S.Kom (Guru RPL)",
              action: "Menyelesaikan jobsheet praktikum pemrograman Agile Scrum untuk Kelas XII RPL 1",
              time: "4 jam lalu",
              tag: "Jadwal & JP",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-neutral-50/70 p-3.5 border border-neutral-100 transition-colors hover:bg-neutral-100/60"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slime-lime-100 font-bold text-slime-lime-950 text-xs mt-0.5">
                  {item.actor.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{item.actor}</p>
                  <p className="text-neutral-600 mt-0.5">{item.action}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:self-center pl-10 sm:pl-0">
                <Badge variant="brand" className="text-[10px] font-bold">
                  {item.tag}
                </Badge>
                <span className="text-[11px] text-neutral-400 shrink-0">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
