"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DuplicateCheckResult } from "@/app/guru/upload-skkni-action";

interface DuplicateDetectionDialogProps {
  open: boolean;
  onClose: () => void;
  result: DuplicateCheckResult | null;
  totalSelected: number;
  onSkipAndContinue: (duplicateCodes: string[]) => void;
  onForceImportAll: () => void;
  isSubmitting?: boolean;
}

export function DuplicateDetectionDialog({
  open,
  onClose,
  result,
  totalSelected,
  onSkipAndContinue,
  onForceImportAll,
  isSubmitting = false,
}: DuplicateDetectionDialogProps) {
  if (!open || !result || !result.hasDuplicate) return null;

  const duplicateCodes = result.duplicateUnits.map((u) => u.kodeUnit);
  const duplicateCount = result.duplicateUnits.length;
  const newUnitsCount = Math.max(0, totalSelected - duplicateCount);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-6 sm:p-7 shadow-2xl text-neutral-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        {/* Header Dialog */}
        <div className="flex items-start justify-between gap-4 mt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 ring-4 ring-amber-50">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h3 id="duplicate-dialog-title" className="text-base sm:text-lg font-bold text-neutral-900">
                Peringatan: Dokumen / Unit SKKNI Sudah Ada
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Sistem mendeteksi bahwa unit kompetensi yang Anda pilih telah terdaftar sebelumnya.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Info Banner Dokumen Duplikat jika terdeteksi */}
        {result.documentDuplicate && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 p-3.5 text-xs text-amber-900">
            <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Nomor SKKNI Telah Terdaftar: </span>
              <span className="font-semibold">&ldquo;{result.documentDuplicate.nomor}&rdquo;</span>
              {result.documentDuplicate.namaFile && (
                <span className="text-amber-800"> (Berkas: {result.documentDuplicate.namaFile})</span>
              )}
            </div>
          </div>
        )}

        {/* List Unit Duplikat */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 mb-2">
            <span>Daftar Unit Terdeteksi Duplikat ({duplicateCount}):</span>
            <span className="text-neutral-400">Total dipilih: {totalSelected} unit</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-2.5">
            {result.duplicateUnits.map((u, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-xl bg-white p-2.5 border border-neutral-200/80 shadow-2xs text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-800">{u.kodeUnit}</span>
                    {u.status === "resmi" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-2 font-semibold">
                        Katalog Resmi
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 px-2 font-semibold">
                        Menunggu Verifikasi
                      </Badge>
                    )}
                  </div>
                  <p className="text-neutral-600 text-[11px] truncate mt-0.5" title={u.judulUnit}>
                    {u.judulUnit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Penjelasan Tindakan Rekomendasi */}
        <div className="mt-4 text-xs text-neutral-600 bg-neutral-100/70 rounded-2xl p-3 leading-relaxed">
          {newUnitsCount > 0 ? (
            <p>
              💡 <strong>Rekomendasi:</strong> Anda dapat mengabaikan{" "}
              <strong>{duplicateCount} unit duplikat</strong> dan hanya melanjutkan impor untuk{" "}
              <strong className="text-emerald-700">{newUnitsCount} unit baru</strong> yang belum terdaftar.
            </p>
          ) : (
            <p>
              ⚠️ Seluruh <strong>{duplicateCount} unit</strong> yang dipilih telah ada di sistem. Anda dapat membatalkan atau memilih untuk memperbarui data yang sudah ada.
            </p>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          >
            Batal &amp; Tinjau Ulang
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onForceImportAll}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl text-xs border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Tetap Impor Semua ({totalSelected})
          </Button>

          {newUnitsCount > 0 && (
            <Button
              type="button"
              onClick={() => onSkipAndContinue(duplicateCodes)}
              loading={isSubmitting}
              className="w-full sm:w-auto rounded-xl bg-slime-lime-500 hover:bg-slime-lime-400 text-slime-lime-950 font-bold text-xs shadow-xs"
            >
              <CheckCircle2 className="size-3.5 mr-1.5" />
              <span>Lewati Duplikat &amp; Impor {newUnitsCount} Unit Baru</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
