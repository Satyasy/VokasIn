"use server";

import {
  searchUnitKompetensiHybrid,
  getUnitKompetensiWithDetailsById,
  type SearchHit,
} from "@/lib/data-access-db";
import { getMitraByUnit, type MitraIndustri } from "@/lib/mitra-industri";
import type { UnitKompetensi, SaranTopik } from "@/lib/types";

const JUMLAH_HASIL = 8;

export interface UnitDetailResult {
  unit: UnitKompetensi | null;
  saranList: SaranTopik[];
  mitraList: MitraIndustri[];
}

// Server action murni per-request: menerima teks tempelan pengguna, memanggil
// hybrid search yang sudah ada, mengembalikan hasil, lalu selesai.
export async function jelajahKompetensi(teks: string): Promise<SearchHit[]> {
  const trimmed = teks.trim();
  if (!trimmed) return [];
  return searchUnitKompetensiHybrid(trimmed, JUMLAH_HASIL);
}

// Mengambil detail lengkap Unit SKKNI dari database Postgres, termasuk elemen, KUK,
// saran topik pembelajaran, dan mitra industri yang relevan.
export async function getUnitDetailAction(unitId: string): Promise<UnitDetailResult> {
  const [unit, { getSaranTopikForUnit }] = await Promise.all([
    getUnitKompetensiWithDetailsById(unitId),
    import("@/lib/data-access"),
  ]);

  const saranList = unit ? getSaranTopikForUnit(unit.id) : [];
  const mitraList = unit ? getMitraByUnit(unit.kodeUnit) : [];

  return {
    unit,
    saranList,
    mitraList,
  };
}
