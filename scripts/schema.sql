-- Skema Postgres VokasIn — mengikuti ERD di ARCHITECTURE.md §2 satu-per-satu.
-- program_keahlian, guru, saran_topik, sumber_daya_lab, dan koreksi_guru
-- sudah dibaca/ditulis (atau di-seed) lewat Postgres — lihat scripts/seed.sql.
-- Tabel lain disiapkan strukturnya dulu (ARCHITECTURE.md #6: relasional
-- sederhana, bukan Knowledge Graph) supaya tidak perlu dirombak saat fitur lain
-- menyusul, meski isinya masih di lib/seed-data.ts (in-memory).
--
-- ponytail: FK constraint masih belum dipasang untuk sebagian besar kolom
-- lintas tabel — tabel rujukan (unit_kompetensi, elemen_kompetensi, dst.)
-- belum diisi dari Postgres sama sekali (masih in-memory). Tambahkan
-- REFERENCES saat tabel itu juga dimigrasikan (termasuk saran_topik.unit_kompetensi_id
-- dan elemen_kompetensi_id, yang sengaja belum diberi REFERENCES karena
-- tabel rujukannya masih kosong).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS sekolah (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS program_keahlian (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  singkatan TEXT NOT NULL,
  sekolah_id TEXT
);

CREATE TABLE IF NOT EXISTS guru (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  program_keahlian_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('guru_produktif', 'kaprogli'))
);

CREATE TABLE IF NOT EXISTS dokumen_skkni (
  id TEXT PRIMARY KEY,
  nomor TEXT NOT NULL
);

-- corpus_text/embedding/corpus_tsv: lihat lib/embedding.ts & lib/data-access-db.ts.
-- HANYA unit yang terverifikasi manual boleh punya baris di tabel ini sama
-- sekali (CLAUDE.md/DESIGN.md) — 171 unit hasil parser mentah di
-- data/skkni-parsed.json TIDAK pernah dimuat ke sini.
CREATE TABLE IF NOT EXISTS unit_kompetensi (
  id TEXT PRIMARY KEY,
  kode_unit TEXT NOT NULL,
  judul_unit TEXT NOT NULL,
  dokumen_skkni_id TEXT,
  sumber TEXT NOT NULL,
  program_keahlian_id TEXT NOT NULL,
  -- Teks gabungan judul unit + seluruh judul Elemen + seluruh teks KUK, dipakai
  -- SEBAGAI SUMBER untuk embedding (lib/embedding.ts) maupun full-text search
  -- di bawah — satu teks, dua indeks, supaya keduanya selalu konsisten.
  corpus_text TEXT,
  embedding vector(384),
  embedding_model_version TEXT,
  embedding_updated_at TIMESTAMPTZ,
  corpus_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(corpus_text, ''))) STORED
);

-- Full-text search index (GIN standar, BUKAN index ANN vektor — korpus masih
-- terlalu kecil untuk HNSW/IVFFlat, brute-force cosine scan sudah cukup).
CREATE INDEX IF NOT EXISTS unit_kompetensi_corpus_tsv_idx ON unit_kompetensi USING GIN (corpus_tsv);

CREATE TABLE IF NOT EXISTS elemen_kompetensi (
  id TEXT PRIMARY KEY,
  unit_kompetensi_id TEXT NOT NULL,
  judul TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kriteria_unjuk_kerja (
  id TEXT PRIMARY KEY,
  elemen_kompetensi_id TEXT NOT NULL,
  kode TEXT NOT NULL,
  teks TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sumber_sekunder (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_entity (
  id TEXT PRIMARY KEY,
  nama_skill TEXT NOT NULL,
  sumber_sekunder_id TEXT,
  program_keahlian_id TEXT NOT NULL,
  status_pemetaan TEXT NOT NULL CHECK (status_pemetaan IN ('terpetakan_skkni', 'gap_kandidat')),
  sudah_ditinjau BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS pemetaan_skill_unit (
  id TEXT PRIMARY KEY,
  skill_entity_id TEXT NOT NULL,
  unit_kompetensi_id TEXT NOT NULL,
  skor_kemiripan REAL,
  status_pemetaan TEXT NOT NULL CHECK (status_pemetaan IN ('terpetakan_skkni', 'gap_kandidat'))
);

CREATE TABLE IF NOT EXISTS modul_ajar_draft (
  id TEXT PRIMARY KEY,
  guru_id TEXT NOT NULL,
  program_keahlian_id TEXT NOT NULL,
  unit_kompetensi_id TEXT NOT NULL,
  judul TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS saran_topik (
  id TEXT PRIMARY KEY,
  modul_ajar_draft_id TEXT,
  unit_kompetensi_id TEXT NOT NULL,
  elemen_kompetensi_id TEXT NOT NULL,
  judul TEXT NOT NULL,
  isi_ekstraktif TEXT NOT NULL,
  alat_dibutuhkan JSONB NOT NULL DEFAULT '[]', -- {kategori,label}[] — tidak jadi tabel terpisah, tidak ada di ERD
  skor_keyakinan REAL NOT NULL,
  -- Catatan cara mengajar / strategi pedagogi — murni input manual guru,
  -- TIDAK PERNAH diisi sistem/AI (HITL: sistem cuma menyediakan kompetensi
  -- dari SKKNI, cara mengajarkan sepenuhnya keputusan guru). Nullable karena
  -- guru boleh belum mengisi.
  catatan_pedagogi TEXT
);

-- KoreksiGuru: implementasi konkret "data nyata untuk validasi" (ARCHITECTURE.md §2).
CREATE TABLE IF NOT EXISTS koreksi_guru (
  id TEXT PRIMARY KEY,
  saran_topik_id TEXT NOT NULL REFERENCES saran_topik(id),
  guru_id TEXT NOT NULL REFERENCES guru(id),
  tindakan TEXT NOT NULL CHECK (tindakan IN ('terima', 'tolak', 'modifikasi')),
  catatan TEXT,
  waktu TIMESTAMPTZ NOT NULL
);

-- SumberDayaLab: basis kebenaran fisik untuk Resource Feasibility Checker.
CREATE TABLE IF NOT EXISTS sumber_daya_lab (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (
    kategori IN ('perangkat-jaringan', 'komputer-kerja', 'alat-ukur', 'perangkat-lunak', 'alat-tangan', 'server')
  ),
  jumlah INTEGER NOT NULL CHECK (jumlah >= 0),
  program_keahlian_id TEXT NOT NULL REFERENCES program_keahlian(id)
);

CREATE TABLE IF NOT EXISTS skill_delta_report (
  id TEXT PRIMARY KEY,
  program_keahlian_id TEXT NOT NULL,
  semester TEXT NOT NULL,
  total_unit_kompetensi INTEGER NOT NULL,
  unit_terajarkan INTEGER NOT NULL,
  gap_kandidat_count INTEGER NOT NULL,
  skor_delta INTEGER NOT NULL
);
