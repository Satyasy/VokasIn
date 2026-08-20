-- Seed awal untuk dua tabel yang sudah dibaca/ditulis via lib/data-access.ts.
-- Nilai disalin persis dari lib/seed-data.ts (state "sebelum" migrasi) supaya
-- UI tidak terlihat kosong tiba-tiba setelah pindah ke Postgres.
INSERT INTO sumber_daya_lab (id, nama, kategori, jumlah, program_keahlian_id) VALUES
  ('lab-01', 'Switch Managed 24 port', 'perangkat-jaringan', 6, 'pk-tkj'),
  ('lab-02', 'Router Mikrotik RB750', 'perangkat-jaringan', 4, 'pk-tkj'),
  ('lab-03', 'Cable tester', 'alat-ukur', 10, 'pk-tkj'),
  ('lab-04', 'PC rakitan lab jaringan', 'komputer-kerja', 20, 'pk-tkj'),
  ('lab-05', 'Access point indoor', 'perangkat-jaringan', 8, 'pk-tkj'),
  ('lab-06', 'PC lab pemrograman', 'komputer-kerja', 24, 'pk-rpl'),
  ('lab-07', 'Lisensi IDE (VS Code, JetBrains edu)', 'perangkat-lunak', 24, 'pk-rpl')
ON CONFLICT (id) DO NOTHING;

INSERT INTO koreksi_guru (id, saran_topik_id, guru_id, tindakan, catatan, waktu) VALUES
  ('kg-01', 'st-02', 'guru-01', 'modifikasi', 'Ditambahkan studi kasus gangguan Wi-Fi, bukan hanya kabel.', '2026-08-12T09:30:00.000Z')
ON CONFLICT (id) DO NOTHING;
