"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { SearchX, Sparkles, ArrowRight, Eye, X, BookOpen, Wrench, ExternalLink } from "lucide-react";
import { jelajahKompetensi } from "@/app/jelajah-kompetensi/search-action";
import type { SearchHit } from "@/lib/data-access-db";
import { getUnitKompetensiById, getSaranTopikForUnit } from "@/lib/data-access";
import { tingkatKecocokan, badgeVariantByTingkatKecocokan } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const SAMPLE_PROMPTS = [
  {
    label: "Jaringan LAN & Router",
    text: "Saya berpengalaman mengonfigurasi perangkat router mikrotik, memasang kabel UTP LAN, dan membuat subnetting IP address di laboratorium komputer sekolah.",
  },
  {
    label: "IoT & Sensor",
    text: "Saya pernah membuat proyek otomasi smart greenhouse menggunakan mikrokontroler ESP32, sensor suhu DHT22, dan pengujian koneksi protokol MQTT.",
  },
  {
    label: "Manajemen Proyek Software",
    text: "Saya terbiasa mengelola repositori Git, membuat backlog tiket fitur, melakukan code review tim, dan menyusun dokumentasi teknis sprint pengembangan aplikasi.",
  },
];

export function JelajahKompetensiClient() {
  const [teks, setTeks] = useState("");
  const [hasil, setHasil] = useState<SearchHit[] | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SearchHit | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = teks.trim();
    if (!trimmed) return;
    startTransition(async () => {
      setHasil(await jelajahKompetensi(trimmed));
    });
  }

  function handleSelectSample(sampleText: string) {
    setTeks(sampleText);
    startTransition(async () => {
      setHasil(await jelajahKompetensi(sampleText));
    });
  }

  const hasilLayak = hasil?.filter((h) => h.snippet !== null) ?? [];
  const skorTertinggi = hasilLayak[0]?.score ?? 0;

  // Detail unit yang sedang dibuka popup-nya
  const activeDetailUnit = selectedUnit ? getUnitKompetensiById(selectedUnit.id) : null;
  const activeDetailSaran = selectedUnit ? getSaranTopikForUnit(selectedUnit.id) : [];

  return (
    <div className="mt-8">
      {/* Contoh Cepat */}
      <div className="mb-4 rounded-xl border border-slime-lime-200 bg-slime-lime-50/70 p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slime-lime-900">
          <Sparkles className="size-4 text-slime-lime-700" aria-hidden />
          <span>Coba contoh portofolio instan:</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={isPending}
              onClick={() => handleSelectSample(s.text)}
              className="inline-flex items-center gap-1 rounded-lg border border-slime-lime-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm transition-all hover:bg-slime-lime-100 hover:border-slime-lime-400 active:scale-95 disabled:opacity-60"
            >
              <span>{s.label}</span>
              <ArrowRight className="size-3 text-slime-lime-700" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Textarea
          label="Tempelkan ringkasan pengalaman, proyek, atau portofolio Anda"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Mis. 'Saya pernah magang di lab jaringan sekolah, memasang dan mengonfigurasi beberapa router serta membuat topologi LAN sederhana untuk lab komputer.'"
          rows={5}
        />
        <Button
          type="submit"
          disabled={isPending || !teks.trim()}
          className="self-start bg-neutral-900 font-bold text-white hover:bg-neutral-800"
        >
          {isPending ? "Mencari kecocokan SKKNI…" : "Jelajahi kompetensi terkait"}
        </Button>
      </form>

      {hasil !== null && (
        <div className="mt-8">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-600">
            Daftar ini menunjukkan kompetensi resmi SKKNI yang berkaitan secara semantik dan kata kunci dengan teks Anda. Klik kartu untuk melihat rincian isi unit dan perangkat ajar.
          </div>

          <div className="mt-4">
            {hasilLayak.length === 0 ? (
              <EmptyState
                icon={<SearchX className="size-8" />}
                title="Tidak ditemukan kompetensi yang cukup berkaitan"
                description="Coba jelaskan pengalaman Anda dengan kosakata teknis yang lebih spesifik atau coba salah satu contoh di atas."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {hasilLayak.map((h) => {
                  const tingkat = tingkatKecocokan(h.score, skorTertinggi);
                  const unit = getUnitKompetensiById(h.id);
                  return (
                    <Card
                      key={h.id}
                      onClick={() => setSelectedUnit(h)}
                      className="cursor-pointer p-5 transition-all hover:border-slime-lime-400 hover:shadow-md active:scale-[0.99]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slime-lime-900">{h.kodeUnit}</span>
                          {h.programKeahlian && (
                            <Badge variant="brand" className="text-xs">
                              {h.programKeahlian}
                            </Badge>
                          )}
                          <Badge variant={badgeVariantByTingkatKecocokan[tingkat]} className="text-xs font-semibold">
                            Tingkat kecocokan: {tingkat}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUnit(h);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slime-lime-800 hover:underline"
                        >
                          <Eye className="size-3.5" aria-hidden />
                          Detail Unit
                        </button>
                      </div>

                      <CardTitle className="mt-2.5 text-base font-bold text-neutral-900">{h.judulUnit}</CardTitle>
                      {h.snippet && (
                        <CardDescription className="mt-2 text-xs leading-relaxed text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
                          &ldquo;{h.snippet}&rdquo;
                        </CardDescription>
                      )}
                      {unit && (
                        <p className="mt-2.5 text-xs font-medium text-neutral-500">
                          Sumber SKKNI: {unit.sumber}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Popup Detail Lengkap Unit SKKNI */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" className="font-bold">
                    {selectedUnit.kodeUnit}
                  </Badge>
                  {selectedUnit.programKeahlian && (
                    <Badge variant="default" className="font-bold">
                      {selectedUnit.programKeahlian}
                    </Badge>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-neutral-900 leading-snug">
                  {selectedUnit.judulUnit}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {/* Isi Detail Modal */}
            <div className="mt-5 space-y-5">
              {/* Dokumen & Sumber */}
              <div className="rounded-xl bg-neutral-50 p-3.5 border border-neutral-100 text-xs space-y-1">
                <p className="text-neutral-500">
                  Dokumen SKKNI: <strong className="text-neutral-900">{activeDetailUnit?.dokumenSkkni ?? selectedUnit.kodeUnit}</strong>
                </p>
                <p className="text-neutral-500">
                  Keputusan Menaker: <strong className="text-neutral-900">{activeDetailUnit?.sumber ?? "Standar Kompetensi Kerja Nasional Indonesia"}</strong>
                </p>
              </div>

              {/* Kutipan Relevansi Semantik */}
              {selectedUnit.snippet && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Relevansi dengan Pengalaman Anda
                  </h4>
                  <p className="mt-1.5 rounded-xl border border-slime-lime-200 bg-slime-lime-50/50 p-3.5 text-xs leading-relaxed text-neutral-800">
                    &ldquo;{selectedUnit.snippet}&rdquo;
                  </p>
                </div>
              )}

              {/* Topik Praktikum & Alat yang Dibutuhkan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Rencana Topik Praktikum &amp; Alat Lab ({activeDetailSaran.length} Topik)
                </h4>
                {activeDetailSaran.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">
                    Belum ada kartu topik praktikum yang digenerate untuk unit ini.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {activeDetailSaran.map((saran, idx) => (
                      <div
                        key={saran.id}
                        className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">
                            {idx + 1}. {saran.judul}
                          </span>
                        </div>
                        <p className="mt-1 text-neutral-600 leading-relaxed">
                          {saran.isiEkstraktif}
                        </p>
                        {saran.alatDibutuhkan.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-neutral-500">Alat Praktikum:</span>
                            {saran.alatDibutuhkan.map((alat) => (
                              <span
                                key={alat.label}
                                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-700"
                              >
                                <Wrench className="size-2.5" />
                                {alat.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUnit(null)}
              >
                Tutup
              </Button>
              <Link href={`/guru/susun/${selectedUnit.id}`}>
                <Button
                  size="sm"
                  className="bg-slime-lime-600 font-bold text-neutral-950 hover:bg-slime-lime-500"
                >
                  <BookOpen className="size-3.5 mr-1.5" />
                  Susun Modul Ajar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

