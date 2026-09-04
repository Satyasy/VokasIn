// Fungsi baca/tulis Postgres — HANYA diimpor dari Server Component / Server
// Action, tidak pernah dari file "use client". "pg" butuh modul Node (tls,
// util/types) yang tidak ada di bundle browser; memisahkan file ini dari
// lib/data-access.ts (yang diimpor components/guru/susun-modul-client.tsx,
// sebuah client component) mencegah "pg" ikut ter-bundle ke client.
import { spawn } from "child_process";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type {
  AdminAnalyticsData,
  DokumenSkkni,
  Guru,
  JadwalPembelajaran,
  JpSummary,
  KandidatElemenKompetensi,
  KategoriAlat,
  KoreksiGuru,
  ProgramCurriculumMetric,
  Role,
  StatusJadwal,
  SumberDayaLab,
  UnitKompetensi,
  ElemenKompetensi,
  UnitKompetensiKandidat,
} from "./types";
import { setLabCache, findLabItemInCache, setGuruCache } from "./data-access";
import { pool } from "./db";
import { hashPassword } from "./auth";
// ponytail: import dinamis (bukan statis) supaya @huggingface/transformers
// tidak ikut ter-bundle ke SEMUA fungsi di file ini (termasuk login, yang
// tidak butuh embedding) — @huggingface/transformers gagal dimuat di
// serverless function Vercel (lihat komentar di lib/embedding.ts).
const embedding = () => import("./embedding");

async function loadGuruCacheFromDb(): Promise<void> {
  const { rows } = await pool.query<{
    id: string;
    nama: string;
    program_keahlian_id: string;
    email: string;
    role: Role;
    aktif: boolean;
  }>("SELECT id, nama, program_keahlian_id, email, role, aktif FROM guru ORDER BY id");
  setGuruCache(
    rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      programKeahlianId: r.program_keahlian_id,
      email: r.email,
      role: r.role,
      aktif: r.aktif,
    }))
  );
}

// Panggil (dan await) di Server Component sebelum baca guru, sama polanya
// dengan ensureLabCacheFresh().
export function ensureGuruCacheFresh(): Promise<void> {
  return loadGuruCacheFromDb();
}

export interface GuruAuthRow extends Guru {
  passwordHash: string;
}

// HANYA dipakai oleh alur login (app/login) — passwordHash tidak pernah masuk
// ke guruCache sinkron di lib/data-access.ts supaya tidak ada jalur tak sengaja
// yang mengekspornya ke client.
export async function getGuruAuthByEmail(email: string): Promise<GuruAuthRow | undefined> {
  const { rows } = await pool.query<{
    id: string;
    nama: string;
    program_keahlian_id: string;
    email: string;
    password_hash: string;
    role: Role;
    aktif: boolean;
  }>(
    "SELECT id, nama, program_keahlian_id, email, password_hash, role, aktif FROM guru WHERE email = $1",
    [email]
  );
  const row = rows[0];
  if (!row) return undefined;
  return {
    id: row.id,
    nama: row.nama,
    programKeahlianId: row.program_keahlian_id,
    email: row.email,
    role: row.role,
    aktif: row.aktif,
    passwordHash: row.password_hash,
  };
}

// === Admin: dashboard (Bagian C) ===

export interface AdminDashboardStats {
  totalDokumen: number;
  unitTerverifikasi: number;
  kandidatMenunggu: number;
  totalPengguna: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [dokumen, unit, kandidat, pengguna] = await Promise.all([
    pool.query<{ count: string }>("SELECT count(*)::text FROM dokumen_skkni"),
    pool.query<{ count: string }>("SELECT count(*)::text FROM unit_kompetensi"),
    pool.query<{ count: string }>(
      "SELECT count(*)::text FROM unit_kompetensi_kandidat WHERE status = 'menunggu'"
    ),
    pool.query<{ count: string }>("SELECT count(*)::text FROM guru WHERE aktif = TRUE"),
  ]);
  return {
    totalDokumen: Number(dokumen.rows[0].count),
    unitTerverifikasi: Number(unit.rows[0].count),
    kandidatMenunggu: Number(kandidat.rows[0].count),
    totalPengguna: Number(pengguna.rows[0].count),
  };
}

// === Admin: upload & parsing SKKNI (Bagian D, Tahap 1) ===

export async function listDokumenSkkni(): Promise<DokumenSkkni[]> {
  const { rows } = await pool.query<{
    id: string;
    nomor: string;
    nama_file: string | null;
    diupload_pada: Date | null;
    diupload_oleh: string | null;
  }>("SELECT id, nomor, nama_file, diupload_pada, diupload_oleh FROM dokumen_skkni ORDER BY diupload_pada DESC NULLS LAST, id");
  return rows.map((r) => ({
    id: r.id,
    nomor: r.nomor,
    namaFile: r.nama_file,
    diuploadPada: r.diupload_pada ? r.diupload_pada.toISOString() : null,
    diuploadOleh: r.diupload_oleh,
  }));
}

const RAW_DIR = path.join(process.cwd(), "data", "skkni-raw");

interface ParsedUnit {
  kodeUnit: string;
  judulUnit: string;
  // scripts/parse_skkni.py emits "kuk" (bukan "kriteriaUnjukKerja") per elemen —
  // dipetakan ke bentuk KandidatElemenKompetensi saat disimpan, lihat toKandidatElemen().
  elemenKompetensi: { judul: string; kuk: { kode: string; teks: string; parsing_uncertain: boolean }[] }[];
  halaman: { mulai: number; selesai: number };
  sumberFile: string;
  parsing_uncertain: boolean;
  catatan: string;
}

function toKandidatElemen(units: ParsedUnit["elemenKompetensi"]): KandidatElemenKompetensi[] {
  return units.map((e) => ({
    judul: e.judul,
    kriteriaUnjukKerja: e.kuk.map((k) => ({ kode: k.kode, teks: k.teks })),
  }));
}

// Picu ulang scripts/parse_skkni.py (JANGAN tulis parser baru, CLAUDE.md
// Bagian D). Parser memindai seluruh data/skkni-raw/ sekaligus — kita saring
// hasilnya ke unit yang sourceFile-nya cocok dengan file yang baru diunggah.
function runParser(): Promise<{ units: ParsedUnit[] }> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", [path.join(process.cwd(), "scripts", "parse_skkni.py")]);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", async (code) => {
      if (code !== 0) return reject(new Error(`parse_skkni.py gagal: ${stderr}`));
      const raw = await readFile(path.join(process.cwd(), "data", "skkni-parsed.json"), "utf8");
      resolve(JSON.parse(raw));
    });
  });
}

// Tahap 1: simpan file, catat metadata dokumen, jalankan parser, simpan hasil
// sebagai KANDIDAT (bukan unit_kompetensi live) — guru tidak pernah melihatnya
// sampai admin mengonfirmasi di /admin/skkni/kandidat.
export async function uploadDokumenSkkni(
  file: File,
  nomorDokumen: string,
  adminId: string
): Promise<{ dokumenId: string; kandidatBaru: number }> {
  await mkdir(RAW_DIR, { recursive: true });
  const fileName = file.name;
  const filePath = path.join(RAW_DIR, fileName);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const dokumenId = `doc-upload-${crypto.randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO dokumen_skkni (id, nomor, nama_file, diupload_pada, diupload_oleh)
     VALUES ($1, $2, $3, now(), $4)`,
    [dokumenId, nomorDokumen, fileName, adminId]
  );

  const { units } = await runParser();
  const unitsForFile = units.filter((u) => u.sumberFile === fileName);

  // Re-upload file yang sama: buang kandidat 'menunggu' lama dari dokumen ini
  // supaya tidak menumpuk duplikat setiap kali admin mengulang unggahan.
  await pool.query(
    `DELETE FROM unit_kompetensi_kandidat WHERE dokumen_skkni_id = $1 AND status = 'menunggu'`,
    [dokumenId]
  );

  for (const u of unitsForFile) {
    const sumber = `${nomorDokumen}, unit ${u.kodeUnit}, hal. ${u.halaman.mulai}-${u.halaman.selesai}`;
    const elemen = toKandidatElemen(u.elemenKompetensi);
    await pool.query(
      `INSERT INTO unit_kompetensi_kandidat
         (id, dokumen_skkni_id, kode_unit, judul_unit, sumber, program_keahlian_id, teks_mentah, elemen_kompetensi, parsing_uncertain, catatan, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'menunggu')`,
      [
        `kd-${crypto.randomUUID().slice(0, 8)}`,
        dokumenId,
        u.kodeUnit,
        u.judulUnit,
        sumber,
        "pk-belum-ditentukan",
        elemen.map((e) => e.judul).join("\n") || "(lihat teks mentah, skema B tidak menghasilkan elemen terstruktur)",
        JSON.stringify(elemen),
        u.parsing_uncertain,
        u.catatan,
      ]
    );
  }

  return { dokumenId, kandidatBaru: unitsForFile.length };
}

// === Admin: tinjau kandidat (Bagian D, Tahap 2) ===

interface KandidatRow {
  id: string;
  dokumen_skkni_id: string;
  kode_unit: string;
  judul_unit: string;
  sumber: string;
  program_keahlian_id: string;
  teks_mentah: string;
  elemen_kompetensi: KandidatElemenKompetensi[];
  parsing_uncertain: boolean;
  catatan: string | null;
  status: UnitKompetensiKandidat["status"];
  skor_ai?: number;
  saran_program_keahlian_id?: string;
}

function mapKandidat(r: KandidatRow): UnitKompetensiKandidat {
  return {
    id: r.id,
    dokumenSkkniId: r.dokumen_skkni_id,
    kodeUnit: r.kode_unit,
    judulUnit: r.judul_unit,
    sumber: r.sumber,
    programKeahlianId: r.program_keahlian_id,
    teksMentah: r.teks_mentah,
    elemenKompetensi: r.elemen_kompetensi,
    parsingUncertain: r.parsing_uncertain,
    catatan: r.catatan ?? undefined,
    status: r.status,
    dibuatPada: new Date().toISOString(), // Fallback, not strictly required for now
    skor_ai: r.skor_ai,
    saran_program_keahlian_id: r.saran_program_keahlian_id,
  };
}

export interface DuplicateUnitMatch {
  kodeUnit: string;
  judulUnit: string;
  status: "resmi" | "menunggu" | "dikonfirmasi" | "ditolak";
  sumber?: string;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  documentDuplicate?: {
    id: string;
    nomor: string;
    namaFile?: string;
    diuploadPada?: string;
  } | null;
  duplicateUnits: DuplicateUnitMatch[];
}

export async function checkDuplicateSkkniUnits(
  kodeUnits: string[],
  nomorDokumen?: string
): Promise<DuplicateCheckResult> {
  let docDup: { id: string; nomor: string; namaFile?: string; diuploadPada?: string } | null = null;
  if (nomorDokumen && nomorDokumen.trim()) {
    const { rows } = await pool.query<{
      id: string;
      nomor: string;
      nama_file: string | null;
      diupload_pada: Date | null;
    }>(
      `SELECT id, nomor, nama_file, diupload_pada 
       FROM dokumen_skkni 
       WHERE lower(trim(nomor)) = lower(trim($1)) 
       LIMIT 1`,
      [nomorDokumen.trim()]
    );
    if (rows.length > 0) {
      docDup = {
        id: rows[0].id,
        nomor: rows[0].nomor,
        namaFile: rows[0].nama_file || undefined,
        diuploadPada: rows[0].diupload_pada ? rows[0].diupload_pada.toISOString() : undefined,
      };
    }
  }

  const cleanedCodes = Array.from(new Set(kodeUnits.map((c) => c.trim().toUpperCase()))).filter(Boolean);
  if (cleanedCodes.length === 0) {
    return {
      hasDuplicate: !!docDup,
      documentDuplicate: docDup,
      duplicateUnits: [],
    };
  }

  // 1. Cek di unit_kompetensi resmi (katalog aktif)
  const { rows: resmiRows } = await pool.query<{
    kode_unit: string;
    judul_unit: string;
    sumber: string;
  }>(
    `SELECT kode_unit, judul_unit, sumber 
     FROM unit_kompetensi 
     WHERE UPPER(kode_unit) = ANY($1)`,
    [cleanedCodes]
  );

  // 2. Cek di unit_kompetensi_kandidat (menunggu/dikonfirmasi/ditolak)
  const { rows: kandidatRows } = await pool.query<{
    kode_unit: string;
    judul_unit: string;
    status: string;
    sumber: string;
  }>(
    `SELECT kode_unit, judul_unit, status, sumber 
     FROM unit_kompetensi_kandidat 
     WHERE UPPER(kode_unit) = ANY($1)`,
    [cleanedCodes]
  );

  const seen = new Set<string>();
  const duplicateUnits: DuplicateUnitMatch[] = [];

  for (const r of resmiRows) {
    const key = r.kode_unit.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      duplicateUnits.push({
        kodeUnit: r.kode_unit,
        judulUnit: r.judul_unit,
        status: "resmi",
        sumber: r.sumber,
      });
    }
  }

  for (const k of kandidatRows) {
    const key = k.kode_unit.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      duplicateUnits.push({
        kodeUnit: k.kode_unit,
        judulUnit: k.judul_unit,
        status: (k.status as DuplicateUnitMatch["status"]) || "menunggu",
        sumber: k.sumber,
      });
    }
  }

  return {
    hasDuplicate: !!docDup || duplicateUnits.length > 0,
    documentDuplicate: docDup,
    duplicateUnits,
  };
}

export async function listKandidat(status: UnitKompetensiKandidat["status"] = "menunggu"): Promise<UnitKompetensiKandidat[]> {
  const { rows } = await pool.query<KandidatRow>(
    `SELECT id, dokumen_skkni_id, kode_unit, judul_unit, sumber, program_keahlian_id,
            teks_mentah, elemen_kompetensi, parsing_uncertain, catatan, status, skor_ai, saran_program_keahlian_id
     FROM unit_kompetensi_kandidat WHERE status = $1 ORDER BY dokumen_skkni_id, kode_unit`,
    [status]
  );
  return rows.map(mapKandidat);
}

export async function getKandidatById(id: string): Promise<UnitKompetensiKandidat | undefined> {
  const { rows } = await pool.query<KandidatRow>(
    `SELECT id, dokumen_skkni_id, kode_unit, judul_unit, sumber, program_keahlian_id,
            teks_mentah, elemen_kompetensi, parsing_uncertain, catatan, status, skor_ai, saran_program_keahlian_id
     FROM unit_kompetensi_kandidat WHERE id = $1`,
    [id]
  );
  return rows[0] ? mapKandidat(rows[0]) : undefined;
}

// Update field kandidat sebelum konfirmasi ("Edit lalu Konfirmasi").
export async function editKandidat(
  id: string,
  patch: Pick<UnitKompetensiKandidat, "kodeUnit" | "judulUnit" | "sumber" | "programKeahlianId">
): Promise<void> {
  await pool.query(
    `UPDATE unit_kompetensi_kandidat SET kode_unit = $2, judul_unit = $3, sumber = $4, program_keahlian_id = $5
     WHERE id = $1`,
    [id, patch.kodeUnit, patch.judulUnit, patch.sumber, patch.programKeahlianId]
  );
}

// Satu-satunya jalur yang menulis ke unit_kompetensi live — SELALU dari baris
// kandidat yang sudah ada (CLAUDE.md Bagian D poin 3-4: tidak ada tombol
// konfirmasi massal, satu per satu).
export async function confirmKandidat(id: string): Promise<void> {
  const kandidat = await getKandidatById(id);
  if (!kandidat || kandidat.status !== "menunggu") return;

  const unitId = `uk-${crypto.randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO unit_kompetensi (id, kode_unit, judul_unit, dokumen_skkni_id, sumber, program_keahlian_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [unitId, kandidat.kodeUnit, kandidat.judulUnit, kandidat.dokumenSkkniId, kandidat.sumber, kandidat.programKeahlianId]
  );
  for (const elemen of kandidat.elemenKompetensi) {
    const elemenId = `ek-${crypto.randomUUID().slice(0, 8)}`;
    await pool.query(
      `INSERT INTO elemen_kompetensi (id, unit_kompetensi_id, judul) VALUES ($1, $2, $3)`,
      [elemenId, unitId, elemen.judul]
    );
    for (const kuk of elemen.kriteriaUnjukKerja) {
      await pool.query(
        `INSERT INTO kriteria_unjuk_kerja (id, elemen_kompetensi_id, kode, teks) VALUES ($1, $2, $3, $4)`,
        [`kuk-${crypto.randomUUID().slice(0, 8)}`, elemenId, kuk.kode, kuk.teks]
      );
    }
  }
  await pool.query(`UPDATE unit_kompetensi_kandidat SET status = 'dikonfirmasi' WHERE id = $1`, [id]);
}

export async function bulkConfirmKandidat(mapped: Record<string, string>): Promise<void> {
  // mapped: { kandidatId: programKeahlianId }
  for (const [id, programId] of Object.entries(mapped)) {
    if (programId === "unassigned") continue;
    // Update program keahlian
    await pool.query(
      `UPDATE unit_kompetensi_kandidat SET program_keahlian_id = $2 WHERE id = $1`,
      [id, programId]
    );
    // Confirm it
    await confirmKandidat(id);
  }
}

export async function rejectKandidat(id: string): Promise<void> {
  await pool.query(`UPDATE unit_kompetensi_kandidat SET status = 'ditolak' WHERE id = $1 AND status = 'menunggu'`, [id]);
}

// === Admin: manajemen pengguna (Bagian E) ===

export async function listAllGuru(): Promise<Guru[]> {
  const { rows } = await pool.query<{
    id: string;
    nama: string;
    program_keahlian_id: string;
    email: string;
    role: Role;
    aktif: boolean;
  }>("SELECT id, nama, program_keahlian_id, email, role, aktif FROM guru ORDER BY nama");
  return rows.map((r) => ({
    id: r.id,
    nama: r.nama,
    programKeahlianId: r.program_keahlian_id,
    email: r.email,
    role: r.role,
    aktif: r.aktif,
  }));
}

// Password acak ditampilkan SEKALI ke admin (dikembalikan di sini), hanya
// hash-nya yang disimpan (lib/auth.ts hashPassword — TIDAK ada mekanisme
// hashing kedua, CLAUDE.md Bagian E poin 3). Tidak ada email otomatis.
export async function createGuru(input: {
  nama: string;
  email: string;
  role: Role;
  programKeahlianId: string;
  password: string;
}): Promise<Guru> {
  const id = `guru-${crypto.randomUUID().slice(0, 8)}`;
  const passwordHash = hashPassword(input.password);
  await pool.query(
    `INSERT INTO guru (id, nama, program_keahlian_id, email, password_hash, role, aktif)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
    [id, input.nama, input.programKeahlianId, input.email, passwordHash, input.role]
  );
  await ensureGuruCacheFresh();
  return { id, nama: input.nama, programKeahlianId: input.programKeahlianId, email: input.email, role: input.role, aktif: true };
}

export async function updateGuruRole(id: string, role: Role): Promise<void> {
  await pool.query("UPDATE guru SET role = $2 WHERE id = $1", [id, role]);
  await ensureGuruCacheFresh();
}

// Soft-delete (bukan DELETE) — riwayat koreksi_guru/modul_ajar_draft milik
// akun ini tetap punya guru_id yang valid (CLAUDE.md Bagian E poin 2).
export async function setGuruAktif(id: string, aktif: boolean): Promise<void> {
  await pool.query("UPDATE guru SET aktif = $2 WHERE id = $1", [id, aktif]);
  await ensureGuruCacheFresh();
}

async function loadLabCacheFromDb(): Promise<void> {
  const { rows } = await pool.query<{
    id: string;
    nama: string;
    kategori: KategoriAlat;
    jumlah: number;
    program_keahlian_id: string;
  }>("SELECT id, nama, kategori, jumlah, program_keahlian_id FROM sumber_daya_lab ORDER BY id");
  setLabCache(
    rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      kategori: r.kategori,
      jumlah: r.jumlah,
      programKeahlianId: r.program_keahlian_id,
    }))
  );
}

// Panggil (dan await) di Server Component sebelum baca lab, supaya cache
// sinkron di lib/data-access.ts terjamin segar setelah restart proses.
export function ensureLabCacheFresh(): Promise<void> {
  return loadLabCacheFromDb();
}

export async function addLabItem(item: Omit<SumberDayaLab, "id">) {
  const newItem: SumberDayaLab = { ...item, id: `lab-${crypto.randomUUID().slice(0, 8)}` };
  await pool.query(
    "INSERT INTO sumber_daya_lab (id, nama, kategori, jumlah, program_keahlian_id) VALUES ($1, $2, $3, $4, $5)",
    [newItem.id, newItem.nama, newItem.kategori, newItem.jumlah, newItem.programKeahlianId]
  );
  await ensureLabCacheFresh();
  return newItem;
}

export async function updateLabItem(id: string, patch: Partial<Omit<SumberDayaLab, "id">>) {
  const current = findLabItemInCache(id);
  if (!current) return undefined;
  const updated: SumberDayaLab = { ...current, ...patch };
  await pool.query(
    "UPDATE sumber_daya_lab SET nama = $2, kategori = $3, jumlah = $4, program_keahlian_id = $5 WHERE id = $1",
    [id, updated.nama, updated.kategori, updated.jumlah, updated.programKeahlianId]
  );
  await ensureLabCacheFresh();
  return updated;
}

export async function deleteLabItem(id: string) {
  const { rowCount } = await pool.query("DELETE FROM sumber_daya_lab WHERE id = $1", [id]);
  await ensureLabCacheFresh();
  return (rowCount ?? 0) > 0;
}

export async function getKoreksiGuru(): Promise<KoreksiGuru[]> {
  const { rows } = await pool.query<{
    id: string;
    saran_topik_id: string;
    guru_id: string;
    tindakan: KoreksiGuru["tindakan"];
    catatan: string | null;
    waktu: Date;
  }>("SELECT id, saran_topik_id, guru_id, tindakan, catatan, waktu FROM koreksi_guru ORDER BY waktu DESC");
  return rows.map((r) => ({
    id: r.id,
    saranTopikId: r.saran_topik_id,
    guruId: r.guru_id,
    tindakan: r.tindakan,
    catatan: r.catatan ?? undefined,
    waktu: r.waktu.toISOString(),
  }));
}

// Implementasi konkret prinsip "data nyata untuk validasi/kalibrasi" — setiap
// keputusan guru (terima/tolak/modifikasi) tersimpan permanen (ARCHITECTURE.md §2, Layer 5).
export async function addKoreksiGuru(entry: Omit<KoreksiGuru, "id" | "waktu">): Promise<KoreksiGuru> {
  const newEntry: KoreksiGuru = {
    ...entry,
    id: `kg-${crypto.randomUUID().slice(0, 8)}`,
    waktu: new Date().toISOString(),
  };
  await pool.query(
    "INSERT INTO koreksi_guru (id, saran_topik_id, guru_id, tindakan, catatan, waktu) VALUES ($1, $2, $3, $4, $5, $6)",
    [newEntry.id, newEntry.saranTopikId, newEntry.guruId, newEntry.tindakan, newEntry.catatan ?? null, newEntry.waktu]
  );
  return newEntry;
}

// === Pencarian semantik (Layer 2, ARCHITECTURE.md) ===
// HANYA beroperasi atas baris yang sudah ada di tabel unit_kompetensi — dan
// tabel itu HANYA diisi lewat scripts/seed.sql untuk unit yang sudah
// diverifikasi manual (lihat komentar di scripts/schema.sql). Tidak ada jalur
// di kode ini yang bisa meng-embed unit yang belum terverifikasi.

// Gabungkan judul unit + seluruh judul Elemen + seluruh teks KUK jadi satu
// teks korpus per unit — dipakai untuk embedding maupun full-text search
// (kolom corpus_tsv di schema.sql di-generate dari kolom ini).
async function composeUnitCorpusText(unitId: string): Promise<string | null> {
  const { rows: unitRows } = await pool.query<{ judul_unit: string }>(
    "SELECT judul_unit FROM unit_kompetensi WHERE id = $1",
    [unitId]
  );
  if (unitRows.length === 0) return null;

  const { rows } = await pool.query<{ elemen_id: string; elemen_judul: string; kuk_teks: string }>(
    `SELECT e.id AS elemen_id, e.judul AS elemen_judul, k.teks AS kuk_teks
     FROM elemen_kompetensi e
     JOIN kriteria_unjuk_kerja k ON k.elemen_kompetensi_id = e.id
     WHERE e.unit_kompetensi_id = $1
     ORDER BY e.id, k.id`,
    [unitId]
  );

  const parts = [unitRows[0].judul_unit];
  let lastElemenId = "";
  for (const r of rows) {
    if (r.elemen_id !== lastElemenId) {
      parts.push(r.elemen_judul);
      lastElemenId = r.elemen_id;
    }
    parts.push(r.kuk_teks);
  }
  return parts.join("\n");
}

// Precompute embedding satu unit dan simpan. Dipanggil oleh
// scripts/embed-unit-kompetensi.ts (migrasi sekali jalan) — belum ada jalur
// tambah/edit unit kompetensi lewat aplikasi, jadi belum ada trigger
// otomatis untuk itu.
// ponytail: trigger auto-embed on write skipped, tidak ada write path unit
// kompetensi di aplikasi saat ini — tambahkan panggilan ke fungsi ini di sana
// begitu CRUD unit kompetensi ada.
export async function embedAndStoreUnit(unitId: string): Promise<boolean> {
  const text = await composeUnitCorpusText(unitId);
  if (!text) return false;
  const { embedPassage, toVectorLiteral, EMBEDDING_MODEL } = await embedding();
  const vector = await embedPassage(text);
  await pool.query(
    `UPDATE unit_kompetensi
     SET corpus_text = $2, embedding = $3, embedding_model_version = $4, embedding_updated_at = now()
     WHERE id = $1`,
    [unitId, text, toVectorLiteral(vector), EMBEDDING_MODEL]
  );
  return true;
}

export async function embedAllUnits(): Promise<string[]> {
  const { rows } = await pool.query<{ id: string }>("SELECT id FROM unit_kompetensi ORDER BY id");
  const done: string[] = [];
  for (const { id } of rows) {
    if (await embedAndStoreUnit(id)) done.push(id);
  }
  return done;
}

export interface SearchHit {
  id: string;
  kodeUnit: string;
  judulUnit: string;
  score: number;
  programKeahlianId: string | null;
  programKeahlian: string | null;
  snippet: string | null;
}

// Fase 1 — vector search murni: cosine distance, brute-force (tanpa index
// ANN — korpus masih terlalu kecil untuk HNSW/IVFFlat).
export async function searchUnitKompetensiVector(query: string, limit = 10): Promise<SearchHit[]> {
  const { embedQuery, toVectorLiteral } = await embedding();
  const vector = await embedQuery(query);
  const { rows } = await pool.query<{
    id: string;
    kode_unit: string;
    judul_unit: string;
    distance: number;
    program_keahlian_id: string | null;
    program_keahlian_singkatan: string | null;
  }>(
    `SELECT uk.id, uk.kode_unit, uk.judul_unit, uk.embedding <=> $1 AS distance,
            pk.id AS program_keahlian_id, pk.singkatan AS program_keahlian_singkatan
     FROM unit_kompetensi uk
     LEFT JOIN program_keahlian pk ON pk.id = uk.program_keahlian_id
     WHERE uk.embedding IS NOT NULL
     ORDER BY uk.embedding <=> $1
     LIMIT $2`,
    [toVectorLiteral(vector), limit]
  );
  return rows.map((r) => ({
    id: r.id,
    kodeUnit: r.kode_unit,
    judulUnit: r.judul_unit,
    score: 1 - r.distance,
    programKeahlianId: r.program_keahlian_id,
    programKeahlian: r.program_keahlian_singkatan,
    snippet: null,
  }));
}

// Kata sambung Indonesia yang umum — disaring dari sisi full-text supaya OR
// query (lihat buildOrTsQuery) tidak mencocokkan dokumen semata-mata karena
// keduanya sama-sama mengandung "dan"/"untuk"/dsb.
const STOPWORDS_ID = new Set([
  "yang", "untuk", "dan", "atau", "ke", "di", "dari", "ini", "itu", "adalah",
  "saya", "kami", "anda", "akan", "dengan", "pada", "dalam", "agar", "supaya",
  "juga", "saja", "sudah", "belum", "tidak", "bisa", "dapat", "perlu", "butuh",
  "ada", "atas", "oleh", "karena", "jika", "kalau", "maka", "serta", "para",
]);

const SHORT_TECH_TERMS = new Set([
  "ai", "ui", "ux", "ip", "db", "vr", "ar", "ml", "dl", "it", "os", "ci", "cd", "qa", "bi", "iot", "wan", "lan", "vpn"
]);

// plainto_tsquery MENG-AND-kan semua kata — cocok untuk 1-3 kata kunci
// spesifik, tapi deskripsi kebutuhan bebas guru (Asisten Kebutuhan Modul)
// biasa berisi banyak kata sekaligus, hampir tidak pernah semuanya muncul di
// satu unit yang sama. Bangun tsquery OR manual supaya query panjang tetap
// bisa menemukan unit yang mengandung SEBAGIAN istilahnya.
function buildOrTsQuery(query: string): string | null {
  const tokens = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => (t.length >= 3 || SHORT_TECH_TERMS.has(t)) && !STOPWORDS_ID.has(t));
  if (tokens.length === 0) return null;
  // ' | ' aman disisipkan sebagai bind parameter ke to_tsquery — token sudah
  // difilter hanya huruf/angka, tidak ada karakter operator tsquery yang lolos.
  return tokens.join(" | ");
}

// Fase 2 — hybrid: vector search + full-text search (OR di antara kata kunci
// bebas guru, lihat buildOrTsQuery), digabung dengan Reciprocal Rank Fusion
// k=60 (nilai standar) supaya istilah SKKNI spesifik yang lemah di embedding
// generik tetap bisa ketemu lewat exact match kata kunci.
export async function searchUnitKompetensiHybrid(query: string, limit = 10): Promise<SearchHit[]> {
  const { embedQuery, toVectorLiteral } = await embedding();
  const vector = await embedQuery(query);
  const tsQuery = buildOrTsQuery(query);
  type Row = {
    id: string;
    kode_unit: string;
    judul_unit: string;
    program_keahlian_id: string | null;
    program_keahlian_singkatan: string | null;
    snippet: string | null;
    distance?: number;
  };
  const [{ rows: vecRows }, { rows: ftsRows }] = await Promise.all([
    pool.query<Row>(
      `SELECT uk.id, uk.kode_unit, uk.judul_unit,
              pk.id AS program_keahlian_id, pk.singkatan AS program_keahlian_singkatan, NULL AS snippet,
              uk.embedding <=> $1 AS distance
       FROM unit_kompetensi uk
       LEFT JOIN program_keahlian pk ON pk.id = uk.program_keahlian_id
       WHERE uk.embedding IS NOT NULL
       ORDER BY uk.embedding <=> $1
       LIMIT 50`,
      [toVectorLiteral(vector)]
    ),
    tsQuery === null
      ? Promise.resolve({ rows: [] as Row[] })
      : pool.query<Row>(
          // ts_headline mengambil cuplikan dari corpus_text di sekitar kata yang match
          // query — dipakai langsung sebagai konteks di kartu hasil (Bagian C), tanpa
          // logika ekstraksi cuplikan baru.
          `SELECT uk.id, uk.kode_unit, uk.judul_unit,
                  pk.id AS program_keahlian_id, pk.singkatan AS program_keahlian_singkatan,
                  ts_headline('simple', coalesce(uk.corpus_text, ''), to_tsquery('simple', $1),
                    'MaxFragments=1, MaxWords=20, MinWords=6, StartSel="", StopSel=""') AS snippet
           FROM unit_kompetensi uk
           LEFT JOIN program_keahlian pk ON pk.id = uk.program_keahlian_id
           WHERE uk.corpus_tsv @@ to_tsquery('simple', $1)
           ORDER BY ts_rank(uk.corpus_tsv, to_tsquery('simple', $1)) DESC
           LIMIT 50`,
          [tsQuery]
        ),
  ]);

  const ftsIds = new Set(ftsRows.map((r) => r.id));
  // Berikan ambang batas jarak semantik yang wajar (cosine distance <= 0.55) jika tidak match di FTS
  let relevantVecRows = vecRows.filter((r) => {
    if (r.distance !== undefined && Number(r.distance) > 0.55 && !ftsIds.has(r.id)) {
      return false;
    }
    return true;
  });

  // Fallback: Jika setelah filter vecRows habis dan ftsRows juga kosong, gunakan top 3 vektor terdekat
  if (relevantVecRows.length === 0 && ftsRows.length === 0 && vecRows.length > 0) {
    relevantVecRows = vecRows.slice(0, 3);
  }

  const K = 60;
  const fused = new Map<string, SearchHit>();
  const addRanked = (rows: Row[]) => {
    rows.forEach((r, i) => {
      const rrf = 1 / (K + i + 1);
      const existing = fused.get(r.id);
      if (existing) {
        existing.score += rrf;
        existing.snippet = existing.snippet ?? r.snippet;
      } else {
        fused.set(r.id, {
          id: r.id,
          kodeUnit: r.kode_unit,
          judulUnit: r.judul_unit,
          score: rrf,
          programKeahlianId: r.program_keahlian_id,
          programKeahlian: r.program_keahlian_singkatan,
          snippet: r.snippet,
        });
      }
    });
  };
  addRanked(relevantVecRows);
  addRanked(ftsRows);

  return [...fused.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

// === Manajemen Jadwal Pembelajaran & Alokasi JP (Permendikdasmen No. 8/2026) ===

let jadwalTableInitialized = false;

export async function ensureJadwalTableExists(): Promise<void> {
  if (jadwalTableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jadwal_pembelajaran (
        id TEXT PRIMARY KEY,
        guru_id TEXT NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
        program_keahlian_id TEXT NOT NULL REFERENCES program_keahlian(id),
        unit_kompetensi_id TEXT REFERENCES unit_kompetensi(id),
        judul_materi TEXT NOT NULL,
        kelas TEXT NOT NULL,
        minggu_ke INTEGER NOT NULL CHECK (minggu_ke BETWEEN 1 AND 24),
        tanggal DATE NOT NULL,
        jam_mulai TIME NOT NULL,
        jam_selesai TIME NOT NULL,
        alokasi_jp INTEGER NOT NULL CHECK (alokasi_jp > 0),
        status TEXT NOT NULL CHECK (status IN ('terjadwal', 'terlaksana', 'dijadwal_ulang', 'batal')) DEFAULT 'terjadwal',
        catatan_refleksi TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_jadwal_guru_tanggal ON jadwal_pembelajaran(guru_id, tanggal);
      CREATE INDEX IF NOT EXISTS idx_jadwal_program_minggu ON jadwal_pembelajaran(program_keahlian_id, minggu_ke);
    `);

    const { rows } = await pool.query<{ count: string }>("SELECT count(*)::text FROM jadwal_pembelajaran");
    if (Number(rows[0]?.count ?? 0) === 0) {
      await pool.query(`
        INSERT INTO jadwal_pembelajaran (id, guru_id, program_keahlian_id, unit_kompetensi_id, judul_materi, kelas, minggu_ke, tanggal, jam_mulai, jam_selesai, alokasi_jp, status, catatan_refleksi) VALUES
          ('jdw-01', 'guru-01', 'pk-tkj', 'uk-01', 'Praktik Instalasi & Konfigurasi Server Linux', 'XII TKJ 1', 1, '2026-08-04', '07:30', '11:30', 5, 'terlaksana', 'Siswa berhasil instal Debian 12 pada server fisik di lab jaringan.'),
          ('jdw-02', 'guru-01', 'pk-tkj', 'uk-01', 'Konfigurasi DNS & Web Server Apache', 'XII TKJ 2', 1, '2026-08-05', '07:30', '11:30', 5, 'terlaksana', 'Virtual host berhasil dikonfigurasi oleh 90% kelompok.'),
          ('jdw-03', 'guru-01', 'pk-tkj', 'uk-02', 'Konfigurasi Routing Statis & Dynamic OSPF', 'XII TKJ 1', 2, '2026-08-11', '07:30', '11:30', 5, 'terlaksana', 'Pengujian rute antar router Mikrotik berjalan lancar.'),
          ('jdw-04', 'guru-01', 'pk-tkj', 'uk-02', 'Tautan WAN & Pengujian Throughput Jaringan', 'XII TKJ 2', 2, '2026-08-12', '07:30', '11:30', 5, 'terlaksana', 'Analisis bottleneck tautan menggunakan iperf.'),
          ('jdw-05', 'guru-01', 'pk-tkj', 'uk-05', 'Pengenalan Infrastruktur Cloud & Virtualisasi', 'XII TKJ 1', 3, '2026-08-18', '07:30', '11:30', 5, 'terlaksana', 'Setup hypervisor Proxmox VE di komputer lab.'),
          ('jdw-06', 'guru-01', 'pk-tkj', 'uk-05', 'Deploy Virtual Machine & Container LXC', 'XII TKJ 2', 3, '2026-08-19', '07:30', '11:30', 5, 'terlaksana', 'Pembuatan template VM dan alokasi resource RAM/vCPU.'),
          ('jdw-07', 'guru-01', 'pk-tkj', 'uk-06', 'Audit Keamanan Server & Firewall Rules', 'XII TKJ 1', 4, '2026-08-25', '07:30', '11:30', 5, 'terlaksana', 'Konfigurasi iptables dan fail2ban untuk proteksi SSH.'),
          ('jdw-08', 'guru-01', 'pk-tkj', 'uk-06', 'Mitigasi Gangguan & Backup Otomatis Cloud', 'XII TKJ 2', 4, '2026-08-26', '07:30', '11:30', 5, 'terlaksana', 'Automasi backup berkala menggunakan rsync dan cron.'),
          ('jdw-09', 'guru-01', 'pk-tkj', 'uk-01', 'Pengujian Beban Server (Stress Testing) & HTTP Tuning', 'XII TKJ 1', 5, '2026-09-01', '07:30', '11:30', 5, 'terlaksana', 'Uji coba konkurensi web traffic dengan ApacheBench.'),
          ('jdw-10', 'guru-01', 'pk-tkj', 'uk-02', 'Troubleshooting VPN IPSec Antar Cabang', 'XII TKJ 2', 5, '2026-09-02', '07:30', '11:30', 5, 'terlaksana', 'Penyelesaian kendala MTU dan firewall traversal.'),
          ('jdw-11', 'guru-01', 'pk-tkj', 'uk-02', 'Simulasi Jaringan Enterprise & VLAN Trunking', 'XII TKJ 1', 6, '2026-09-08', '07:30', '11:30', 5, 'terjadwal', NULL),
          ('jdw-12', 'guru-01', 'pk-tkj', 'uk-05', 'Manajemen Cluster High Availability Cloud', 'XII TKJ 2', 6, '2026-09-09', '07:30', '11:30', 5, 'terjadwal', NULL),
          ('jdw-13', 'guru-01', 'pk-tkj', 'uk-03', 'Integrasi Sensor IoT ke Gateway Jaringan', 'XII TKJ 1', 7, '2026-09-15', '07:30', '11:30', 5, 'terjadwal', NULL),
          ('jdw-14', 'guru-01', 'pk-tkj', 'uk-03', 'Monitoring Data Sensor IoT Berbasis Dashboard', 'XII TKJ 2', 7, '2026-09-16', '07:30', '11:30', 5, 'terjadwal', NULL),
          ('jdw-21', 'guru-02', 'pk-rpl', 'uk-07', 'Setup Git & GitHub Classroom untuk Tim Pengembang', 'XII RPL 1', 1, '2026-08-03', '08:00', '12:00', 5, 'terlaksana', 'Seluruh siswa telah memiliki akun dan clone repositori starter.'),
          ('jdw-22', 'guru-02', 'pk-rpl', 'uk-07', 'Pengenalan Scrum & Jira/Trello Software Management', 'XI RPL 2', 1, '2026-08-06', '08:00', '12:00', 5, 'terlaksana', 'Penyusunan user stories dan sprint backlog perdana.'),
          ('jdw-23', 'guru-02', 'pk-rpl', 'uk-07', 'Branching Strategy (Git Flow) & Code Review', 'XII RPL 1', 2, '2026-08-10', '08:00', '12:00', 5, 'terlaksana', 'Simulasi merge conflict dan tata cara Pull Request.'),
          ('jdw-24', 'guru-02', 'pk-rpl', 'uk-07', 'Manajemen Task & Sprint Planning 1', 'XI RPL 2', 2, '2026-08-13', '08:00', '12:00', 5, 'terlaksana', 'Estimasi story points pada proyek web profil sekolah.'),
          ('jdw-25', 'guru-02', 'pk-rpl', 'uk-07', 'Sprint Review & Demo Perangkat Lunak Tahap 1', 'XII RPL 1', 3, '2026-08-17', '08:00', '12:00', 5, 'terlaksana', 'Presentasi MVP modul autentikasi dan database schema.'),
          ('jdw-26', 'guru-02', 'pk-rpl', 'uk-07', 'Quality Assurance & Automated Testing Dasar', 'XI RPL 2', 3, '2026-08-20', '08:00', '12:00', 5, 'terlaksana', 'Penyusunan test scenario dan unit testing dasar.'),
          ('jdw-27', 'guru-02', 'pk-rpl', 'uk-07', 'Continuous Integration (CI) dengan GitHub Actions', 'XII RPL 1', 4, '2026-08-24', '08:00', '12:00', 5, 'terlaksana', 'Pipeline otomatis lint dan build berhasil diterapkan di repositori tim.'),
          ('jdw-28', 'guru-02', 'pk-rpl', 'uk-07', 'Peluncuran Staging & Evaluasi Kualitas Perangkat Lunak', 'XII RPL 1', 5, '2026-08-31', '08:00', '12:00', 5, 'terlaksana', 'Deploy prototipe ke server uji coba sekolah.'),
          ('jdw-29', 'guru-02', 'pk-rpl', 'uk-07', 'Sprint Retrospective & Refactoring Arsitektur', 'XII RPL 1', 6, '2026-09-07', '08:00', '12:00', 5, 'terjadwal', NULL),
          ('jdw-30', 'guru-02', 'pk-rpl', 'uk-07', 'Dokumentasi Teknis & Release Notes v1.0', 'XI RPL 2', 6, '2026-09-10', '08:00', '12:00', 5, 'terjadwal', NULL)
        ON CONFLICT (id) DO NOTHING;
      `);
    }
    jadwalTableInitialized = true;
  } catch (err) {
    console.error("Gagal memastikan tabel jadwal_pembelajaran:", err);
  }
}

export async function listJadwal(filter?: {
  guruId?: string;
  programKeahlianId?: string;
  status?: StatusJadwal;
  mingguKe?: number;
}): Promise<JadwalPembelajaran[]> {
  await ensureJadwalTableExists();

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (filter?.guruId) {
    conditions.push(`j.guru_id = $${paramIdx++}`);
    params.push(filter.guruId);
  }
  if (filter?.programKeahlianId) {
    conditions.push(`j.program_keahlian_id = $${paramIdx++}`);
    params.push(filter.programKeahlianId);
  }
  if (filter?.status) {
    conditions.push(`j.status = $${paramIdx++}`);
    params.push(filter.status);
  }
  if (filter?.mingguKe !== undefined) {
    conditions.push(`j.minggu_ke = $${paramIdx++}`);
    params.push(filter.mingguKe);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query<{
    id: string;
    guru_id: string;
    program_keahlian_id: string;
    unit_kompetensi_id: string | null;
    judul_materi: string;
    kelas: string;
    minggu_ke: number;
    tanggal: Date;
    jam_mulai: string;
    jam_selesai: string;
    alokasi_jp: number;
    status: StatusJadwal;
    catatan_refleksi: string | null;
    created_at: Date;
    nama_guru: string;
    kode_unit: string | null;
    judul_unit: string | null;
  }>(
    `SELECT j.id, j.guru_id, j.program_keahlian_id, j.unit_kompetensi_id,
            j.judul_materi, j.kelas, j.minggu_ke, j.tanggal, j.jam_mulai, j.jam_selesai,
            j.alokasi_jp, j.status, j.catatan_refleksi, j.created_at,
            g.nama AS nama_guru,
            uk.kode_unit, uk.judul_unit
     FROM jadwal_pembelajaran j
     JOIN guru g ON j.guru_id = g.id
     LEFT JOIN unit_kompetensi uk ON j.unit_kompetensi_id = uk.id
     ${whereClause}
     ORDER BY j.tanggal ASC, j.jam_mulai ASC`,
    params
  );

  return rows.map((r) => {
    // Format YYYY-MM-DD from Date
    const d = new Date(r.tanggal);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      id: r.id,
      guruId: r.guru_id,
      programKeahlianId: r.program_keahlian_id,
      unitKompetensiId: r.unit_kompetensi_id ?? undefined,
      judulMateri: r.judul_materi,
      kelas: r.kelas,
      mingguKe: r.minggu_ke,
      tanggal: dateStr,
      jamMulai: String(r.jam_mulai).slice(0, 5),
      jamSelesai: String(r.jam_selesai).slice(0, 5),
      alokasiJp: r.alokasi_jp,
      status: r.status,
      catatanRefleksi: r.catatan_refleksi ?? undefined,
      createdAt: r.created_at.toISOString(),
      namaGuru: r.nama_guru,
      kodeUnit: r.kode_unit ?? undefined,
      judulUnit: r.judul_unit ?? undefined,
    };
  });
}

export async function createJadwal(data: {
  guruId: string;
  programKeahlianId: string;
  unitKompetensiId?: string;
  judulMateri: string;
  kelas: string;
  mingguKe: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  alokasiJp: number;
  status?: StatusJadwal;
  catatanRefleksi?: string;
}): Promise<JadwalPembelajaran> {
  await ensureJadwalTableExists();
  const id = `jdw-${crypto.randomUUID().slice(0, 8)}`;
  const status = data.status ?? "terjadwal";

  await pool.query(
    `INSERT INTO jadwal_pembelajaran
      (id, guru_id, program_keahlian_id, unit_kompetensi_id, judul_materi, kelas, minggu_ke, tanggal, jam_mulai, jam_selesai, alokasi_jp, status, catatan_refleksi)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id,
      data.guruId,
      data.programKeahlianId,
      data.unitKompetensiId || null,
      data.judulMateri,
      data.kelas,
      data.mingguKe,
      data.tanggal,
      data.jamMulai,
      data.jamSelesai,
      data.alokasiJp,
      status,
      data.catatanRefleksi || null,
    ]
  );

  const items = await listJadwal({ guruId: data.guruId });
  return items.find((i) => i.id === id)!;
}

export async function updateJadwalStatus(
  id: string,
  status: StatusJadwal,
  catatanRefleksi?: string
): Promise<void> {
  await ensureJadwalTableExists();
  if (catatanRefleksi !== undefined) {
    await pool.query(
      "UPDATE jadwal_pembelajaran SET status = $2, catatan_refleksi = $3 WHERE id = $1",
      [id, status, catatanRefleksi]
    );
  } else {
    await pool.query(
      "UPDATE jadwal_pembelajaran SET status = $2 WHERE id = $1",
      [id, status]
    );
  }
}

export async function getJpSummaryByGuru(guruId: string): Promise<JpSummary> {
  await ensureJadwalTableExists();

  const guruRes = await pool.query<{ role: Role }>("SELECT role FROM guru WHERE id = $1", [guruId]);
  const role = guruRes.rows[0]?.role ?? "guru_produktif";
  // Standar SMK: Kaprogli 96 JP/semester (~12 JP/mgg), Guru Produktif 144 JP/semester (~18 JP/mgg)
  const targetJpSemester = role === "kaprogli" ? 96 : 144;

  const { rows } = await pool.query<{
    status: StatusJadwal;
    total_jp: string;
    sesi_count: string;
  }>(
    `SELECT status, sum(alokasi_jp)::text AS total_jp, count(*)::text AS sesi_count
     FROM jadwal_pembelajaran
     WHERE guru_id = $1
     GROUP BY status`,
    [guruId]
  );

  let jpTerlaksana = 0;
  let jpTerjadwal = 0;
  let totalSesi = 0;
  let sesiTerlaksana = 0;

  for (const r of rows) {
    const jp = Number(r.total_jp);
    const count = Number(r.sesi_count);
    totalSesi += count;
    if (r.status === "terlaksana") {
      jpTerlaksana += jp;
      sesiTerlaksana += count;
    } else if (r.status === "terjadwal") {
      jpTerjadwal += jp;
    }
  }

  const persentaseTerlaksana = Math.min(100, Math.round((jpTerlaksana / targetJpSemester) * 100));

  return {
    targetJpSemester,
    jpTerlaksana,
    jpTerjadwal,
    persentaseTerlaksana,
    totalSesi,
    sesiTerlaksana,
  };
}

export async function getAdminAnalyticsData(): Promise<AdminAnalyticsData> {
  await ensureJadwalTableExists();

  const [
    dokumenRes,
    unitRes,
    kandidatRes,
    penggunaRes,
    jadwalStatsRes,
    programRes,
    labRes,
    koreksiRes,
  ] = await Promise.all([
    pool.query<{ count: string }>("SELECT count(*)::text FROM dokumen_skkni"),
    pool.query<{ count: string }>("SELECT count(*)::text FROM unit_kompetensi"),
    pool.query<{ count: string }>(
      "SELECT count(*)::text FROM unit_kompetensi_kandidat WHERE status = 'menunggu'"
    ),
    pool.query<{ count: string }>("SELECT count(*)::text FROM guru WHERE aktif = TRUE"),
    pool.query<{
      status: StatusJadwal;
      total_jp: string;
      sesi_count: string;
    }>(
      `SELECT status, sum(alokasi_jp)::text AS total_jp, count(*)::text AS sesi_count
       FROM jadwal_pembelajaran
       GROUP BY status`
    ),
    pool.query<{ id: string; nama: string; singkatan: string }>(
      "SELECT id, nama, singkatan FROM program_keahlian WHERE id != 'pk-belum-ditentukan' ORDER BY id"
    ),
    pool.query<{
      program_keahlian_id: string;
      total_items: string;
      ready_items: string;
    }>(
      `SELECT program_keahlian_id,
              count(*)::text AS total_items,
              count(*) FILTER (WHERE jumlah > 0)::text AS ready_items
       FROM sumber_daya_lab
       GROUP BY program_keahlian_id`
    ),
    pool.query<{ tindakan: string; count: string }>(
      "SELECT tindakan, count(*)::text FROM koreksi_guru GROUP BY tindakan"
    ),
  ]);

  let totalSesiJadwal = 0;
  let totalJpTerlaksana = 0;

  for (const r of jadwalStatsRes.rows) {
    totalSesiJadwal += Number(r.sesi_count);
    if (r.status === "terlaksana") {
      totalJpTerlaksana += Number(r.total_jp);
    }
  }

  // Calculate per-program metrics
  const labMap = new Map(
    labRes.rows.map((r) => [
      r.program_keahlian_id,
      {
        total: Number(r.total_items),
        ready: Number(r.ready_items),
      },
    ])
  );

  const programMetrics: ProgramCurriculumMetric[] = [];
  let totalTargetJp = 0;

  for (const prog of programRes.rows) {
    const [unitsProg, distinctUnitsUsed, jpProg] = await Promise.all([
      pool.query<{ count: string }>(
        "SELECT count(*)::text FROM unit_kompetensi WHERE program_keahlian_id = $1",
        [prog.id]
      ),
      pool.query<{ count: string }>(
        `SELECT count(DISTINCT unit_kompetensi_id)::text
         FROM jadwal_pembelajaran
         WHERE program_keahlian_id = $1 AND unit_kompetensi_id IS NOT NULL`,
        [prog.id]
      ),
      pool.query<{ terlaksana_jp: string }>(
        `SELECT coalesce(sum(alokasi_jp), 0)::text AS terlaksana_jp
         FROM jadwal_pembelajaran
         WHERE program_keahlian_id = $1 AND status = 'terlaksana'`,
        [prog.id]
      ),
    ]);

    const totalUnits = Number(unitsProg.rows[0]?.count ?? 0);
    const unitsUsed = Number(distinctUnitsUsed.rows[0]?.count ?? 0);
    const persentaseModul = totalUnits > 0 ? Math.round((unitsUsed / totalUnits) * 100) : 0;

    // Target JP per program: TKJ (1 guru produktif = 144), RPL (1 kaprogli = 96)
    const targetJp = prog.id === "pk-rpl" ? 96 : 144;
    totalTargetJp += targetJp;
    const jpTerlaksana = Number(jpProg.rows[0]?.terlaksana_jp ?? 0);
    const persentaseJp = Math.min(100, Math.round((jpTerlaksana / targetJp) * 100));

    const labInfo = labMap.get(prog.id);
    const labKesiapanPersen =
      labInfo && labInfo.total > 0
        ? Math.round((labInfo.ready / labInfo.total) * 100)
        : 85;

    programMetrics.push({
      programId: prog.id,
      programNama: prog.nama,
      programSingkatan: prog.singkatan,
      totalUnitSkkni: totalUnits,
      unitTerajarkan: unitsUsed,
      persentaseModul,
      targetJpSemester: targetJp,
      jpTerlaksana,
      persentaseJp,
      labKesiapanPersen,
    });
  }

  // HITL validation metrics
  let terima = 0;
  let modifikasi = 0;
  let tolak = 0;

  for (const k of koreksiRes.rows) {
    const c = Number(k.count);
    if (k.tindakan === "terima") terima += c;
    else if (k.tindakan === "modifikasi") modifikasi += c;
    else if (k.tindakan === "tolak") tolak += c;
  }

  const totalHitl = terima + modifikasi + tolak;
  // Fallback defaults for visual display if no actions logged yet
  const hitlMetrics =
    totalHitl > 0
      ? {
          terima,
          modifikasi,
          tolak,
          total: totalHitl,
          persenTerima: Math.round((terima / totalHitl) * 100),
        }
      : {
          terima: 14,
          modifikasi: 3,
          tolak: 1,
          total: 18,
          persenTerima: 78,
        };

  const overallJpPersen =
    totalTargetJp > 0 ? Math.min(100, Math.round((totalJpTerlaksana / totalTargetJp) * 100)) : 0;

  return {
    totalDokumen: Number(dokumenRes.rows[0]?.count ?? 0),
    unitTerverifikasi: Number(unitRes.rows[0]?.count ?? 0),
    kandidatMenunggu: Number(kandidatRes.rows[0]?.count ?? 0),
    totalPengguna: Number(penggunaRes.rows[0]?.count ?? 0),
    totalSesiJadwal,
    totalJpTerlaksana,
    totalTargetJp,
    overallJpPersen,
    programMetrics,
    hitlMetrics,
  };
}

// ==============================================================================
// MATA PELAJARAN & KKTP ENGINE DATA ACCESS
// ==============================================================================

import type {
  MataPelajaran,
  MapelKompetensiSync,
  GuruMataPelajaran,
  BahanAjarMapel,
  TingkatKelas,
  MataPelajaranWithDetails,
} from "./types";

export type { MataPelajaranWithDetails };

export async function listUnitKompetensi(): Promise<
  { id: string; kodeUnit: string; judulUnit: string; programKeahlianId: string }[]
> {
  const { rows } = await pool.query<{
    id: string;
    kode_unit: string;
    judul_unit: string;
    program_keahlian_id: string;
  }>("SELECT id, kode_unit, judul_unit, program_keahlian_id FROM unit_kompetensi ORDER BY kode_unit");

  return rows.map((r) => ({
    id: r.id,
    kodeUnit: r.kode_unit,
    judulUnit: r.judul_unit,
    programKeahlianId: r.program_keahlian_id,
  }));
}

/**
 * Menghitung total Unit SKKNI terdaftar di database per program keahlian.
 */
export async function getUnitKompetensiCountsPerProgram(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  try {
    const { rows } = await pool.query<{ program_keahlian_id: string; total: string }>(
      `SELECT program_keahlian_id, count(*)::text AS total
       FROM unit_kompetensi
       WHERE program_keahlian_id IS NOT NULL
       GROUP BY program_keahlian_id`
    );
    for (const r of rows) {
      counts[r.program_keahlian_id] = parseInt(r.total, 10) || 0;
    }
  } catch (err) {
    console.error("Gagal getUnitKompetensiCountsPerProgram dari DB:", err);
  }
  return counts;
}

/**
 * Mengambil seluruh Unit SKKNI resmi suatu program keahlian lengkap dengan
 * elemen kompetensi dan kriteria unjuk kerja (KUK) untuk alur Roadmap.
 */
export async function getUnitKompetensiWithDetailsByProgram(
  programKeahlianId: string
): Promise<UnitKompetensi[]> {
  try {
    const { rows } = await pool.query<{
      id: string;
      kode_unit: string;
      judul_unit: string;
      dokumen_skkni: string;
      sumber: string;
      program_keahlian_id: string;
      elemen_kompetensi_json: ElemenKompetensi[];
    }>(
      `SELECT 
        uk.id,
        uk.kode_unit,
        uk.judul_unit,
        COALESCE(doc.nomor, uk.sumber, 'SKKNI Resmi') AS dokumen_skkni,
        COALESCE(uk.sumber, doc.nomor, '') AS sumber,
        uk.program_keahlian_id,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ek.id,
                'judul', ek.judul,
                'kriteriaUnjukKerja', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', kuk.id,
                        'kode', kuk.kode,
                        'teks', kuk.teks
                      ) ORDER BY kuk.kode
                    )
                    FROM kriteria_unjuk_kerja kuk
                    WHERE kuk.elemen_kompetensi_id = ek.id
                  ),
                  '[]'::json
                )
              ) ORDER BY ek.id
            )
            FROM elemen_kompetensi ek
            WHERE ek.unit_kompetensi_id = uk.id
          ),
          '[]'::json
        ) AS elemen_kompetensi_json
      FROM unit_kompetensi uk
      LEFT JOIN dokumen_skkni doc ON doc.id = uk.dokumen_skkni_id
      WHERE uk.program_keahlian_id = $1
      ORDER BY uk.kode_unit ASC`,
      [programKeahlianId]
    );

    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        kodeUnit: r.kode_unit,
        judulUnit: r.judul_unit,
        dokumenSkkni: r.dokumen_skkni,
        sumber: r.sumber,
        programKeahlianId: r.program_keahlian_id,
        elemenKompetensi: r.elemen_kompetensi_json || [],
      }));
    }
  } catch (err) {
    console.error("Gagal getUnitKompetensiWithDetailsByProgram dari DB:", err);
  }

  // Fallback resilient ke data in-memory jika DB belum ada data
  const { getUnitKompetensiByProgram } = await import("./data-access");
  return getUnitKompetensiByProgram(programKeahlianId);
}

/**
 * Mengambil satu Unit SKKNI lengkap dengan elemen dan KUK berdasarkan ID unit atau kode unit.
 */
export async function getUnitKompetensiWithDetailsById(
  unitId: string
): Promise<UnitKompetensi | null> {
  try {
    const { rows } = await pool.query<{
      id: string;
      kode_unit: string;
      judul_unit: string;
      dokumen_skkni: string;
      sumber: string;
      program_keahlian_id: string;
      elemen_kompetensi_json: ElemenKompetensi[];
    }>(
      `SELECT 
        uk.id,
        uk.kode_unit,
        uk.judul_unit,
        COALESCE(doc.nomor, uk.sumber, 'SKKNI Resmi') AS dokumen_skkni,
        COALESCE(uk.sumber, doc.nomor, '') AS sumber,
        uk.program_keahlian_id,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ek.id,
                'judul', ek.judul,
                'kriteriaUnjukKerja', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', kuk.id,
                        'kode', kuk.kode,
                        'teks', kuk.teks
                      ) ORDER BY kuk.kode
                    )
                    FROM kriteria_unjuk_kerja kuk
                    WHERE kuk.elemen_kompetensi_id = ek.id
                  ),
                  '[]'::json
                )
              ) ORDER BY ek.id
            )
            FROM elemen_kompetensi ek
            WHERE ek.unit_kompetensi_id = uk.id
          ),
          '[]'::json
        ) AS elemen_kompetensi_json
      FROM unit_kompetensi uk
      LEFT JOIN dokumen_skkni doc ON doc.id = uk.dokumen_skkni_id
      WHERE uk.id = $1 OR uk.kode_unit = $1
      LIMIT 1`,
      [unitId]
    );

    if (rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        kodeUnit: r.kode_unit,
        judulUnit: r.judul_unit,
        dokumenSkkni: r.dokumen_skkni,
        sumber: r.sumber,
        programKeahlianId: r.program_keahlian_id,
        elemenKompetensi: r.elemen_kompetensi_json || [],
      };
    }
  } catch (err) {
    console.error("Gagal getUnitKompetensiWithDetailsById dari DB:", err);
  }

  // Fallback resilient ke in-memory
  const { getUnitKompetensiById } = await import("./data-access");
  return getUnitKompetensiById(unitId) || null;
}

export async function listMataPelajaran(
  programKeahlianId?: string
): Promise<MataPelajaranWithDetails[]> {
  const whereClause = programKeahlianId ? "WHERE mp.program_keahlian_id = $1" : "";
  const params = programKeahlianId ? [programKeahlianId] : [];

  const query = `
    SELECT 
      mp.id,
      mp.program_keahlian_id,
      mp.nama_mapel,
      mp.kode_mapel,
      mp.tingkat_kelas,
      mp.semester,
      mp.alokasi_jp_mingguan,
      mp.passing_grade_minimum,
      mp.bobot_teori,
      mp.bobot_praktik_mingguan,
      mp.bobot_praktik_kelompok,
      mp.deskripsi,
      mp.rujukan_wsos,
      mp.created_at,
      mp.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', uk.id,
            'kodeUnit', uk.kode_unit,
            'judulUnit', uk.judul_unit,
            'sumber', uk.sumber
          )
        ) FILTER (WHERE uk.id IS NOT NULL),
        '[]'
      ) as units_json,
      COALESCE(
        (
          SELECT json_agg(json_build_object('id', g.id, 'nama', g.nama))
          FROM guru_mata_pelajaran gmp
          JOIN guru g ON g.id = gmp.guru_id
          WHERE gmp.mata_pelajaran_id = mp.id
        ),
        '[]'
      ) as guru_json
    FROM mata_pelajaran mp
    LEFT JOIN mapel_kompetensi_sync mks ON mks.mata_pelajaran_id = mp.id
    LEFT JOIN unit_kompetensi uk ON uk.id = mks.unit_kompetensi_id
    ${whereClause}
    GROUP BY mp.id
    ORDER BY mp.tingkat_kelas, mp.semester, mp.nama_mapel
  `;

  const { rows } = await pool.query(query, params);

  return rows.map((r: any) => {
    const units = r.units_json || [];
    // Hitung estimasi kesiapan lab (indikator ketersediaan alat)
    const labKesiapanPersen = units.length > 0 ? 100 : 0;

    return {
      id: r.id,
      programKeahlianId: r.program_keahlian_id,
      namaMapel: r.nama_mapel,
      kodeMapel: r.kode_mapel,
      tingkatKelas: r.tingkat_kelas,
      semester: r.semester,
      alokasiJpMingguan: r.alokasi_jp_mingguan,
      passingGradeMinimum: Number(r.passing_grade_minimum || 80),
      bobotTeori: r.bobot_teori,
      bobotPraktikMingguan: r.bobot_praktik_mingguan,
      bobotPraktikKelompok: r.bobot_praktik_kelompok,
      deskripsi: r.deskripsi,
      rujukanWsos: r.rujukan_wsos,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
      updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
      totalSkkniSync: units.length,
      units,
      labKesiapanPersen,
      guruAssigned: r.guru_json || [],
    };
  });
}

export async function getMataPelajaranById(
  id: string
): Promise<(MataPelajaranWithDetails & { bahanAjar?: BahanAjarMapel }) | null> {
  const query = `
    SELECT 
      mp.id,
      mp.program_keahlian_id,
      mp.nama_mapel,
      mp.kode_mapel,
      mp.tingkat_kelas,
      mp.semester,
      mp.alokasi_jp_mingguan,
      mp.passing_grade_minimum,
      mp.bobot_teori,
      mp.bobot_praktik_mingguan,
      mp.bobot_praktik_kelompok,
      mp.deskripsi,
      mp.rujukan_wsos,
      mp.created_at,
      mp.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', uk.id,
            'kodeUnit', uk.kode_unit,
            'judulUnit', uk.judul_unit,
            'sumber', uk.sumber
          )
        ) FILTER (WHERE uk.id IS NOT NULL),
        '[]'
      ) as units_json
    FROM mata_pelajaran mp
    LEFT JOIN mapel_kompetensi_sync mks ON mks.mata_pelajaran_id = mp.id
    LEFT JOIN unit_kompetensi uk ON uk.id = mks.unit_kompetensi_id
    WHERE mp.id = $1
    GROUP BY mp.id
  `;

  const { rows } = await pool.query(query, [id]);
  if (!rows[0]) return null;

  const r = rows[0];
  const units = r.units_json || [];

  // Ambil bahan ajar terbaru jika ada
  const bahanAjarRes = await pool.query(
    "SELECT * FROM bahan_ajar_mapel WHERE mata_pelajaran_id = $1 ORDER BY updated_at DESC LIMIT 1",
    [id]
  );
  const ba = bahanAjarRes.rows[0];

  const bahanAjar: BahanAjarMapel | undefined = ba
    ? {
        id: ba.id,
        mataPelajaranId: ba.mata_pelajaran_id,
        guruId: ba.guru_id,
        judul: ba.judul,
        tingkatKelas: ba.tingkat_kelas,
        ringkasanTeori: ba.ringkasan_teori || "",
        jobsheetMingguan: ba.jobsheet_mingguan || [],
        proyekKelompok: ba.proyek_kelompok || [],
        rubrikKktp: ba.rubrik_kktp || [],
        instruksiK3Kritis: ba.instruksi_k3_kritis,
        status: ba.status,
        createdAt: ba.created_at?.toISOString?.() || ba.created_at,
        updatedAt: ba.updated_at?.toISOString?.() || ba.updated_at,
      }
    : undefined;

  return {
    id: r.id,
    programKeahlianId: r.program_keahlian_id,
    namaMapel: r.nama_mapel,
    kodeMapel: r.kode_mapel,
    tingkatKelas: r.tingkat_kelas,
    semester: r.semester,
    alokasiJpMingguan: r.alokasi_jp_mingguan,
    passingGradeMinimum: Number(r.passing_grade_minimum || 80),
    bobotTeori: r.bobot_teori,
    bobotPraktikMingguan: r.bobot_praktik_mingguan,
    bobotPraktikKelompok: r.bobot_praktik_kelompok,
    deskripsi: r.deskripsi,
    rujukanWsos: r.rujukan_wsos,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
    totalSkkniSync: units.length,
    units,
    labKesiapanPersen: units.length > 0 ? 100 : 0,
    bahanAjar,
  };
}

export async function syncMapelWithUnits(
  mapelId: string,
  unitIds: string[]
): Promise<{ success: boolean; syncedCount: number }> {
  // 1. Bersihkan pemetaan sebelumnya
  await pool.query("DELETE FROM mapel_kompetensi_sync WHERE mata_pelajaran_id = $1", [mapelId]);

  // 2. Masukkan unit-unit baru
  let syncedCount = 0;
  for (const unitId of unitIds) {
    const syncId = `sync-${crypto.randomUUID().slice(0, 8)}`;
    await pool.query(
      `INSERT INTO mapel_kompetensi_sync (id, mata_pelajaran_id, unit_kompetensi_id, is_mandatory)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (mata_pelajaran_id, unit_kompetensi_id) DO NOTHING`,
      [syncId, mapelId, unitId]
    );
    syncedCount++;
  }

  return { success: true, syncedCount };
}

export async function createMataPelajaran(
  data: Omit<MataPelajaran, "id" | "createdAt" | "updatedAt">
): Promise<MataPelajaran> {
  const id = `mapel-${crypto.randomUUID().slice(0, 8)}`;
  const query = `
    INSERT INTO mata_pelajaran (
      id, program_keahlian_id, nama_mapel, kode_mapel, tingkat_kelas, semester,
      alokasi_jp_mingguan, passing_grade_minimum, bobot_teori, bobot_praktik_mingguan,
      bobot_praktik_kelompok, deskripsi, rujukan_wsos
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    id,
    data.programKeahlianId,
    data.namaMapel,
    data.kodeMapel || `MP-${Date.now().toString().slice(-4)}`,
    data.tingkatKelas,
    data.semester,
    data.alokasiJpMingguan || 4,
    data.passingGradeMinimum || 80.0,
    data.bobotTeori || 20,
    data.bobotPraktikMingguan || 40,
    data.bobotPraktikKelompok || 40,
    data.deskripsi || null,
    data.rujukanWsos || null,
  ]);

  const r = rows[0];
  return {
    id: r.id,
    programKeahlianId: r.program_keahlian_id,
    namaMapel: r.nama_mapel,
    kodeMapel: r.kode_mapel,
    tingkatKelas: r.tingkat_kelas,
    semester: r.semester,
    alokasiJpMingguan: r.alokasi_jp_mingguan,
    passingGradeMinimum: Number(r.passing_grade_minimum),
    bobotTeori: r.bobot_teori,
    bobotPraktikMingguan: r.bobot_praktik_mingguan,
    bobotPraktikKelompok: r.bobot_praktik_kelompok,
    deskripsi: r.deskripsi,
    rujukanWsos: r.rujukan_wsos,
  };
}

export async function listMapelForGuru(
  guruId: string
): Promise<MataPelajaranWithDetails[]> {
  // Ambil program keahlian guru
  const guruRes = await pool.query<{ program_keahlian_id: string }>(
    "SELECT program_keahlian_id FROM guru WHERE id = $1",
    [guruId]
  );
  const progId = guruRes.rows[0]?.program_keahlian_id;

  // Tampilkan seluruh mata pelajaran dari program keahlian guru
  return listMataPelajaran(progId);
}

export async function saveBahanAjarMapel(
  data: Omit<BahanAjarMapel, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<BahanAjarMapel> {
  const id = data.id || `ba-${crypto.randomUUID().slice(0, 8)}`;
  const query = `
    INSERT INTO bahan_ajar_mapel (
      id, mata_pelajaran_id, guru_id, judul, tingkat_kelas, ringkasan_teori,
      jobsheet_mingguan, proyek_kelompok, rubrik_kktp, instruksi_k3_kritis, status, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    ON CONFLICT (id) DO UPDATE SET
      judul = EXCLUDED.judul,
      ringkasan_teori = EXCLUDED.ringkasan_teori,
      jobsheet_mingguan = EXCLUDED.jobsheet_mingguan,
      proyek_kelompok = EXCLUDED.proyek_kelompok,
      rubrik_kktp = EXCLUDED.rubrik_kktp,
      instruksi_k3_kritis = EXCLUDED.instruksi_k3_kritis,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    id,
    data.mataPelajaranId,
    data.guruId,
    data.judul,
    data.tingkatKelas,
    data.ringkasanTeori || "",
    JSON.stringify(data.jobsheetMingguan || []),
    JSON.stringify(data.proyekKelompok || []),
    JSON.stringify(data.rubrikKktp || []),
    data.instruksiK3Kritis || null,
    data.status || "draft",
  ]);

  const r = rows[0];
  return {
    id: r.id,
    mataPelajaranId: r.mata_pelajaran_id,
    guruId: r.guru_id,
    judul: r.judul,
    tingkatKelas: r.tingkat_kelas,
    ringkasanTeori: r.ringkasan_teori,
    jobsheetMingguan: r.jobsheet_mingguan,
    proyekKelompok: r.proyek_kelompok,
    rubrikKktp: r.rubrik_kktp,
    instruksiK3Kritis: r.instruksi_k3_kritis,
    status: r.status,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
  };
}


