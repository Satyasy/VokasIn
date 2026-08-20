import type { Guru, SaranTopik, SkillDeltaReport, SumberDayaLab, KategoriAlat } from "./types";
import {
  programKeahlian,
  unitKompetensi,
  skillEntity,
  saranTopik,
} from "./seed-data";

// Antarmuka data ini berdiri di tempat Layer 0-2 (parsing SKKNI, NER, embedding
// similarity) — lihat ARCHITECTURE.md. Sengaja dipisah agar backend ML nyata
// bisa dicolokkan tanpa mengubah kode UI: ganti isi fungsi, bukan pemanggilnya.

export function getProgramKeahlian() {
  return programKeahlian;
}

export function getUnitKompetensiByProgram(programKeahlianId: string) {
  return unitKompetensi.filter((u) => u.programKeahlianId === programKeahlianId);
}

export function getUnitKompetensiById(id: string) {
  return unitKompetensi.find((u) => u.id === id);
}

export function getSaranTopikForUnit(unitKompetensiId: string): SaranTopik[] {
  return saranTopik.filter((s) => s.unitKompetensiId === unitKompetensiId);
}

// Cache in-memory dari tabel sumber_daya_lab di Postgres. checkFeasibility()
// dipanggil sinkron dari komponen client (components/guru/susun-modul-client.tsx,
// lewat useMemo) — driver `pg` tidak bisa dipakai di client bundle sama
// sekali (butuh modul Node seperti "tls"), jadi baca tetap sinkron dari cache
// ini. Query Postgres yang mengisi cache ada di lib/data-access-db.ts
// (server-only) supaya "pg" tidak pernah ikut ter-bundle ke client, walau
// cuma lewat import chain — lihat setLabCache() di bawah.
let sumberDayaLabCache: SumberDayaLab[] = [];

export function setLabCache(items: SumberDayaLab[]) {
  sumberDayaLabCache = items;
}

export function getLabForProgram(programKeahlianId: string) {
  return sumberDayaLabCache.filter((l) => l.programKeahlianId === programKeahlianId);
}

export interface FeasibilityResult {
  layak: boolean;
  tersedia: { kategori: string; label: string }[];
  tidakTersedia: { kategori: string; label: string }[];
}

// Cocokkan berdasarkan KATEGORI alat, bukan merek dagang (F5, PRD.md #16).
export function checkFeasibility(topik: SaranTopik, programKeahlianId: string): FeasibilityResult {
  const lab = getLabForProgram(programKeahlianId);
  const tersedia: FeasibilityResult["tersedia"] = [];
  const tidakTersedia: FeasibilityResult["tidakTersedia"] = [];

  for (const kebutuhan of topik.alatDibutuhkan) {
    const ada = lab.some((l) => l.kategori === kebutuhan.kategori && l.jumlah > 0);
    (ada ? tersedia : tidakTersedia).push({
      kategori: kebutuhan.kategori,
      label: kebutuhan.label,
    });
  }

  return { layak: tidakTersedia.length === 0, tersedia, tidakTersedia };
}

export function findLabItemInCache(id: string) {
  return sumberDayaLabCache.find((l) => l.id === id);
}

export const KATEGORI_ALAT_LIST: KategoriAlat[] = [
  "perangkat-jaringan",
  "komputer-kerja",
  "alat-ukur",
  "perangkat-lunak",
  "alat-tangan",
  "server",
];

export function toggleGapReviewed(id: string) {
  const skill = skillEntity.find((s) => s.id === id);
  if (!skill) return undefined;
  skill.sudahDitinjau = !skill.sudahDitinjau;
  return skill;
}

export function getGapKandidat(programKeahlianId?: string) {
  return skillEntity.filter(
    (s) =>
      s.statusPemetaan === "gap_kandidat" &&
      (programKeahlianId === undefined || s.programKeahlianId === programKeahlianId)
  );
}

// Cache in-memory dari tabel guru di Postgres, sama seperti sumberDayaLabCache
// di atas — sengaja bukan array in-memory di seed-data.ts lagi, supaya guru
// (dan kredensial login-nya) punya satu sumber kebenaran. Query pengisi cache
// ada di lib/data-access-db.ts (server-only).
let guruCache: Guru[] = [];

export function setGuruCache(items: Guru[]) {
  guruCache = items;
}

export function getGuruByProgram(programKeahlianId: string) {
  return guruCache.filter((g) => g.programKeahlianId === programKeahlianId);
}

export function getGuruById(id: string) {
  return guruCache.find((g) => g.id === id);
}

// Agregat sederhana untuk Skill Delta Score (F8) — proporsi unit kompetensi
// program keahlian yang sudah punya jejak saran topik, dikombinasikan dengan
// jumlah kandidat gap yang belum tercakup SKKNI.
export function getSkillDeltaReport(programKeahlianId: string, semester: string): SkillDeltaReport {
  const unitList = getUnitKompetensiByProgram(programKeahlianId);
  const unitTerajarkan = unitList.filter((u) =>
    saranTopik.some((s) => s.unitKompetensiId === u.id)
  ).length;
  const gapCount = getGapKandidat(programKeahlianId).length;
  const cakupan = unitList.length === 0 ? 0 : unitTerajarkan / unitList.length;
  const skorDelta = Math.round((1 - cakupan) * 70 + Math.min(gapCount, 5) * 6);

  return {
    programKeahlianId,
    semester,
    totalUnitKompetensi: unitList.length,
    unitTerajarkan,
    gapKandidatCount: gapCount,
    skorDelta,
  };
}
