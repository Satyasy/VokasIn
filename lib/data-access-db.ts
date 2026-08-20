// Fungsi baca/tulis Postgres — HANYA diimpor dari Server Component / Server
// Action, tidak pernah dari file "use client". "pg" butuh modul Node (tls,
// util/types) yang tidak ada di bundle browser; memisahkan file ini dari
// lib/data-access.ts (yang diimpor components/guru/susun-modul-client.tsx,
// sebuah client component) mencegah "pg" ikut ter-bundle ke client.
import type { Guru, KategoriAlat, KoreksiGuru, Role, SumberDayaLab } from "./types";
import { setLabCache, findLabItemInCache, setGuruCache } from "./data-access";
import { pool } from "./db";

async function loadGuruCacheFromDb(): Promise<void> {
  const { rows } = await pool.query<{
    id: string;
    nama: string;
    program_keahlian_id: string;
    email: string;
    role: Role;
  }>("SELECT id, nama, program_keahlian_id, email, role FROM guru ORDER BY id");
  setGuruCache(
    rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      programKeahlianId: r.program_keahlian_id,
      email: r.email,
      role: r.role,
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
  }>(
    "SELECT id, nama, program_keahlian_id, email, password_hash, role FROM guru WHERE email = $1",
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
    passwordHash: row.password_hash,
  };
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
