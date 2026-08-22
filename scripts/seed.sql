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
   '38a25721bb1ae148696d711d3b4d448a:e8a4ae599d8e096efe6289c22ced67c0bf5d1b728c85ff30f13e40c091cad503d3e2fb33d650de0699dd283e49f8e9163871dec7da3a5106b6171dc057f64c2d',
   'guru_produktif'),
  ('guru-02', 'Bambang Wijaya, S.T.', 'pk-rpl', 'bambang.wijaya@smk.belajar.id',
   '9966e6a2a0543b59b7290a2e89b386a1:9165b5d621ae012ea9beb45206399245712cd15333be4fc377188a9cc5cd5b34b28b8b61954f077955340ee640a3a87bfb9c4effd88babf828652cf31a0dfbf4',
   'kaprogli')
ON CONFLICT (id) DO NOTHING;

-- Akun admin: HANYA lewat seed, tidak ada jalur pendaftaran publik
-- (CLAUDE.md Bagian A). Password plaintext dilaporkan sekali di laporan sesi
-- ini — JANGAN disimpan di file ini.
INSERT INTO guru (id, nama, program_keahlian_id, email, password_hash, role) VALUES
  ('admin-01', 'Admin VokasIn', 'pk-belum-ditentukan', 'admin@smk.belajar.id',
   '1bd060bb0c064c6cdb5f7a0fad608a6f:0a34ae30f9863fcc80a953ba2a8a9de7a9c5f1a51f77af1dfb4868c1c9de8d398747596a4337a664e4a249981ad3e0574335e19975412219ac05bcac7aebe1cf',
   'admin')
ON CONFLICT (id) DO NOTHING;

-- Rujukan primer: HANYA 7 unit yang sudah diverifikasi manual terhadap PDF
-- SKKNI asli (lihat catatan provenance di lib/seed-data.ts) — bukan seluruh
-- 171 unit hasil parser mentah di data/skkni-parsed.json, yang sebagian besar
-- masih parsing_uncertain. Disalin persis dari lib/seed-data.ts.
INSERT INTO dokumen_skkni (id, nomor) VALUES
  ('doc-22-2019', 'Kepmenaker No. 22 Tahun 2019'),
  ('doc-300-2020', 'Kepmenaker No. 300 Tahun 2020'),
  ('doc-103-2026', 'Kepmenaker No. 103 Tahun 2026'),
  ('doc-102-2023', 'Kepmenaker No. 102 Tahun 2023')
ON CONFLICT (id) DO NOTHING;

INSERT INTO unit_kompetensi (id, kode_unit, judul_unit, dokumen_skkni_id, sumber, program_keahlian_id) VALUES
  ('uk-01', 'ICTTEN5201A', 'Instal, Konfigurasi dan Uji Server', 'doc-22-2019', 'Kepmenaker No. 22 Tahun 2019, unit ICTTEN5201A, hal. 1169–1175', 'pk-tkj'),
  ('uk-02', 'ICTNWK506', 'Melakukan Konfigurasi, Verifikasi, dan Mengatasi Masalah Tautan WAN dan Layanan IP di Jaringan Perusahaan Menengah', 'doc-22-2019', 'Kepmenaker No. 22 Tahun 2019, unit ICTNWK506, hal. 1135–1143', 'pk-tkj'),
  ('uk-03', 'J.61IOT01.005.1', 'Menguji Coba Device IoT', 'doc-300-2020', 'Kepmenaker No. 300 Tahun 2020, unit J.61IOT01.005.1, hal. 40–43', 'pk-tkj'),
  ('uk-04', 'K.62AIN00.001.2', 'Menentukan Sasaran Bisnis Solusi Artificial Intelligence', 'doc-103-2026', 'Kepmenaker No. 103 Tahun 2026, unit K.62AIN00.001.2, hal. 16–18', 'pk-belum-ditentukan'),
  ('uk-05', 'J.63HOS00.003.2', 'Menjabarkan Berbagai Jenis Perangkat Keras Cloud Computing', 'doc-102-2023', 'Kepmenaker No. 102 Tahun 2023, unit J.63HOS00.003.2, hal. 26–28', 'pk-tkj'),
  ('uk-06', 'J.63HOS00.018.2', 'Melakukan Antisipasi Gangguan dan Ancaman terhadap Sistem Cloud', 'doc-102-2023', 'Kepmenaker No. 102 Tahun 2023, unit J.63HOS00.018.2, hal. 83–86', 'pk-tkj'),
  ('uk-07', 'ICAPRG502A', 'Mengelola Sebuah Proyek Menggunakan Software Management Tools', 'doc-22-2019', 'Kepmenaker No. 22 Tahun 2019, unit ICAPRG502A, hal. 1112–1118', 'pk-rpl')
ON CONFLICT (id) DO NOTHING;

INSERT INTO elemen_kompetensi (id, unit_kompetensi_id, judul) VALUES
  ('ek-01', 'uk-01', 'Persiapkan untuk memasang server'),
  ('ek-02', 'uk-01', 'Instal dan konfigurasi server'),
  ('ek-03', 'uk-02', 'Melakukan konfigurasikan tautan WAN'),
  ('ek-04', 'uk-02', 'Mengatasi masalah tautan WAN pada perusahaan menengah'),
  ('ek-05', 'uk-03', 'Melakukan persiapan uji coba'),
  ('ek-06', 'uk-03', 'Melakukan pengujian desain aplikasi'),
  ('ek-07', 'uk-04', 'Mengidentifikasi permasalahan dan sasaran bisnis proyek Artificial Intelligence (AI)'),
  ('ek-08', 'uk-04', 'Menyusun kriteria kesuksesan dari sasaran bisnis proyek AI'),
  ('ek-09', 'uk-05', 'Mengidentifikasi fungsi perangkat keras untuk sistem cloud'),
  ('ek-10', 'uk-05', 'Menguraikan jenis perangkat yang memenuhi fungsi cloud'),
  ('ek-11', 'uk-06', 'Mendeteksi gangguan dan ancaman terhadap keamanan sistem cloud secara berkelanjutan'),
  ('ek-12', 'uk-06', 'Menyusun rencana pencegahan terhadap gangguan dan ancaman pada sistem cloud'),
  ('ek-13', 'uk-06', 'Mendokumentasi potensi dan rencana pencegahan terhadap gangguan dan ancaman terhadap sistem cloud'),
  ('ek-14', 'uk-07', 'Mengidentifikasi perangkat lunak alat manajemen'),
  ('ek-15', 'uk-07', 'Melaksanakan alat manajemen perangkat lunak'),
  ('ek-16', 'uk-07', 'Memantau penggunaan alat manajemen perangkat lunak')
ON CONFLICT (id) DO NOTHING;

INSERT INTO kriteria_unjuk_kerja (id, elemen_kompetensi_id, kode, teks) VALUES
  ('kuk-01', 'ek-01', '1.4', 'Pilih server yang paling sesuai dengan refeensi ke aplikasi server dan fitur server yang diperlukan.'),
  ('kuk-02', 'ek-01', '1.11', 'Buat dan dokumentasikan rencana penerapan.'),
  ('kuk-03', 'ek-02', '2.2', 'Instal dan konfigurasikan server seperti yang dipersyaratkan oleh persyaratan teknis dan spesifikasi fungsional.'),
  ('kuk-04', 'ek-02', '2.4', 'Hubungkan kembali dan konfigurasi ulang perangkat konektivitas yang relevan.'),
  ('kuk-05', 'ek-03', '2.1', 'Menentukan metode yang berbeda untuk menghubungkan ke jaringan area luas (WAN).'),
  ('kuk-06', 'ek-03', '2.4', 'Menentukan teknologi jaringan pribadi virtual (VPN).'),
  ('kuk-07', 'ek-04', '5.1', 'Mengatasi masalah implementasi WAN.'),
  ('kuk-12', 'ek-04', '5.2', 'Memperbaiki masalah WAN.'),
  ('kuk-08', 'ek-05', '1.1', 'Jenis jaringan dan detail spesifikasi sistem IoT yang akan diujicoba diidentifikasi.'),
  ('kuk-09', 'ek-05', '1.2', 'Device IoT disiapkan untuk persiapan uji coba.'),
  ('kuk-13', 'ek-05', '1.3', 'Alur kerja aplikasi beserta panduannya disiapkan sebelum uji coba dimulai.'),
  ('kuk-14', 'ek-05', '1.4', 'Peralatan antistatic untuk persiapan uji coba disiapkan sesuai kebutuhan.'),
  ('kuk-10', 'ek-06', '2.1', 'Device IoT yang sesuai dengan rancangan desain sesuai cetak biru disiapkan sesuai desain.'),
  ('kuk-11', 'ek-06', '2.2', 'Aplikasi yang tertanam sesuai dengan tujuan nya disiapkan sesuai desain.'),
  ('kuk-15', 'ek-07', '1.1', 'Latar belakang, tujuan, dan permasalahan bisnis proyek AI diidentifikasi sesuai dengan prosedur bisnis AI yang berlaku.'),
  ('kuk-16', 'ek-07', '1.2', 'Poin-poin sasaran bisnis Solusi AI diidentifikasi sesuai dengan permasalahan bisnis proyek AI.'),
  ('kuk-17', 'ek-08', '2.1', 'Elemen-elemen metrik kesuksesan dibuat berdasarkan sasaran bisnis Solusi AI.'),
  ('kuk-18', 'ek-08', '2.2', 'Kriteria kesuksesan dari sasaran bisnis proyek AI dipilih sesuai dengan objektif bisnis Solusi AI.'),
  ('kuk-19', 'ek-09', '1.1', 'Berbagai perangkat keras dideskripsikan sesuai dengan pemanfaatan pada cloud.'),
  ('kuk-20', 'ek-09', '1.2', 'Perangkat keras penyimpan data diuraikan sesuai dengan pemanfaatan pada cloud.'),
  ('kuk-21', 'ek-09', '1.3', 'Perangkat interkoneksi dalam jaringan wireless dan wire diuraikan sesuai dengan pemanfaatan pada cloud.'),
  ('kuk-22', 'ek-10', '2.1', 'Berbagai penggunaan jenis perangkat keras pada sistem cloud computing dideskripsikan sesuai dengan fungsinya pada sistem cloud.'),
  ('kuk-23', 'ek-10', '2.2', 'Berbagai jenis perangkat keras penyimpanan data (hard disk/SSD, dlsb) dideskripsikan sesuai dengan jenis fungsinya pada pada sistem cloud.'),
  ('kuk-24', 'ek-10', '2.3', 'Berbagai router dan switch pada sistem cloud diuraikan.'),
  ('kuk-25', 'ek-11', '1.1', 'Potensi gangguan dan ancaman terhadap keamanan sistem cloud diidentifikasi sesuai dengan model risiko yang ada.'),
  ('kuk-26', 'ek-11', '1.2', 'Kondisi keamanan layanan sistem cloud yang teridentifikasi dianalisis secara lengkap meliputi aspek teknis dan non-teknis.'),
  ('kuk-27', 'ek-12', '2.1', 'Strategi pemulihan sistem cloud setelah kejadian gangguan dan ancaman ditentukan sesuai kebutuhan organisasi.'),
  ('kuk-28', 'ek-12', '2.2', 'Pemulihan sistem cloud setelah kejadian gangguan dan ancaman dilakukan sesuai dengan strategi pemulihan sistem cloud.'),
  ('kuk-29', 'ek-12', '2.3', 'Pencegahan terhadap gangguan dan ancaman pada sistem cloud dilakukan secara berkelanjutan.'),
  ('kuk-30', 'ek-13', '3.1', 'Laporan hasil analisis data gangguan dan ancaman keamanan sistem cloud disusun secara lengkap sesuai dengan aspek teknis dan non teknis.'),
  ('kuk-31', 'ek-13', '3.2', 'Rencana pencegahan dan pemulihan sistem cloud setelah kejadian gangguan dan ancaman disusun secara lengkap sesuai dengan Service Level Agreement (SLA).'),
  ('kuk-32', 'ek-14', '1.1', 'Menentukan perangkat lunak metodologi pengembangan yang akan digunakan untuk pengembangan proyek.'),
  ('kuk-33', 'ek-14', '1.2', 'Menentukan perangkat lunak proyek-manajemen yang akan digunakan untuk mengelola pengembangan proyek.'),
  ('kuk-34', 'ek-14', '1.3', 'Menentukan sistem kontrol-sumber untuk mengelola kode sumber dan menangani konflik.'),
  ('kuk-35', 'ek-14', '1.4', 'Menentukan perangkat lunak kolaborasi untuk digunakan dalam pengembangan proyek.'),
  ('kuk-36', 'ek-15', '2.1', 'Membuat rencana proyek sesuai dengan spesifikasi kebutuhan perangkat lunak.'),
  ('kuk-37', 'ek-15', '2.2', 'Menentukan prosedur kontrol-sumber.'),
  ('kuk-38', 'ek-15', '2.3', 'Membuat lingkungan kolaborasi.'),
  ('kuk-39', 'ek-16', '3.1', 'Memantau dan menyesuaikan rencana proyek untuk mempertahankan kemajuan sesuai dengan rencana proyek.'),
  ('kuk-40', 'ek-16', '3.2', 'Memastikan kode dengan benar dimasukkan ke dalam sistem kontrol sumber.'),
  ('kuk-41', 'ek-16', '3.3', 'Memantau lingkungan kolaborasi dan menyelesaikan masalah di mana diperlukan.')
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
