"use server";

import { searchUnitKompetensiHybrid, type SearchHit } from "@/lib/data-access-db";

const JUMLAH_HASIL = 8;

// Server action murni per-request: menerima teks tempelan pengguna, memanggil
// hybrid search yang sudah ada, mengembalikan hasil, lalu selesai — teks input
// TIDAK PERNAH ditulis ke variabel modul, tabel, atau log apa pun di sini
// (lihat verifikasi grep di laporan tugas). Sama sekali tidak beda dari
// app/guru/search-action.ts selain nama & limit.
export async function jelajahKompetensi(teks: string): Promise<SearchHit[]> {
  const trimmed = teks.trim();
  if (!trimmed) return [];
  return searchUnitKompetensiHybrid(trimmed, JUMLAH_HASIL);
}
