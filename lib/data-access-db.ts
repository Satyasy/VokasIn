// Fungsi baca/tulis Postgres — HANYA diimpor dari Server Component / Server
// Action, tidak pernah dari file "use client". "pg" butuh modul Node (tls,
// util/types) yang tidak ada di bundle browser; memisahkan file ini dari
// lib/data-access.ts (yang diimpor components/guru/susun-modul-client.tsx,
// sebuah client component) mencegah "pg" ikut ter-bundle ke client.
import type { Guru, KategoriAlat, KoreksiGuru, Role, SumberDayaLab } from "./types";
import { setLabCache, findLabItemInCache, setGuruCache } from "./data-access";
import { pool } from "./db";
import { embedPassage, embedQuery, toVectorLiteral, EMBEDDING_MODEL } from "./embedding";

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

// plainto_tsquery MENG-AND-kan semua kata — cocok untuk 1-3 kata kunci
// spesifik, tapi deskripsi kebutuhan bebas guru (Asisten Kebutuhan Modul)
// biasa berisi banyak kata sekaligus, hampir tidak pernah semuanya muncul di
// satu unit yang sama. Bangun tsquery OR manual supaya query panjang tetap
// bisa menemukan unit yang mengandung SEBAGIAN istilahnya.
function buildOrTsQuery(query: string): string | null {
  const tokens = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 3 && !STOPWORDS_ID.has(t));
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
  const vector = await embedQuery(query);
  const tsQuery = buildOrTsQuery(query);
  type Row = {
    id: string;
    kode_unit: string;
    judul_unit: string;
    program_keahlian_id: string | null;
    program_keahlian_singkatan: string | null;
    snippet: string | null;
  };
  const [{ rows: vecRows }, { rows: ftsRows }] = await Promise.all([
    pool.query<Row>(
      `SELECT uk.id, uk.kode_unit, uk.judul_unit,
              pk.id AS program_keahlian_id, pk.singkatan AS program_keahlian_singkatan, NULL AS snippet
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
  addRanked(vecRows);
  addRanked(ftsRows);

  return [...fused.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}
