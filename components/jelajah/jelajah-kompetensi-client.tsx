"use client";

import { useState, useTransition, type FormEvent } from "react";
import { jelajahKompetensi } from "@/app/jelajah-kompetensi/search-action";
import type { SearchHit } from "@/lib/data-access-db";
import { getUnitKompetensiById } from "@/lib/data-access";
import { tingkatKecocokan, badgeVariantByTingkatKecocokan } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";

const PLACEHOLDER =
  'Mis. "Saya pernah magang di lab jaringan sekolah, memasang dan mengonfigurasi beberapa router serta membuat topologi LAN sederhana untuk lab komputer."';

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

  // Sama seperti Asisten Kebutuhan Modul guru: hanya unit dengan cuplikan
  // ts_headline nyata (bukti tumpang tindih kata kunci) yang ditampilkan.
  const hasilLayak = hasil?.filter((h) => h.snippet !== null) ?? [];
  const skorTertinggi = hasilLayak[0]?.score ?? 0;

  return (
    <div className="mt-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Textarea
          label="Tempelkan ringkasan pengalaman, proyek, atau portofolio Anda"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={6}
        />
        <Button type="submit" disabled={isPending || !teks.trim()} className="self-start">
          {isPending ? "Mencari…" : "Jelajahi kompetensi terkait"}
        </Button>
      </form>

      {hasil !== null && (
        <div className="mt-6">
          <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            Daftar ini menunjukkan kompetensi yang BERKAITAN dengan teks Anda — bukan penilaian
            kemampuan Anda. Anda sendiri yang menentukan apakah kompetensi ini benar-benar Anda
            kuasai.
          </div>

          <div className="mt-4">
            {hasilLayak.length === 0 ? (
              <EmptyState
                icon={<SearchX className="size-8" />}
                title="Tidak ditemukan kompetensi yang cukup berkaitan"
                description="Coba jelaskan dengan kata lain."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {hasilLayak.map((h) => {
                  const tingkat = tingkatKecocokan(h.score, skorTertinggi);
                  // Sumber (dokumen Kepmenaker + halaman) hanya ada di korpus in-memory
                  // (lib/data-access.ts, mencerminkan tabel unit_kompetensi dengan id yang
                  // sama) — searchUnitKompetensiHybrid sendiri tidak mengembalikan kolom
                  // ini, jadi dilengkapi di sini alih-alih menulis ulang query pencarian.
                  const unit = getUnitKompetensiById(h.id);
                  return (
                    <Card key={h.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{h.kodeUnit}</span>
                        {h.programKeahlian && <Badge variant="default">{h.programKeahlian}</Badge>}
                        <Badge variant={badgeVariantByTingkatKecocokan[tingkat]}>
                          Tingkat kecocokan: {tingkat}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2 text-base">{h.judulUnit}</CardTitle>
                      {h.snippet && (
                        <CardDescription className="mt-1">…{h.snippet}…</CardDescription>
                      )}
                      {unit && (
                        <p className="mt-2 text-xs text-muted-foreground">Sumber: {unit.sumber}</p>
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
