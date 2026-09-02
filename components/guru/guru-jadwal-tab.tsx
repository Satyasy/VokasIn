"use client";

import { useState, useTransition, useActionState } from "react";
import { Plus, Calendar, Clock, BookOpen, CheckCircle2, AlertCircle, XCircle, Filter, X } from "lucide-react";
import type { JadwalPembelajaran, JpSummary, StatusJadwal, UnitKompetensi } from "@/lib/types";
import { createJadwalAction, updateStatusJadwalAction } from "@/app/guru/jadwal/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginatedList } from "@/components/ui/pagination";

interface GuruJadwalTabProps {
  jadwalList: JadwalPembelajaran[];
  jpSummary: JpSummary;
  availableUnits: UnitKompetensi[];
  programKeahlianId: string;
}

export function GuruJadwalTab({
  jadwalList,
  jpSummary,
  availableUnits,
  programKeahlianId,
}: GuruJadwalTabProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterKelas, setFilterKelas] = useState("all");
  const [viewMode, setViewMode] = useState<"semua" | "mingguan" | "bulanan">("semua");

  const [formState, formAction, formPending] = useActionState(createJadwalAction, undefined);

  // Close modal when successfully created
  if (formState?.success && showAddModal) {
    setShowAddModal(false);
  }

  // Get distinct classes for filter
  const distinctKelas = Array.from(new Set(jadwalList.map((j) => j.kelas))).sort();

  // Filter jadwal
  const filteredJadwal = jadwalList.filter((item) => {
    if (filterKelas !== "all" && item.kelas !== filterKelas) return false;
    if (viewMode === "mingguan") {
      // Filter sesi minggu ke-5 atau 6 (contoh minggu aktif saat ini)
      return item.mingguKe >= 5 && item.mingguKe <= 6;
    }
    return true;
  });

  const handleUpdateStatus = (id: string, status: StatusJadwal) => {
    startTransition(async () => {
      await updateStatusJadwalAction(id, status);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Kontrol & Progress Bar JP */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Alokasi Jam Pelajaran &amp; Jadwal Mengajar
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Atur dan pantau target tatap muka praktikum kejuruan berdasarkan unit kompetensi SKKNI resmi.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="self-start rounded-xl bg-slime-lime-600 font-bold text-neutral-950 hover:bg-slime-lime-500 active:scale-95"
          >
            <Plus className="size-4 mr-1.5" aria-hidden />
            Tambah Sesi Tatap Muka
          </Button>
        </div>

        {/* Progress Bar Akumulasi JP */}
        <div className="mt-6 rounded-2xl bg-neutral-50 p-5 border border-neutral-200/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Ketercapaian Beban Mengajar Semester
              </span>
              <p className="mt-1 text-2xl font-black text-neutral-900">
                {jpSummary.jpTerlaksana}{" "}
                <span className="text-sm font-semibold text-neutral-500">
                  / {jpSummary.targetJpSemester} JP ({jpSummary.persentaseTerlaksana}%)
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-neutral-500">
                Sisa Target: {Math.max(0, jpSummary.targetJpSemester - jpSummary.jpTerlaksana)} JP
              </span>
              <p className="text-xs font-bold text-slime-lime-800">
                {jpSummary.jpTerjadwal} JP telah terjadwal di kalender
              </p>
            </div>
          </div>

          <div className="mt-3.5 h-3 w-full overflow-hidden rounded-full bg-neutral-200/80">
            <div
              className="h-full rounded-full bg-slime-lime-500 transition-all duration-500"
              style={{ width: `${Math.min(100, jpSummary.persentaseTerlaksana)}%` }}
            />
          </div>
        </div>

        {/* Toolbar Filter & View Switcher */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* View Mode Buttons */}
          <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode("semua")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "semua"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Semua Pertemuan ({jadwalList.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mingguan")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "mingguan"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Minggu Aktif (Pekan Ini)
            </button>
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-neutral-500" aria-hidden />
            <span className="text-xs font-semibold text-neutral-600">Filter Kelas:</span>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-800 focus:border-slime-lime-600 focus:outline-none"
            >
              <option value="all">Semua Kelas ({distinctKelas.length})</option>
              {distinctKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Daftar Sesi Pertemuan dengan Paginasi 10 Kartu & Search Bar */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <PaginatedList<JadwalPembelajaran>
          items={filteredJadwal}
          itemsPerPage={10}
          searchPlaceholder="Cari berdasarkan judul materi, kelas (mis. XII TKJ 1), atau kode unit SKKNI..."
          searchFilter={(item, q) =>
            item.judulMateri.toLowerCase().includes(q) ||
            item.kelas.toLowerCase().includes(q) ||
            Boolean(item.kodeUnit?.toLowerCase().includes(q)) ||
            Boolean(item.judulUnit?.toLowerCase().includes(q)) ||
            Boolean(item.catatanRefleksi?.toLowerCase().includes(q))
          }
          emptyState={
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center">
              <Calendar className="mx-auto size-10 text-neutral-400" aria-hidden />
              <p className="mt-3 text-sm font-bold text-neutral-900">
                Tidak ada sesi jadwal yang cocok dengan filter atau pencarian.
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Coba sesuaikan kata kunci pencarian atau tambahkan sesi mengajar baru.
              </p>
            </div>
          }
          renderItem={(item) => {
            const isTerlaksana = item.status === "terlaksana";
            const isDijadwalUlang = item.status === "dijadwal_ulang";

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all sm:flex-row sm:items-center ${
                  isTerlaksana
                    ? "border-neutral-200 bg-white shadow-sm"
                    : isDijadwalUlang
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-slime-lime-300 bg-slime-lime-50/20 shadow-sm"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isTerlaksana ? "success" : isDijadwalUlang ? "warning" : "brand"}>
                      {item.status === "terlaksana"
                        ? "Terlaksana"
                        : item.status === "dijadwal_ulang"
                        ? "Dijadwal Ulang"
                        : "Terjadwal"}
                    </Badge>
                    <Badge variant="default" className="font-bold">
                      {item.kelas}
                    </Badge>
                    <span className="text-xs font-semibold text-neutral-500">
                      Minggu ke-{item.mingguKe} &bull; {item.tanggal} ({item.jamMulai} - {item.jamSelesai} WIB)
                    </span>
                    <Badge variant="default" className="font-extrabold text-neutral-900">
                      {item.alokasiJp} JP
                    </Badge>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-neutral-900">
                    {item.judulMateri}
                  </h3>

                  {item.kodeUnit && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-600">
                      <BookOpen className="size-3.5 text-slime-lime-700 shrink-0" aria-hidden />
                      <span className="font-bold text-neutral-900">{item.kodeUnit}</span>
                      {item.judulUnit && <span className="truncate">: {item.judulUnit}</span>}
                    </div>
                  )}

                  {item.catatanRefleksi && (
                    <p className="mt-2.5 rounded-lg bg-neutral-100 p-2.5 text-xs text-neutral-700 leading-relaxed italic">
                      Catatan guru: &ldquo;{item.catatanRefleksi}&rdquo;
                    </p>
                  )}
                </div>

                {/* Tombol Aksi Cepat */}
                <div className="flex shrink-0 items-center gap-2 border-t border-neutral-200/60 pt-3 sm:border-t-0 sm:pt-0">
                  {item.status !== "terlaksana" ? (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(item.id, "terlaksana")}
                      className="bg-slime-lime-600 text-xs font-bold text-neutral-950 hover:bg-slime-lime-500"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" aria-hidden />
                      Tandai Selesai
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(item.id, "terjadwal")}
                      className="text-xs text-neutral-600"
                    >
                      Buka Kembali Sesi
                    </Button>
                  )}

                  {item.status !== "dijadwal_ulang" && item.status !== "terlaksana" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(item.id, "dijadwal_ulang")}
                      className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-amber-700"
                      title="Tandai Dijadwal Ulang"
                    >
                      <AlertCircle className="size-4" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Modal Dialog Tambah Sesi Pembelajaran Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900">
                  Tambah Sesi Pembelajaran &amp; Alokasi JP
                </h3>
                <p className="text-xs text-neutral-600">
                  Jadwalkan pertemuan kelas dan tautkan dengan unit SKKNI rujukan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input type="hidden" name="programKeahlianId" value={programKeahlianId} />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Judul Materi Pembelajaran *
                </label>
                <input
                  name="judulMateri"
                  required
                  placeholder="Mis. Praktik Konfigurasi Routing OSPF Multi-Area"
                  className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Kelas Sasaran *
                  </label>
                  <input
                    name="kelas"
                    required
                    placeholder="Mis. XII TKJ 1"
                    className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Minggu ke- *
                  </label>
                  <input
                    name="mingguKe"
                    type="number"
                    min={1}
                    max={24}
                    defaultValue={6}
                    required
                    className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Tanggal *
                  </label>
                  <input
                    name="tanggal"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Jam Mulai *
                  </label>
                  <input
                    name="jamMulai"
                    type="time"
                    required
                    defaultValue="07:30"
                    className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Jam Selesai *
                  </label>
                  <input
                    name="jamSelesai"
                    type="time"
                    required
                    defaultValue="11:30"
                    className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-sm text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Alokasi Jam Pelajaran (JP) *
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    name="alokasiJp"
                    type="number"
                    min={1}
                    max={12}
                    defaultValue={5}
                    required
                    className="w-28 rounded-xl border border-neutral-300 p-2.5 text-sm font-bold text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                  />
                  <span className="text-xs text-neutral-500">
                    JP (1 JP praktikum kejuruan = 45 menit)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Unit Kompetensi SKKNI Rujukan
                </label>
                <select
                  name="unitKompetensiId"
                  className="mt-1 w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-slime-lime-600 focus:outline-none"
                >
                  <option value="">(Opsional: Pilih Unit SKKNI)</option>
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.kodeUnit} : {u.judulUnit}
                    </option>
                  ))}
                </select>
              </div>

              {formState?.error && (
                <p className="text-xs font-bold text-red-600">{formState.error}</p>
              )}

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={formPending}
                  className="bg-slime-lime-600 font-bold text-neutral-950 hover:bg-slime-lime-500"
                >
                  {formPending ? "Menyimpan…" : "Simpan Sesi Jadwal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
