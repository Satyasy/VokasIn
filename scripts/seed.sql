-- Seed awal, disalin persis dari lib/seed-data.ts (state "sebelum" migrasi)
-- supaya UI tidak terlihat kosong tiba-tiba setelah pindah ke Postgres.
-- Urutan INSERT mengikuti rantai FK: program_keahlian dan guru harus ada
-- dulu sebelum sumber_daya_lab/saran_topik/koreksi_guru yang mereferensikannya.
INSERT INTO program_keahlian (id, nama, singkatan, sekolah_id) VALUES
  ('pk-tkj', 'Teknik Komputer dan Jaringan', 'TKJ', NULL),
  ('pk-rpl', 'Rekayasa Perangkat Lunak', 'RPL', NULL),
  ('pk-belum-ditentukan', '(Belum ditentukan oleh kaprogli)', '?', NULL)
ON CONFLICT (id) DO NOTHING;

-- Password plaintext untuk kedua akun (dibangkitkan acak, lihat laporan sesi
-- ini untuk nilainya) di-hash dengan scrypt (lib/auth.ts) sebelum disimpan —
-- JANGAN simpan plaintext di file ini.
INSERT INTO guru (id, nama, program_keahlian_id, email, password_hash, role) VALUES
  ('guru-01', 'Siti Rahmawati, S.Kom.', 'pk-tkj', 'siti.rahmawati@smk.belajar.id',
   'bc4a7e52d33f1a2af95e1fbdb3e01b10:793c25df17a00a0491d9335ad11d98e339e8949adf03bbb68f3fffa299ec64748074b5c3194326ae308f83241a5f0b51c4540d613e913a88a9729eb1f386b244',
   'guru_produktif'),
  ('guru-02', 'Bambang Wijaya, S.T.', 'pk-rpl', 'bambang.wijaya@smk.belajar.id',
   'e9c4742823d8ab2510208b5de9303cf7:3f5b62d38e65cdb4ed396f6b0a8055b4344a3b31d86c68df4a21e40326c849f7e9fbc1b40df7de7d0d5ffe26f6bf665bf250a6e4895d04df8bccb9fb562628e1',
   'kaprogli')
ON CONFLICT (id) DO NOTHING;

INSERT INTO saran_topik (id, modul_ajar_draft_id, unit_kompetensi_id, elemen_kompetensi_id, judul, isi_ekstraktif, alat_dibutuhkan, skor_keyakinan) VALUES
  ('st-01', NULL, 'uk-01', 'ek-02', 'Instalasi dan Konfigurasi Server sesuai Spesifikasi Teknis',
   'Instal dan konfigurasikan server seperti yang dipersyaratkan oleh persyaratan teknis dan spesifikasi fungsional. Hubungkan kembali dan konfigurasi ulang perangkat konektivitas yang relevan.',
   '[{"kategori":"komputer-kerja","label":"Server rak/tower untuk praktik instalasi"},{"kategori":"perangkat-lunak","label":"Sistem operasi server"},{"kategori":"perangkat-jaringan","label":"Switch managed"}]', 0.88),
  ('st-02', NULL, 'uk-02', 'ek-04', 'Mengatasi dan Memperbaiki Masalah Implementasi WAN',
   'Mengatasi masalah implementasi WAN. Memperbaiki masalah WAN.',
   '[{"kategori":"komputer-kerja","label":"PC dengan akses jaringan"},{"kategori":"perangkat-jaringan","label":"Router"}]', 0.79),
  ('st-03', NULL, 'uk-03', 'ek-06', 'Menguji Device IoT sesuai Rancangan Desain',
   'Device IoT yang sesuai dengan rancangan desain sesuai cetak biru disiapkan sesuai desain. Aplikasi yang tertanam sesuai dengan tujuan nya disiapkan sesuai desain.',
   '[{"kategori":"alat-tangan","label":"Module/device IoT atau Printed Circuit Board Assembly (PCBA)"},{"kategori":"komputer-kerja","label":"Komputer, notebook, atau server"},{"kategori":"perangkat-jaringan","label":"Kabel sesuai konektor yang dibutuhkan untuk pengujian"},{"kategori":"perangkat-lunak","label":"Software analisis aplikasi untuk pengumpulan data hasil pengujian UI"},{"kategori":"alat-tangan","label":"Wrist band anti-static atau lapisan lantai anti-static"}]', 0.71),
  ('st-04', NULL, 'uk-04', 'ek-07', 'Mengidentifikasi Permasalahan dan Sasaran Bisnis Proyek AI',
   'Latar belakang, tujuan, dan permasalahan bisnis proyek AI diidentifikasi sesuai dengan prosedur bisnis AI yang berlaku. Poin-poin sasaran bisnis Solusi AI diidentifikasi sesuai dengan permasalahan bisnis proyek AI.',
   '[{"kategori":"komputer-kerja","label":"Komputer"},{"kategori":"perangkat-lunak","label":"Aplikasi pengolah kata"},{"kategori":"perangkat-lunak","label":"Aplikasi spreadsheet"},{"kategori":"perangkat-lunak","label":"Aplikasi presentasi"}]', 0.68),
  ('st-05', NULL, 'uk-05', 'ek-09', 'Mengidentifikasi Fungsi Perangkat Keras untuk Sistem Cloud',
   'Berbagai perangkat keras dideskripsikan sesuai dengan pemanfaatan pada cloud. Perangkat keras penyimpan data diuraikan sesuai dengan pemanfaatan pada cloud. Perangkat interkoneksi dalam jaringan wireless dan wire diuraikan sesuai dengan pemanfaatan pada cloud.',
   '[{"kategori":"komputer-kerja","label":"Alat pengolah data"},{"kategori":"perangkat-lunak","label":"Perangkat lunak bantu"},{"kategori":"alat-tangan","label":"Alat tulis kantor"}]', 0.74),
  ('st-06', NULL, 'uk-06', 'ek-11', 'Mendeteksi Gangguan dan Ancaman Keamanan Sistem Cloud',
   'Potensi gangguan dan ancaman terhadap keamanan sistem cloud diidentifikasi sesuai dengan model risiko yang ada. Kondisi keamanan layanan sistem cloud yang teridentifikasi dianalisis secara lengkap meliputi aspek teknis dan non-teknis.',
   '[{"kategori":"komputer-kerja","label":"Alat pengolah data"},{"kategori":"perangkat-jaringan","label":"Jaringan internet"},{"kategori":"perangkat-lunak","label":"Perangkat lunak bantu perkantoran (pengolah kata, lembar kerja, gambar)"},{"kategori":"alat-tangan","label":"Alat tulis kantor"}]', 0.7),
  ('st-07', NULL, 'uk-07', 'ek-15', 'Melaksanakan Alat Manajemen Perangkat Lunak dalam Proyek',
   'Membuat rencana proyek sesuai dengan spesifikasi kebutuhan perangkat lunak. Menentukan prosedur kontrol-sumber. Membuat lingkungan kolaborasi.',
   '[{"kategori":"perangkat-jaringan","label":"Akses internet"},{"kategori":"perangkat-lunak","label":"Perangkat lunak manajemen proyek"},{"kategori":"perangkat-lunak","label":"Perangkat lunak kontrol-sumber (version control)"}]', 0.6)
ON CONFLICT (id) DO NOTHING;

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
