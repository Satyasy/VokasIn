"use client";

import { useTransition } from "react";
import { Check, X, FileText, AlertCircle, BookOpen, Clock, ShieldCheck } from "lucide-react";
import type { UnitKompetensiKandidat, ProgramKeahlian } from "@/lib/types";
import { confirmKandidatAction, rejectKandidatAction } from "@/app/admin/skkni/kandidat/actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadSkkniModal } from "@/components/skkni/upload-skkni-modal";

interface KaprogliSkkniTabProps {
  kandidatList: UnitKompetensiKandidat[];
  currentProgramId: string;
  programList: ProgramKeahlian[];
}

export function KaprogliSkkniTab({
  kandidatList,
  currentProgramId,
  programList,
}: KaprogliSkkniTabProps) {
  const [isPending, startTransition] = useTransition();

  // Filter kandidat yang relevan dengan program keahlian Kaprogli atau belum ditentukan
  const filteredKandidat = kandidatList.filter(
    (k) => k.programKeahlianId === currentProgramId || k.programKeahlianId === "pk-belum-ditentukan"
  );

  const currentProgram = programList.find((p) => p.id === currentProgramId);

  function handleConfirm(id: string) {
    startTransition(async () => {
      await confirmKandidatAction(id);
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      await rejectKandidatAction(id);
    });
  }

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Alur Dual-Tier Verifikasi */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-slime-lime-700" />
              <h2 className="text-lg font-bold text-neutral-900">
                Penyelarasan &amp; Verifikasi Kurikulum SKKNI Jurusan {currentProgram?.singkatan}
              </h2>
            </div>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-2xl">
              Tinjau usulan unit kompetensi yang diunggah mandiri oleh para guru untuk disahkan menjadi kurikulum bersama satu jurusan, atau unggah dokumen rujukan industri baru langsung lewat ETL.
            </p>
          </div>

          <UploadSkkniModal defaultProgramId={currentProgramId} />
        </div>
      </div>

      {/* Daftar Antrean Verifikasi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Antrean Verifikasi Dokumen ({filteredKandidat.length} Menunggu)
          </h3>
          <span className="text-xs text-neutral-400">
            Jurusan {currentProgram?.nama}
          </span>
        </div>

        {filteredKandidat.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <Check className="mx-auto size-8 text-slime-lime-600" />
            <p className="mt-2 text-sm font-bold text-neutral-900">
              Tidak ada antrean verifikasi unit SKKNI
            </p>
            <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
              Seluruh usulan kompetensi guru telah diverifikasi atau belum ada dokumen baru yang diunggah.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredKandidat.map((kandidat) => (
              <Card key={kandidat.id} className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-xs">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand" className="font-extrabold text-xs">
                        {kandidat.kodeUnit}
                      </Badge>
                      <Badge variant="warning" className="text-xs font-semibold">
                        <Clock className="size-3 mr-1" />
                        Menunggu Persetujuan Kaprogli
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-base font-bold text-neutral-900 leading-snug">
                      {kandidat.judulUnit}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs text-neutral-500">
                      Rujukan: {kandidat.sumber}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 sm:self-start">
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleConfirm(kandidat.id)}
                      className="bg-slime-lime-500 text-neutral-950 font-bold hover:bg-slime-lime-400 text-xs"
                    >
                      <Check className="size-3.5 mr-1" />
                      Setujui untuk Jurusan
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => handleReject(kandidat.id)}
                      className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="size-3.5 mr-1" />
                      Tolak
                    </Button>
                  </div>
                </div>

                {kandidat.catatan && (
                  <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600 border border-neutral-100">
                    {kandidat.catatan}
                  </p>
                )}

                {/* Teks Elemen yang Diekstrak */}
                <div className="mt-4 rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                    Elemen Kompetensi &amp; KUK Hasil Ekstraksi:
                  </span>
                  <div className="space-y-2">
                    {kandidat.elemenKompetensi.map((elem, idx) => (
                      <div key={idx} className="text-xs text-neutral-700">
                        <span className="font-bold text-neutral-900">{idx + 1}. {elem.judul}</span>
                        {elem.kriteriaUnjukKerja.length > 0 && (
                          <ul className="mt-1 list-inside list-disc pl-2 space-y-0.5 text-neutral-600 text-[11px]">
                            {elem.kriteriaUnjukKerja.map((kuk, kIdx) => (
                              <li key={kIdx}>{kuk.kode} {kuk.teks}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
