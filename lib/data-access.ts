import type { SaranTopik, SkillDeltaReport } from "./types";
import {
  programKeahlian,
  guru,
  unitKompetensi,
  sumberDayaLab,
  skillEntity,
  saranTopik,
  koreksiGuru,
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

export function getLabForProgram(programKeahlianId: string) {
  return sumberDayaLab.filter((l) => l.programKeahlianId === programKeahlianId);
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

export function getGapKandidat(programKeahlianId?: string) {
  return skillEntity.filter(
    (s) =>
      s.statusPemetaan === "gap_kandidat" &&
      (programKeahlianId === undefined || s.programKeahlianId === programKeahlianId)
  );
}

export function getKoreksiGuru() {
  return koreksiGuru;
}

export function getGuruByProgram(programKeahlianId: string) {
  return guru.filter((g) => g.programKeahlianId === programKeahlianId);
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
