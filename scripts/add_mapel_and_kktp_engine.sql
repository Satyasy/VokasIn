-- ==============================================================================
-- 1. TABEL MASTER MATA PELAJARAN (Diatur oleh Kaprogli)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id TEXT PRIMARY KEY,
  program_keahlian_id TEXT NOT NULL REFERENCES program_keahlian(id) ON DELETE CASCADE,
  nama_mapel TEXT NOT NULL,
  kode_mapel TEXT UNIQUE,
  tingkat_kelas TEXT NOT NULL CHECK (tingkat_kelas IN ('X', 'XI', 'XII')),
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 6),
  alokasi_jp_mingguan INTEGER NOT NULL DEFAULT 4,
  passing_grade_minimum NUMERIC(5,2) NOT NULL DEFAULT 80.00,
  bobot_teori INTEGER NOT NULL DEFAULT 20,
  bobot_praktik_mingguan INTEGER NOT NULL DEFAULT 40,
  bobot_praktik_kelompok INTEGER NOT NULL DEFAULT 40,
  deskripsi TEXT,
  rujukan_wsos TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT total_bobot_100 CHECK (bobot_teori + bobot_praktik_mingguan + bobot_praktik_kelompok = 100)
);

CREATE INDEX IF NOT EXISTS idx_mapel_tingkat_prog ON mata_pelajaran(tingkat_kelas, program_keahlian_id);

-- ==============================================================================
-- 2. TABEL RELASI SINKRONISASI MAPEL DENGAN UNIT SKKNI (Many-to-Many)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS mapel_kompetensi_sync (
  id TEXT PRIMARY KEY,
  mata_pelajaran_id TEXT NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  unit_kompetensi_id TEXT NOT NULL REFERENCES unit_kompetensi(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_mapel_unit UNIQUE (mata_pelajaran_id, unit_kompetensi_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_mapel ON mapel_kompetensi_sync(mata_pelajaran_id);
CREATE INDEX IF NOT EXISTS idx_sync_unit ON mapel_kompetensi_sync(unit_kompetensi_id);

-- ==============================================================================
-- 3. TABEL PENUGASAN GURU KE MATA PELAJARAN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS guru_mata_pelajaran (
  id TEXT PRIMARY KEY,
  guru_id TEXT NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
  mata_pelajaran_id TEXT NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  tahun_ajaran TEXT NOT NULL DEFAULT '2026/2027',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_guru_mapel UNIQUE (guru_id, mata_pelajaran_id, tahun_ajaran)
);

CREATE INDEX IF NOT EXISTS idx_guru_mapel_guru ON guru_mata_pelajaran(guru_id);

-- ==============================================================================
-- 4. TABEL BAHAN AJAR MATA PELAJARAN (Disusun Guru berbasis SKKNI/WSOS & KKTP)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bahan_ajar_mapel (
  id TEXT PRIMARY KEY,
  mata_pelajaran_id TEXT NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  guru_id TEXT NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  tingkat_kelas TEXT NOT NULL CHECK (tingkat_kelas IN ('X', 'XI', 'XII')),
  ringkasan_teori TEXT NOT NULL DEFAULT '',
  jobsheet_mingguan JSONB NOT NULL DEFAULT '[]',
  proyek_kelompok JSONB NOT NULL DEFAULT '[]',
  rubrik_kktp JSONB NOT NULL DEFAULT '[]',
  instruksi_k3_kritis TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'diarsipkan')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bahan_ajar_mapel ON bahan_ajar_mapel(mata_pelajaran_id);
CREATE INDEX IF NOT EXISTS idx_bahan_ajar_guru ON bahan_ajar_mapel(guru_id);

-- ==============================================================================
-- 5. SEED DATA 10 MATA PELAJARAN SEKOLAH (RPL & TJKT Kelas X, XI, XII)
-- ==============================================================================
INSERT INTO mata_pelajaran (
  id, program_keahlian_id, nama_mapel, kode_mapel, tingkat_kelas, semester,
  alokasi_jp_mingguan, passing_grade_minimum, bobot_teori, bobot_praktik_mingguan,
  bobot_praktik_kelompok, deskripsi, rujukan_wsos
) VALUES
-- KELAS X
(
  'mapel-rpl-x-prog', 'pk-rpl', 'Pemrograman', 'RPL-X-01', 'X', 1,
  4, 80.00, 20, 40, 40,
  'Fondasi algoritma terstruktur, pseudocode, tipe data, dan logika pemrograman aplikasi kejuruan.',
  'Skill 09: Software Application Development'
),
(
  'mapel-rpl-x-db', 'pk-rpl', 'Basis Data', 'RPL-X-02', 'X', 1,
  4, 80.00, 20, 40, 40,
  'Konsep pemodelan relasional ERD, normalisasi tabel, dan eksekusi DDL/DML Structured Query Language (SQL).',
  'Skill 40: Web Technologies'
),
(
  'mapel-rpl-x-ai1', 'pk-rpl', 'AI Dasar I', 'RPL-X-03', 'X', 2,
  4, 80.00, 20, 40, 40,
  'Pengantar kecerdasan buatan, pembersihan data (data cleansing), dan analisis statistik deskriptif awal.',
  'Skill 53: Cloud Computing'
),

-- KELAS XI
(
  'mapel-rpl-xi-prog2', 'pk-rpl', 'Pemrograman 2', 'RPL-XI-01', 'XI', 3,
  5, 80.00, 20, 40, 40,
  'Pemrograman Berorientasi Objek (OOP), enkapsulasi, polimorfisme, design patterns, dan penanganan exception.',
  'Skill 09: Software Application Development'
),
(
  'mapel-rpl-xi-ai2', 'pk-rpl', 'AI Dasar 2', 'RPL-XI-02', 'XI', 3,
  5, 80.00, 20, 40, 40,
  'Pengembangan model pembelajaran mesin (Supervised & Unsupervised Machine Learning) dan evaluasi metrik akurasi.',
  'Skill 53: Cloud Computing'
),
(
  'mapel-tjkt-xi-siskomjar', 'pk-tkj', 'Sistem Komputer Jaringan (SisKomJar)', 'TJKT-XI-01', 'XI', 3,
  6, 80.00, 20, 40, 40,
  'Arsitektur perangkat keras komputer, instalasi OS jaringan, skema subnetting VLSM/CIDR, dan pengkabelan.',
  'Skill 39: Network Systems Administration'
),

-- KELAS XII
(
  'mapel-rpl-xii-uiux', 'pk-rpl', 'UI/UX Lanjutan', 'RPL-XII-01', 'XII', 5,
  4, 80.00, 20, 40, 40,
  'Desain antarmuka modern, sistem desain komponen, wireframing interaktif, dan pengujian usabilitas pengguna (UAT).',
  'Skill 40: Web Technologies'
),
(
  'mapel-rpl-xii-ai-lanjutan', 'pk-rpl', 'AI Lanjutan', 'RPL-XII-02', 'XII', 5,
  5, 80.00, 20, 40, 40,
  'Integrasi model Generative AI, Retrieval-Augmented Generation (RAG), dan deployment API microservice AI.',
  'Skill 53: Cloud Computing'
),
(
  'mapel-tjkt-xii-iot', 'pk-tkj', 'Internet of Things (IoT)', 'TJKT-XII-01', 'XII', 5,
  5, 80.00, 20, 40, 40,
  'Integrasi mikrokontroler sensor edge, komunikasi protokol MQTT/HTTP, dan visualisasi telemetri cloud.',
  'Skill: Smart Automation'
),
(
  'mapel-tjkt-xii-skj', 'pk-tkj', 'Sistem Keamanan Jaringan (SKJ)', 'TJKT-XII-02', 'XII', 5,
  6, 80.00, 20, 40, 40,
  'Konfigurasi firewall perimeter, pengujian penetrasi (penetration testing), audit keamanan, dan respon insiden siber.',
  'Skill 54: Cyber Security'
)
ON CONFLICT (id) DO UPDATE SET
  nama_mapel = EXCLUDED.nama_mapel,
  tingkat_kelas = EXCLUDED.tingkat_kelas,
  rujukan_wsos = EXCLUDED.rujukan_wsos,
  alokasi_jp_mingguan = EXCLUDED.alokasi_jp_mingguan;

-- ==============================================================================
-- 6. SEED SINKRONISASI AWAL MAPEL KE UNIT KOMPETENSI RELEVAN
-- ==============================================================================
-- Tautkan uk-07 (software project management) ke Pemrograman 2
INSERT INTO mapel_kompetensi_sync (id, mata_pelajaran_id, unit_kompetensi_id, is_mandatory)
VALUES ('sync-01', 'mapel-rpl-xi-prog2', 'uk-07', true)
ON CONFLICT DO NOTHING;

-- Tautkan uk-01 (instal server) & uk-02 (konfigurasi jaringan) ke SisKomJar
INSERT INTO mapel_kompetensi_sync (id, mata_pelajaran_id, unit_kompetensi_id, is_mandatory)
VALUES 
  ('sync-02', 'mapel-tjkt-xi-siskomjar', 'uk-01', true),
  ('sync-03', 'mapel-tjkt-xi-siskomjar', 'uk-02', true)
ON CONFLICT DO NOTHING;

-- Tautkan uk-03 (device IoT) ke Mapel IoT
INSERT INTO mapel_kompetensi_sync (id, mata_pelajaran_id, unit_kompetensi_id, is_mandatory)
VALUES ('sync-04', 'mapel-tjkt-xii-iot', 'uk-03', true)
ON CONFLICT DO NOTHING;

-- Tautkan uk-04 (sasaran bisnis AI) ke AI Dasar I & AI Dasar 2
INSERT INTO mapel_kompetensi_sync (id, mata_pelajaran_id, unit_kompetensi_id, is_mandatory)
VALUES 
  ('sync-05', 'mapel-rpl-x-ai1', 'uk-04', true),
  ('sync-06', 'mapel-rpl-xi-ai2', 'uk-04', true)
ON CONFLICT DO NOTHING;

-- Tautkan uk-05 & uk-06 (cloud hardware & security) ke SKJ
INSERT INTO mapel_kompetensi_sync (id, mata_pelajaran_id, unit_kompetensi_id, is_mandatory)
VALUES 
  ('sync-07', 'mapel-tjkt-xii-skj', 'uk-05', true),
  ('sync-08', 'mapel-tjkt-xii-skj', 'uk-06', true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 7. SEED PENUGASAN GURU AWAL (guru-01 untuk TJKT, guru-02 untuk RPL)
-- ==============================================================================
INSERT INTO guru_mata_pelajaran (id, guru_id, mata_pelajaran_id, tahun_ajaran)
VALUES
  ('gm-01', 'guru-01', 'mapel-tjkt-xi-siskomjar', '2026/2027'),
  ('gm-02', 'guru-01', 'mapel-tjkt-xii-iot', '2026/2027'),
  ('gm-03', 'guru-01', 'mapel-tjkt-xii-skj', '2026/2027'),
  ('gm-04', 'guru-02', 'mapel-rpl-x-prog', '2026/2027'),
  ('gm-05', 'guru-02', 'mapel-rpl-x-db', '2026/2027'),
  ('gm-06', 'guru-02', 'mapel-rpl-xi-prog2', '2026/2027'),
  ('gm-07', 'guru-02', 'mapel-rpl-xi-ai2', '2026/2027')
ON CONFLICT DO NOTHING;
