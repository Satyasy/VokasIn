"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { cariUnitKompetensi } from "@/app/guru/search-action";
import type { SearchHit } from "@/lib/data-access-db";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tingkatKecocokan, badgeVariantByTingkatKecocokan } from "@/lib/utils";

const JUMLAH_HASIL_KEBUTUHAN = 8;

// Asisten Kebutuhan Modul — BUKAN chatbot dan TIDAK ADA panggilan generatif:
// ini hanya memperlebar hybrid search yang sama (searchUnitKompetensiHybrid,
// lib/data-access-db.ts) untuk menerima deskripsi kebutuhan bebas dan
// mengembalikan beberapa unit sekaligus. Guru mencentang sendiri, tidak ada
// yang otomatis masuk ke draft dari sini (HITL tetap di halaman berikutnya).
export function AsistenKebutuhanModul() {
  const [deskripsi, setDeskripsi] = useState("");
  const [hasil, setHasil] = useState<SearchHit[] | null>(null);
  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = deskripsi.trim();
    if (!trimmed) return;
    startTransition(async () => {
      setHasil(await cariUnitKompetensi(trimmed, JUMLAH_HASIL_KEBUTUHAN));
      setTerpilih(new Set());
    });
  }

  function toggle(id: string) {
    setTerpilih((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function tinjauTerpilih() {
    if (terpilih.size === 0) return;
    router.push(`/guru/susun/multi?units=${[...terpilih].join(",")}`);
  }

  // Hanya unit yang punya cuplikan Elemen/KUK nyata (snippet dari ts_headline,
  // artinya benar-benar ada tumpang tindih kata kunci) yang disodorkan sebagai
  // kandidat — unit yang cuma "tetangga terdekat" secara vektor tanpa bukti
  // kata kunci apa pun tidak bisa ditunjukkan cuplikannya dengan jujur (Bagian
  // B & D), jadi tidak ditampilkan sama sekali daripada disamarkan sebagai cocok.
  const hasilLayak = hasil?.filter((h) => h.snippet !== null) ?? [];
  const skorTertinggi = hasilLayak[0]?.score ?? 0;

  return (
    <div className="mb-8 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <Compass className="size-4 text-muted-foreground" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Asisten Kebutuhan Modul
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Jelaskan kebutuhan modul ajar Anda dalam kalimat bebas — sistem menyarankan unit kompetensi SKKNI yang
        relevan lewat pencarian, bukan menyusun teks baru. Alternatif dari mencari unit satu per satu di bawah.
      </p>

      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
        <Textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder='Mis. "Saya butuh modul dasar untuk kelas peminatan Cloud Computing, fokus ke instalasi dan konfigurasi"'
          rows={3}
        />
        <Button type="submit" disabled={isPending || !deskripsi.trim()} className="self-start">
          {isPending ? "Mencari…" : "Cari unit yang relevan"}
        </Button>
      </form>

      {hasil !== null && (
        <div className="mt-4">
          {hasilLayak.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ditemukan unit yang cukup relevan — coba kata kunci lain atau jelajahi daftar unit di bawah
              secara manual.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {hasilLayak.map((h) => {
                  const tingkat = tingkatKecocokan(h.score, skorTertinggi);
                  return (
                    <label
                      key={h.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm has-[:checked]:border-primary"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 size-4 accent-primary"
                        checked={terpilih.has(h.id)}
                        onChange={() => toggle(h.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">{h.kodeUnit}</span>
                          <span className="text-muted-foreground">— {h.judulUnit}</span>
                          {h.programKeahlian && <Badge variant="default">{h.programKeahlian}</Badge>}
                          <Badge variant={badgeVariantByTingkatKecocokan[tingkat]}>Tingkat kecocokan: {tingkat}</Badge>
                        </div>
                        {h.snippet && <p className="mt-1 text-xs text-muted-foreground">…{h.snippet}…</p>}
                      </div>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tingkat kecocokan berdasarkan kata kunci &amp; makna dari pencarian, bukan jaminan kesesuaian
                kurikulum — tinjau tiap unit sebelum menambahkannya ke modul ajar.
              </p>
              <Button className="mt-3" onClick={tinjauTerpilih} disabled={terpilih.size === 0}>
                {terpilih.size === 0
                  ? "Centang unit terlebih dahulu"
                  : `Tinjau kartu saran dari ${terpilih.size} unit terpilih`}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
