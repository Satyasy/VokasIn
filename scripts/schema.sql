-- Skema Postgres VokasIn — mengikuti ERD di ARCHITECTURE.md §2 satu-per-satu.
-- Hanya sumber_daya_lab dan koreksi_guru yang dibaca/ditulis lewat lib/data-access.ts
-- saat ini; tabel lain disiapkan strukturnya dulu (ARCHITECTURE.md #6: relasional
-- sederhana, bukan Knowledge Graph) supaya tidak perlu dirombak saat fitur lain
-- menyusul, meski isinya masih di lib/seed-data.ts (in-memory).
--
-- ponytail: FK constraint sengaja tidak dipasang lintas tabel — tabel rujukan
-- primer (program_keahlian, guru, unit_kompetensi, dst.) belum diisi dari
-- Postgres sama sekali (masih in-memory). Tambahkan REFERENCES saat tabel itu
-- juga dimigrasikan, supaya seed dua tabel yang sudah aktif tidak gagal FK.

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
  program_keahlian_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dokumen_skkni (
  id TEXT PRIMARY KEY,
  nomor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS unit_kompetensi (
  id TEXT PRIMARY KEY,
  kode_unit TEXT NOT NULL,
  judul_unit TEXT NOT NULL,
  dokumen_skkni_id TEXT,
  sumber TEXT NOT NULL,
  program_keahlian_id TEXT NOT NULL
);

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
  skor_keyakinan REAL NOT NULL
);

-- KoreksiGuru: implementasi konkret "data nyata untuk validasi" (ARCHITECTURE.md §2).
CREATE TABLE IF NOT EXISTS koreksi_guru (
  id TEXT PRIMARY KEY,
  saran_topik_id TEXT NOT NULL,
  guru_id TEXT NOT NULL,
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
  program_keahlian_id TEXT NOT NULL
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
