CREATE TABLE IF NOT EXISTS jurusan_anchor_text (
  id TEXT PRIMARY KEY,
  program_keahlian_id TEXT NOT NULL REFERENCES program_keahlian(id),
  teks_jangkar TEXT NOT NULL,
  embedding vector(384),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE unit_kompetensi_kandidat ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE unit_kompetensi_kandidat ADD COLUMN IF NOT EXISTS skor_ai REAL;
ALTER TABLE unit_kompetensi_kandidat ADD COLUMN IF NOT EXISTS saran_program_keahlian_id TEXT;
