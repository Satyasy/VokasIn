"use client";

import { useState, useTransition, type FormEvent } from "react";
import { SearchX, Sparkles, ArrowRight } from "lucide-react";
import { jelajahKompetensi } from "@/app/jelajah-kompetensi/search-action";
import type { SearchHit } from "@/lib/data-access-db";
import { getUnitKompetensiById } from "@/lib/data-access";
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
            Daftar ini menunjukkan kompetensi resmi SKKNI yang berkaitan secara semantik dan kata kunci dengan teks Anda — bukan penilaian kelulusan otomatis.
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
                    <Card key={h.id} className="p-5 transition-all hover:border-slime-lime-400 hover:shadow-sm">
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
                      <CardTitle className="mt-2.5 text-base font-bold text-neutral-900">{h.judulUnit}</CardTitle>
                      {h.snippet && (
                        <CardDescription className="mt-1.5 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 italic">
                          …{h.snippet}…
                        </CardDescription>
                      )}
                      {unit && (
                        <p className="mt-2.5 text-xs font-medium text-neutral-400">
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
    </div>
  );
}
