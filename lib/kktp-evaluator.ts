import type {
  AssessmentInput,
  AssessmentResult,
  PredikatKktp,
  RubrikKktpItem,
  JobsheetItem,
  ProyekKelompokItem,
} from "./types";

/**
 * Evaluator Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Kejuruan
 * Menggunakan pembobotan tripartit:
 * - 20% Teori Pemahaman Konsep
 * - 40% Praktikum Mandiri Mingguan
 * - 40% Praktikum Kelompok / Project-Based Learning (PBL)
 *
 * Dilengkapi "Hard-Gate Safety Rule" (K3 & Fatal Error) standar bengkel industri.
 */
export function evaluateKKTP(input: AssessmentInput): AssessmentResult {
  const passingGrade = input.passingGrade ?? 80.0;

  // 1. HARD-GATE SAFETY RULE
  // Pelanggaran SOP K3 atau broken build/fatal runtime error langsung menggugurkan kelulusan praktikum
  if (input.k3Violation || input.fatalError) {
    const cappedScore = Math.min(Math.round(input.teori * 0.2), 59);
    return {
      nilaiAkhir: cappedScore,
      predikat: "perlu_bimbingan",
      isPassing: false,
      catatanEvaluasi: input.k3Violation
        ? "Pelanggaran SOP Keselamatan dan Kesehatan Kerja (K3) kritis terdeteksi di bengkel/lab."
        : "Jobsheet praktikum menghasilkan fatal runtime error / broken build yang menggagalkan fungsi utama.",
      remedialNote: input.k3Violation
        ? "Wajib mengikuti remedial terarah SOP Keselamatan Kerja dan simulasi ulang prosedur aman."
        : "Wajib melakukan debugging terpandu dan re-submission jobsheet hingga zero-error.",
    };
  }

  // 2. KALKULASI PEMBOBOTAN TRIPARTIT (20% : 40% : 40%)
  const rawScore = input.teori * 0.2 + input.praktikMingguan * 0.4 + input.praktikKelompok * 0.4;
  const nilaiAkhir = Number(rawScore.toFixed(2));

  // 3. PENETAPAN PREDIKAT 4 TINGKAT KKTP BSKAP KEMENDIKDASMEN
  let predikat: PredikatKktp;
  let catatanEvaluasi = "";

  if (nilaiAkhir >= 90.0) {
    predikat = "mahir";
    catatanEvaluasi = "Melampaui standar kompetensi industri. Direkomendasikan untuk pengayaan atau menjadi tutor sebaya.";
  } else if (nilaiAkhir >= 80.0) {
    predikat = "cakap";
    catatanEvaluasi = "Memenuhi passing grade standar kompetensi kerja nasional dan industri secara konsisten.";
  } else if (nilaiAkhir >= 70.0) {
    predikat = "cukup";
    catatanEvaluasi = "Mencapai ketuntasan minimal pada sebagian elemen kompetensi, namun membutuhkan penguatan praktikum mandiri.";
  } else {
    predikat = "perlu_bimbingan";
    catatanEvaluasi = "Belum memenuhi kriteria ketercapaian tujuan pembelajaran kejuruan. Memerlukan bimbingan remedial intensif.";
  }

  const isPassing = nilaiAkhir >= passingGrade;

  return {
    nilaiAkhir,
    predikat,
    isPassing,
    catatanEvaluasi,
    remedialNote: !isPassing
      ? `Skor agregat (${nilaiAkhir}) belum mencapai passing grade industri (${passingGrade}). Wajib remedial pada elemen praktikum terkait.`
      : undefined,
  };
}

/**
 * Menghasilkan contoh rubrik KKTP 4 tingkat yang selaras dengan SKKNI / WSOS
 */
export function generateDefaultRubrikKktp(mapelNama: string, topikList: string[]): RubrikKktpItem[] {
  return [
    {
      aspek: "Penguasaan Konsep Teori & Arsitektur",
      indikator: `Memahami terminologi, konsep dasar, dan spesifikasi teknis pada ${mapelNama}.`,
      kriteria: {
        perluBimbingan: "Menjawab benar < 70% pertanyaan konsep dan keliru menjelaskan alur kerja sistem.",
        cukup: "Mampu menjelaskan konsep dasar secara umum namun belum dapat menganalisis arsitektur sistem.",
        cakap: "Mampu menjelaskan spesifikasi teknis dan menganalisis alur data secara tepat (Skor ≥ 80).",
        mahir: "Mampu merancang arsitektur alternatif dan membandingkan efisiensi solusi secara komprehensif.",
      },
    },
    {
      aspek: "Unjuk Kerja Praktikum Mingguan (Mandiri)",
      indikator: "Kepatuhan SOP bengkel/lab, eksekusi jobsheet, dan ketepatan konfigurasi/kode.",
      kriteria: {
        perluBimbingan: "Banyak sintaks/koneksi error, gagal menjalankan prosedur mandiri, atau melanggar SOP K3.",
        cukup: "Berhasil menyelesaikan jobsheet dengan bantuan instruktur/teman, masih terdapat minor bug.",
        cakap: "Menuntaskan seluruh butir KUK secara mandiri, zero runtime error, dan mematuhi SOP K3 (Skor ≥ 80).",
        mahir: "Eksekusi presisi dan cepat, menerapkan best-practice clean code / standard wiring profesional.",
      },
    },
    {
      aspek: "Praktikum Kelompok / Mini-Project (PBL)",
      indikator: "Kolaborasi tim, integrasi modul tugas, dokumentasi teknis, dan presentasi hasil.",
      kriteria: {
        perluBimbingan: "Kontribusi minim dalam kelompok, modul tidak terintegrasi, dan tidak ada dokumentasi.",
        cukup: "Modul kelompok berfungsi sebagian, pembagian peran kurang merata, dokumentasi sederhana.",
        cakap: "Modul terintegrasi penuh, git repository terkelola rapi, dan laporan teknis lengkap (Skor ≥ 80).",
        mahir: "Menghasilkan portofolio siap uji coba industri, presentasi komunikatif, dan arsitektur modular.",
      },
    },
  ];
}
