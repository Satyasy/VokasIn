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

export function registerCustomUnit(unit: import("./types").UnitKompetensi, topics?: SaranTopik[]) {
  const existingIdx = unitKompetensi.findIndex((u) => u.id === unit.id);
  if (existingIdx >= 0) {
    unitKompetensi[existingIdx] = unit;
  } else {
    unitKompetensi.unshift(unit);
  }
  if (topics && topics.length > 0) {
    for (const t of topics) {
      const sIdx = saranTopik.findIndex((s) => s.id === t.id);
      if (sIdx >= 0) {
        saranTopik[sIdx] = t;
      } else {
        saranTopik.push(t);
      }
    }
  }
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

// Agregat Skill Delta Score (F8) — skala 0-100% yang mengkombinasikan:
// 1. Defisit cakupan unit kompetensi SKKNI kurikulum (bobot maks 70%)
// 2. Akumulasi bobot kesenjangan kebutuhan industri aktual (bobot maks 30%)
//    dengan pembobotan dinamis: Kritis (+10%), Standar (+6%), Opsional (+4%).
export function getSkillDeltaReport(programKeahlianId: string, semester: string): SkillDeltaReport {
  const unitList = getUnitKompetensiByProgram(programKeahlianId);
  const unitTerajarkan = unitList.filter((u) =>
    saranTopik.some((s) => s.unitKompetensiId === u.id)
  ).length;
  const gapList = getGapKandidat(programKeahlianId);
  const gapCount = gapList.length;
  const cakupan = unitList.length === 0 ? 0 : unitTerajarkan / unitList.length;

  const gapScore = Math.min(
    gapList.reduce((acc, g) => {
      const weight = g.tingkatUrgensi === "kritis" ? 10 : g.tingkatUrgensi === "opsional" ? 4 : 6;
      return acc + weight;
    }, 0),
    30
  );

  const skorDelta = Math.max(0, Math.min(100, Math.round((1 - cakupan) * 70 + gapScore)));
  const keselarasanPersen = 100 - skorDelta;

  return {
    programKeahlianId,
    semester,
    totalUnitKompetensi: unitList.length,
    unitTerajarkan,
    gapKandidatCount: gapCount,
    skorDelta,
    keselarasanPersen,
  };
}
