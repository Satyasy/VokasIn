"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Clock, Calendar, BookOpen, AlertCircle, ArrowRight, MessageSquare } from "lucide-react";
import type { JadwalPembelajaran, JpSummary } from "@/lib/types";
import { updateStatusJadwalAction } from "@/app/guru/jadwal/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuruJpChart } from "@/components/guru/guru-jp-chart";

interface GuruOverviewTabProps {
  jadwalList: JadwalPembelajaran[];
  jpSummary: JpSummary;
  onNavigateToJadwal: () => void;
  onNavigateToModul: () => void;
}

export function GuruOverviewTab({
  jadwalList,
  jpSummary,
  onNavigateToJadwal,
  onNavigateToModul,
}: GuruOverviewTabProps) {
  const [isPending, startTransition] = useTransition();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [refleksiText, setRefleksiText] = useState("");
  const [showRefleksiModal, setShowRefleksiModal] = useState(false);

  // Sesi terdekat yang terjadwal
  const sesiTerjadwal = jadwalList.filter((j) => j.status === "terjadwal");
  const sesiTerdekat = sesiTerjadwal[0];

  // Riwayat sesi terlaksana
  const sesiTerlaksanaList = jadwalList.filter((j) => j.status === "terlaksana").slice(-4).reverse();

  const handleUpdateStatus = (id: string, newStatus: "terlaksana" | "dijadwal_ulang") => {
    startTransition(async () => {
      await updateStatusJadwalAction(id, newStatus);
    });
  };

  const handleSimpanRefleksi = () => {
    if (!activeSessionId) return;
    startTransition(async () => {
      await updateStatusJadwalAction(activeSessionId, "terlaksana", refleksiText);
      setShowRefleksiModal(false);
      setActiveSessionId(null);
      setRefleksiText("");
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Visual Chart Capaian JP & Distribusi Mingguan */}
      <GuruJpChart jpSummary={jpSummary} jadwalList={jadwalList} />

      {/* Kartu Ringkasan Metrik Tambahan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metrik 1: Realisasi Target JP */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Realisasi Target JP
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-slime-lime-100 text-slime-lime-800">
              <Clock className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900">
              {jpSummary.jpTerlaksana}
            </span>
            <span className="text-sm font-semibold text-neutral-500">
              / {jpSummary.targetJpSemester} JP ({jpSummary.persentaseTerlaksana}%)
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-slime-lime-500 transition-all duration-500"
              style={{ width: `${Math.min(100, jpSummary.persentaseTerlaksana)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-medium text-neutral-500">
            Berdasarkan beban standar kurikulum SMK semester ini
          </p>
        </div>

        {/* Metrik 2: Sesi Pekan Ini */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Total Sesi Mengajar
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
              <Calendar className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900">
              {jpSummary.totalSesi}
            </span>
            <span className="text-sm font-semibold text-neutral-500">
              Sesi ({jpSummary.sesiTerlaksana} selesai)
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-neutral-600">
            {sesiTerjadwal.length} sesi menunggu pelaksanaan
          </p>
        </div>

        {/* Metrik 3: JP Terjadwal Mendatang */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Sesi Menunggu
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <AlertCircle className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900">
              {jpSummary.jpTerjadwal}
            </span>
            <span className="text-sm font-semibold text-neutral-500">
              JP Terjadwal
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-neutral-600">
            Tersusun pada kalender pembelajaran aktif
          </p>
        </div>

        {/* Metrik 4: Unit Kompetensi Terintegrasi */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Unit SKKNI Rujukan
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-slime-lime-100 text-slime-lime-800">
              <BookOpen className="size-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900">
              {new Set(jadwalList.map((j) => j.unitKompetensiId).filter(Boolean)).size}
            </span>
            <span className="text-sm font-semibold text-neutral-500">
              Unit Tertaut
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-neutral-600">
            Tersertifikasi standar kompetensi nasional
          </p>
        </div>
      </div>

      {/* Sesi Pembelajaran Aktif / Terdekat */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-slime-lime-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-slime-lime-800">
                Agenda Pembelajaran Terdekat
              </p>
            </div>
            <h2 className="mt-1 text-xl font-bold text-neutral-900">
              Tatap Muka Praktikum Minggu Ini
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateToJadwal}
            className="self-start text-xs font-bold"
          >
            Buka Kalender Lengkap
            <ArrowRight className="size-3.5 ml-1" aria-hidden />
          </Button>
        </div>

        {sesiTerdekat ? (
          <div className="mt-6 rounded-2xl border border-slime-lime-200 bg-slime-lime-50/40 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand" className="font-bold">
                  {sesiTerdekat.kelas}
                </Badge>
                <Badge variant="default" className="font-semibold">
                  Minggu ke-{sesiTerdekat.mingguKe}
                </Badge>
                <Badge variant="default" className="font-bold text-neutral-800">
                  {sesiTerdekat.alokasiJp} Jam Pelajaran (JP)
                </Badge>
              </div>
              <span className="text-xs font-semibold text-neutral-600">
                Tanggal: {sesiTerdekat.tanggal} &bull; {sesiTerdekat.jamMulai} - {sesiTerdekat.jamSelesai} WIB
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-extrabold text-neutral-900">
                {sesiTerdekat.judulMateri}
              </h3>
              {sesiTerdekat.kodeUnit && (
                <p className="mt-1 text-xs font-medium text-neutral-600">
                  Unit SKKNI: <span className="font-bold text-neutral-900">{sesiTerdekat.kodeUnit}</span>
                  {sesiTerdekat.judulUnit ? ` : ${sesiTerdekat.judulUnit}` : ""}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-200/80 pt-4">
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setActiveSessionId(sesiTerdekat.id);
                  setRefleksiText(sesiTerdekat.catatanRefleksi || "");
                  setShowRefleksiModal(true);
                }}
                className="bg-slime-lime-600 font-bold text-neutral-950 hover:bg-slime-lime-500"
              >
                <CheckCircle2 className="size-4 mr-1.5" aria-hidden />
                Tandai Terlaksana &amp; Tulis Refleksi
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => handleUpdateStatus(sesiTerdekat.id, "dijadwal_ulang")}
                className="text-xs font-semibold"
              >
                Jadwal Ulang Sesi
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
            <CheckCircle2 className="mx-auto size-8 text-slime-lime-600" aria-hidden />
            <p className="mt-2 text-sm font-bold text-neutral-900">
              Seluruh sesi pembelajaran telah terlaksana!
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Anda dapat menambahkan jadwal baru melalui tab Jadwal &amp; Alokasi JP.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={onNavigateToJadwal}
              className="mt-4 text-xs font-bold"
            >
              Atur Jadwal Baru
            </Button>
          </div>
        )}
      </div>

      {/* Riwayat Sesi Terlaksana & Catatan Refleksi */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <h2 className="text-base font-bold text-neutral-900">
            Catatan Refleksi &amp; Keterlaksanaan Pembelajaran
          </h2>
          <span className="text-xs font-semibold text-neutral-500">
            {sesiTerlaksanaList.length} sesi terakhir
          </span>
        </div>

        {sesiTerlaksanaList.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            Belum ada catatan sesi pembelajaran yang diselesaikan.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-neutral-100">
            {sesiTerlaksanaList.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">{item.kelas}</span>
                    <span className="text-xs text-neutral-500">&bull; Minggu ke-{item.mingguKe}</span>
                    <Badge variant="brand" className="text-[11px]">
                      {item.alokasiJp} JP
                    </Badge>
                  </div>
                  <span className="text-xs font-medium text-neutral-500">{item.tanggal}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-neutral-800">
                  {item.judulMateri}
                </p>
                {item.catatanRefleksi ? (
                  <div className="mt-2 flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-700">
                    <MessageSquare className="size-3.5 shrink-0 mt-0.5 text-neutral-500" aria-hidden />
                    <span>{item.catatanRefleksi}</span>
                  </div>
                ) : (
                  <p className="mt-1 text-xs italic text-neutral-400">
                    Belum ada catatan refleksi untuk sesi ini.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Refleksi Guru */}
      {showRefleksiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-lg font-extrabold text-neutral-900">
              Konfirmasi Selesai &amp; Catatan Praktikum
            </h3>
            <p className="mt-1 text-xs text-neutral-600">
              Tuliskan kendala alat lab, penguasaan siswa, atau tindak lanjut materi untuk pertemuan selanjutnya.
            </p>

            <textarea
              rows={4}
              value={refleksiText}
              onChange={(e) => setRefleksiText(e.target.value)}
              placeholder="Mis. Seluruh siswa tuntas mengkonfigurasi IP address dan gateway. Sesi berikutnya lanjut routing BGP."
              className="mt-4 w-full rounded-xl border border-neutral-300 p-3 text-sm text-neutral-900 focus:border-slime-lime-600 focus:outline-none focus:ring-2 focus:ring-slime-lime-500/30"
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setShowRefleksiModal(false);
                  setActiveSessionId(null);
                }}
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={handleSimpanRefleksi}
                className="bg-slime-lime-600 font-bold text-neutral-950 hover:bg-slime-lime-500"
              >
                {isPending ? "Menyimpan…" : "Simpan & Selesaikan Sesi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
