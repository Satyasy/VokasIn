import type { DraftUnitGroup } from "./modul-ajar-draft-context";

// Model dokumen tunggal — SATU-SATUNYA sumber data untuk semua format ekspor
// (PDF/DOCX). Satu draft = banyak unit kompetensi (ARCHITECTURE.md
// §2, ModulAjarDraft 1-ke-banyak SaranTopik) — nested unit→topik supaya
// pengelompokan per unit asal (dan ketertelusuran SKKNI per unit) ikut ke
// dokumen ekspor, bukan cuma di kanvas. Kalau field berubah lagi di masa
// depan, cukup ubah buildModulAjarDocument, bukan tiap builder format.
export interface ModulAjarDocumentTopik {
  judul: string; // judul topik/elemen
  kukText: string; // kutipan Elemen+KUK asli (ekstraktif, F3)
  alatDibutuhkan: string[];
  skorKeyakinan: number; // 0-1
  catatanPedagogi: string; // murni input manual guru, boleh kosong — per kartu, bukan per draft
}

export interface ModulAjarDocumentUnit {
  kodeUnit: string;
  judulUnit: string;
  dokumenSkkni: string; // nomor Kepmenaker rujukan — per unit, karena satu draft bisa merujuk dokumen berbeda
  sumberHalaman: string; // kode unit asli + nomor halaman dokumen — ketertelusuran ke SKKNI asli
  topikList: ModulAjarDocumentTopik[];
}

export interface ModulAjarDocument {
  judul: string;
  programKeahlian: string; // nama peminatan draft, mis. "Teknik Komputer dan Jaringan"
  tanggal: string; // sudah diformat id-ID, siap tampil
  unitList: ModulAjarDocumentUnit[];
}

export function buildModulAjarDocument(programKeahlianNama: string, unitGroups: DraftUnitGroup[]): ModulAjarDocument {
  return {
    judul: `Modul Ajar — ${programKeahlianNama}`,
    programKeahlian: programKeahlianNama,
    tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    unitList: unitGroups.map((g) => ({
      kodeUnit: g.unit.kodeUnit,
      judulUnit: g.unit.judulUnit,
      dokumenSkkni: g.unit.dokumenSkkni,
      sumberHalaman: g.unit.sumber,
      topikList: g.topikDiterima.map((t) => ({
        judul: t.judul,
        kukText: t.isiEkstraktif,
        alatDibutuhkan: t.alatDibutuhkan.map((a) => a.label),
        skorKeyakinan: t.skorKeyakinan,
        catatanPedagogi: t.catatanPedagogi?.trim() || "",
      })),
    })),
  };
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Nama file konsisten dipakai kedua format (PDF/DOCX) — mis.
// "modul-ajar-TKJ-2026-08-22.pdf". Berbasis peminatan (bukan kode unit)
// karena satu draft sekarang bisa berisi banyak unit.
export function buildExportFilename(slug: string, extension: string): string {
  const tanggal = new Date().toISOString().slice(0, 10);
  // Singkatan program keahlian "belum ditentukan" literal "?" (lib/seed-data.ts)
  // — karakter itu (dan sejenisnya) ilegal di nama file Windows, jadi disaring.
  const slugAman = slug.replace(/[<>:"/\\|?*]/g, "").trim() || "draft";
  return `modul-ajar-${slugAman}-${tanggal}.${extension}`;
}
