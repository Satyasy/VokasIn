"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { uploadSkkniMandiriAction, type UploadSkkniMandiriResponse } from "@/app/guru/upload-skkni-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const SAMPLE_CUSTOM_SKKNI = {
  nomor: "Kepmenaker No. 120 Tahun 2026",
  kode: "J.620100.012.01",
  judul: "Mengonfigurasi Kontainer Docker dan Klaster Kubernetes",
  programId: "pk-tkj",
  elemen: `1. Mempersiapkan Lingkungan Kontainerisasi
1.1 Docker engine dipasang dan dikonfigurasi pada server Linux
1.2 Dockerfile disusun sesuai arsitektur layanan mikro
2. Mengelola Orkestrasi dan Layanan Kubernetes
2.1 Manifes deployment dan service YAML disusun secara presisi
2.2 Pengujian aksesibilitas cluster dilakukan melalui perintah kubectl`,
};

export function UploadSkkniModal({ defaultProgramId = "pk-tkj" }: { defaultProgramId?: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<UploadSkkniMandiriResponse | null, FormData>(
    uploadSkkniMandiriAction,
    null
  );

  const [nomor, setNomor] = useState("");
  const [kode, setKode] = useState("");
  const [judul, setJudul] = useState("");
  const [programId, setProgramId] = useState(defaultProgramId);
  const [elemen, setElemen] = useState("");

  function fillSample() {
    setNomor(SAMPLE_CUSTOM_SKKNI.nomor);
    setKode(SAMPLE_CUSTOM_SKKNI.kode);
    setJudul(SAMPLE_CUSTOM_SKKNI.judul);
    setProgramId(SAMPLE_CUSTOM_SKKNI.programId);
    setElemen(SAMPLE_CUSTOM_SKKNI.elemen);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border-slime-lime-300 bg-slime-lime-50 text-slime-lime-950 hover:bg-slime-lime-100 font-bold text-xs"
      >
        <UploadCloud className="size-4 text-slime-lime-800" aria-hidden />
        <span>Unggah / Tambah SKKNI Mandiri</span>
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto"
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="brand" className="font-extrabold text-xs">
                    ETL Pipeline Mandiri
                  </Badge>
                  <span className="text-xs text-neutral-500 font-medium">
                    Dual-Tier Verification
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-neutral-900 leading-snug">
                  Unggah &amp; Ekstraksi Unit SKKNI Mandiri
                </h3>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                  Masukkan unit kompetensi atau kurikulum industri khusus. Unit langsung dapat Anda gunakan untuk modul ajar pribadi dan otomatis diajukan ke antrean verifikasi Kaprogli.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Sukses Banner */}
            {state?.success ? (
              <div className="mt-6 rounded-2xl border border-slime-lime-300 bg-slime-lime-50 p-6 text-center space-y-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slime-lime-500 text-neutral-950 shadow-sm">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-900">
                    Unit SKKNI Berhasil Diproses!
                  </h4>
                  <p className="mt-1 text-xs text-neutral-700 leading-relaxed max-w-md mx-auto">
                    Unit <strong className="text-neutral-900">{state.kodeUnit} - {state.judulUnit}</strong> telah terindeks dengan {state.totalElemen} elemen kompetensi. Anda dapat langsung menyusun modul ajar sekarang.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button variant="secondary" size="sm" onClick={handleClose}>
                    Selesai
                  </Button>
                  <Link href={`/guru/susun/${state.unitId}`} onClick={handleClose}>
                    <Button size="sm" className="bg-slime-lime-500 text-neutral-950 font-bold hover:bg-slime-lime-400">
                      <BookOpen className="size-3.5 mr-1.5" />
                      Langsung Susun Modul Ajar
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form action={formAction} className="mt-6 space-y-4">
                {/* Auto Fill Sample Button */}
                <div className="flex items-center justify-between rounded-xl border border-slime-lime-200 bg-slime-lime-50/70 px-4 py-2.5">
                  <span className="text-xs font-semibold text-slime-lime-950 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-slime-lime-700" />
                    Ingin coba cepat tanpa salin dokumen?
                  </span>
                  <button
                    type="button"
                    onClick={fillSample}
                    className="text-xs font-bold text-slime-lime-900 underline hover:text-slime-lime-700"
                  >
                    Gunakan Contoh Unit
                  </button>
                </div>

                {state?.error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                    {state.error}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Nomor Dokumen SKKNI / Rujukan"
                    name="nomorDokumen"
                    placeholder="mis. Kepmenaker No. 120 Tahun 2026"
                    value={nomor}
                    onChange={(e) => setNomor(e.target.value)}
                    required
                    disabled={pending}
                  />

                  <div>
                    <label className="mb-1 block text-xs font-bold text-neutral-700">
                      Program Keahlian
                    </label>
                    <select
                      name="programKeahlianId"
                      value={programId}
                      onChange={(e) => setProgramId(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 shadow-xs focus:border-slime-lime-500 focus:outline-none"
                    >
                      <option value="pk-tkj">Teknik Komputer &amp; Jaringan (TKJ)</option>
                      <option value="pk-rpl">Rekayasa Perangkat Lunak (RPL)</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <Input
                      label="Kode Unit"
                      name="kodeUnit"
                      placeholder="J.620100.012.01"
                      value={kode}
                      onChange={(e) => setKode(e.target.value)}
                      required
                      disabled={pending}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Judul Unit Kompetensi"
                      name="judulUnit"
                      placeholder="Mengonfigurasi Kontainer Docker..."
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      required
                      disabled={pending}
                    />
                  </div>
                </div>

                <Textarea
                  label="Elemen Kompetensi & Kriteria Unjuk Kerja (KUK)"
                  name="elemenRawText"
                  placeholder={`1. Menyiapkan Peralatan Kerja\n1.1 Prosedur keselamatan kerja dipatuhi\n1.2 Alat konfigurasi dihubungkan ke jaringan\n2. Melakukan Konfigurasi Teknis\n2.1 Parameter sistem diuji sesuai spesifikasi`}
                  value={elemen}
                  onChange={(e) => setElemen(e.target.value)}
                  rows={6}
                  required
                  disabled={pending}
                />

                <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-100 flex items-start gap-2 text-[11px] text-neutral-600 leading-relaxed">
                  <ShieldCheck className="size-4 shrink-0 text-slime-lime-700 mt-0.5" />
                  <span>
                    Pipeline ETL otomatis membedakan baris Elemen (bernomor angka bulat) dan KUK (bernomor desimal 1.1, 1.2), lalu merancang draf topik praktikum jobsheet secara instan.
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
                  <Button type="button" variant="secondary" onClick={handleClose} disabled={pending}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={pending}
                    className="bg-slime-lime-500 text-neutral-950 font-bold hover:bg-slime-lime-400"
                  >
                    {pending ? "Mengekstrak ETL & Mendaftarkan..." : "Proses & Daftarkan Unit"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
