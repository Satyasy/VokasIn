// Bentuk data mengikuti ERD di ARCHITECTURE.md §2.

export interface ProgramKeahlian {
  id: string;
  nama: string;
  singkatan: string;
}

export type Role = "guru_produktif" | "kaprogli" | "admin";

export interface Guru {
  id: string;
  nama: string;
  programKeahlianId: string;
  email: string;
  role: Role;
  aktif: boolean;
}

export interface DokumenSkkni {
  id: string;
  nomor: string;
  namaFile: string | null;
  diuploadPada: string | null;
  diuploadOleh: string | null;
}

export interface KandidatKriteriaUnjukKerja {
  kode: string;
  teks: string;
}

export interface KandidatElemenKompetensi {
  judul: string;
  kriteriaUnjukKerja: KandidatKriteriaUnjukKerja[];
}

export type StatusKandidat = "menunggu" | "dikonfirmasi" | "ditolak";

export interface UnitKompetensiKandidat {
  id: string;
  dokumenSkkniId: string;
  kodeUnit: string;
  judulUnit: string;
  sumber: string;
  programKeahlianId: string;
  teksMentah: string;
  elemenKompetensi: KandidatElemenKompetensi[];
  parsingUncertain: boolean;
  catatan: string | null;
  status: StatusKandidat;
}

export interface KriteriaUnjukKerja {
  id: string;
  kode: string; // mis. "1.1"
  teks: string;
}

export interface ElemenKompetensi {
  id: string;
  judul: string;
  kriteriaUnjukKerja: KriteriaUnjukKerja[];
}

export interface UnitKompetensi {
  id: string;
  kodeUnit: string; // format resmi SKKNI, mis. "J.611000.001.02"
  judulUnit: string;
  dokumenSkkni: string; // nomor Kepmenaker/Kepmenperin rujukan
  sumber: string; // kode unit asli + nomor halaman dokumen, untuk verifikasi ulang
  programKeahlianId: string;
  elemenKompetensi: ElemenKompetensi[];
}

export type KategoriAlat =
  | "perangkat-jaringan"
  | "komputer-kerja"
  | "alat-ukur"
  | "perangkat-lunak"
  | "alat-tangan"
  | "server";

export interface SumberDayaLab {
  id: string;
  nama: string;
  kategori: KategoriAlat;
  jumlah: number;
  programKeahlianId: string;
}

export type StatusPemetaan = "terpetakan_skkni" | "gap_kandidat";

export interface SkillEntity {
  id: string;
  namaSkill: string;
  sumberSekunder: string; // mis. "Input manual kaprogli", "Lowongan mitra industri"
  programKeahlianId: string;
  statusPemetaan: StatusPemetaan;
  unitKompetensiTerkaitId?: string; // terisi jika terpetakan_skkni
  skorKemiripan?: number; // 0-1, hanya relevan bila terpetakan
  sudahDitinjau?: boolean; // kaprogli sudah meninjau kandidat gap ini (F6)
}

export type KategoriAlatDibutuhkan = {
  kategori: KategoriAlat;
  label: string;
};

export interface SaranTopik {
  id: string;
  unitKompetensiId: string;
  elemenKompetensiId: string;
  judul: string;
  isiEkstraktif: string; // disusun langsung dari teks Elemen+KUK asli
  alatDibutuhkan: KategoriAlatDibutuhkan[];
  skorKeyakinan: number; // 0-1, hasil vector similarity — bukan kepastian
  catatanPedagogi?: string; // murni input manual guru — sistem TIDAK PERNAH mengisi ini
}

export interface KoreksiGuru {
  id: string;
  saranTopikId: string;
  guruId: string;
  tindakan: "terima" | "tolak" | "modifikasi";
  catatan?: string;
  waktu: string; // ISO date
}

export interface ModulAjarDraft {
  id: string;
  guruId: string;
  programKeahlianId: string;
  unitKompetensiId: string;
  judul: string;
  saranTopikDiterima: string[]; // id SaranTopik yang sudah di-drag ke kanvas
}

export interface SkillDeltaReport {
  programKeahlianId: string;
  semester: string; // mis. "Ganjil 2026/2027"
  totalUnitKompetensi: number;
  unitTerajarkan: number;
  gapKandidatCount: number;
  skorDelta: number; // 0-100, makin tinggi makin besar kesenjangan
}

export type StatusJadwal = "terjadwal" | "terlaksana" | "dijadwal_ulang" | "batal";

export interface JadwalPembelajaran {
  id: string;
  guruId: string;
  programKeahlianId: string;
  unitKompetensiId?: string;
  judulMateri: string;
  kelas: string;
  mingguKe: number;
  tanggal: string; // format YYYY-MM-DD
  jamMulai: string; // mis. "07:30"
  jamSelesai: string; // mis. "11:30"
  alokasiJp: number;
  status: StatusJadwal;
  catatanRefleksi?: string;
  createdAt?: string;
  // Joined fields for display
  namaGuru?: string;
  kodeUnit?: string;
  judulUnit?: string;
}

export interface JpSummary {
  targetJpSemester: number;
  jpTerlaksana: number;
  jpTerjadwal: number;
  persentaseTerlaksana: number;
  totalSesi: number;
  sesiTerlaksana: number;
}

export interface ProgramCurriculumMetric {
  programId: string;
  programNama: string;
  programSingkatan: string;
  totalUnitSkkni: number;
  unitTerajarkan: number;
  persentaseModul: number;
  targetJpSemester: number;
  jpTerlaksana: number;
  persentaseJp: number;
  labKesiapanPersen: number;
}

export interface AdminAnalyticsData {
  totalDokumen: number;
  unitTerverifikasi: number;
  kandidatMenunggu: number;
  totalPengguna: number;
  totalSesiJadwal: number;
  totalJpTerlaksana: number;
  totalTargetJp: number;
  overallJpPersen: number;
  programMetrics: ProgramCurriculumMetric[];
  hitlMetrics: {
    terima: number;
    modifikasi: number;
    tolak: number;
    total: number;
    persenTerima: number;
  };
}
