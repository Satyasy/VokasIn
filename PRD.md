# PRD — VokasIn

**Versi:** 1.0 · **Tanggal:** 19 Agustus 2026 · **Status:** Draf untuk BEEFEST SDLC 2026
**Sebelumnya bernama:** VocaSync

---

## 1. Ringkasan Eksekutif

VokasIn adalah asisten analitik kurikulum berbasis Human-in-the-Loop (HITL) untuk guru produktif dan ketua program keahlian (kaprogli) di SMK. Sistem menerjemahkan dokumen Standar Kompetensi Kerja Nasional Indonesia (SKKNI) — yang selama ini hanya tersedia sebagai ratusan PDF birokratis — menjadi rencana praktikum, jobsheet, dan rubrik penilaian yang siap dipakai di kelas, dengan keputusan akhir selalu di tangan guru.

## 2. Pernyataan Masalah

Kurikulum Merdeka memberi sekolah vokasi otonomi membuka konsentrasi keahlian/kelas peminatan lintas jurusan (mis. siswa TKJ mendalami Cloud Computing atau DKV), tetapi otonomi ini **tidak disertai instrumen** untuk menurunkan minat tersebut menjadi kompetensi yang terverifikasi dan bisa diajarkan. Guru menyusun perangkat ajar dari nol, sering tanpa merujuk SKKNI karena dokumennya tidak praktis diakses dan diterjemahkan secara manual.

Dampaknya terukur: pada kasus mitra sertifikasi TBIG (2025), dari 1.569 siswa yang diajukan sekolah untuk pelatihan, hanya 145 (9,2%) lulus standar kualifikasi — indikasi kesenjangan antara apa yang diajarkan dan apa yang dituntut standar/industri. SKKNI sendiri sudah tersedia luas (1.000+ dokumen resmi terbuka per triwulan III 2022), tetapi uji duplikasi pasar membuktikan **belum ada satu pun alat** — pemerintah, edtech swasta, maupun prototipe akademik — yang menerjemahkannya secara otomatis menjadi perangkat ajar siap pakai.

## 3. Tujuan & Sasaran

| Tujuan | Target terukur |
|---|---|
| Memangkas waktu penyusunan perangkat ajar per kelas peminatan | Dari hitungan hari menjadi hitungan jam pada pilot pertama |
| Meningkatkan proporsi materi ajar yang tertelusur ke rujukan resmi | Dari mendekati nol menjadi mayoritas unit kompetensi punya sumber tercatat |
| Memberi kaprogli bukti kuantitatif untuk revisi kurikulum/anggaran alat | Minimal satu Skill Delta Report per program keahlian per semester dipakai dalam pengambilan keputusan nyata |
| Menjaga akuntabilitas keputusan AI | 100% saran kompetensi yang masuk modul ajar final melalui konfirmasi eksplisit guru (bukan auto-accept) |

## 4. Non-Tujuan (Out of Scope)

- **Bukan** platform kelas/LMS untuk siswa — siswa bukan pengguna langsung produk ini.
- **Bukan** alat rekomendasi jurusan/bakat-minat siswa.
- **Bukan** pengganti proses sertifikasi resmi BNSP/LSP — hanya membantu persiapan materi.
- **Tidak** melakukan web scraping lowongan kerja dari portal manapun.
- **Tidak** menjanjikan pembangunan infrastruktur skala-besar (Knowledge Graph/QuadStore, IaC penuh) pada tahap prototipe.

## 5. Target Pengguna & Persona

**Guru Produktif Kejuruan** — mengajar mata pelajaran kejuruan/konsentrasi keahlian, dibebani penyusunan jobsheet setiap semester tanpa alat bantu terstandar, sering harus menyusun kelas peminatan baru (cloud, cyber, DKV) tanpa silabus resmi yang jelas.

**Kaprogli (Ketua Program Keahlian)** — bertanggung jawab menyelaraskan kurikulum dengan kebutuhan industri, butuh bukti kuantitatif untuk mengajukan revisi kurikulum atau anggaran alat lab ke kepala sekolah, mengelola guru dan inventaris lab dalam satu program keahlian.

## 6. User Stories

- Sebagai **guru produktif**, saya ingin melihat kartu saran kompetensi berbasis SKKNI untuk unit yang saya pilih, agar saya tidak menyusun jobsheet dari nol.
- Sebagai **guru produktif**, saya ingin sistem memberi tahu jika alat yang disarankan tidak tersedia di lab sekolah saya, agar saya tidak merekomendasikan praktikum yang mustahil dijalankan.
- Sebagai **guru produktif**, saya ingin mengekspor modul ajar final sebagai dokumen yang tetap saya miliki, agar saya tidak bergantung pada platform ini selamanya.
- Sebagai **kaprogli**, saya ingin melihat skor kesenjangan kompetensi (Skill Delta Score) per program keahlian, agar saya punya bukti kuantitatif saat mengajukan revisi kurikulum.
- Sebagai **kaprogli**, saya ingin melihat kandidat kompetensi baru yang belum tercakup SKKNI (hasil sinyal sekunder), agar saya tahu ke mana kurikulum harus bergerak lebih dulu dari standar resmi.

## 7. Kebutuhan Fungsional

| # | Fitur | Deskripsi |
|---|---|---|
| F1 | Ekstraksi Otomatis SKKNI | Parsing dokumen PDF SKKNI menjadi struktur Unit Kompetensi–Elemen–Kriteria Unjuk Kerja |
| F2 | Pencarian & Pencocokan Semantik | Embedding similarity untuk menautkan istilah industri ke istilah baku SKKNI |
| F3 | Kartu Saran Ekstraktif | Disusun langsung dari teks Elemen+KUK asli; perluasan berbasis LLM bersifat opsional dan selalu ditandai |
| F4 | Drag-and-Drop Suggestion Cards | Guru menyeret kartu satu per satu ke kanvas modul ajar — bukan tombol setuju tunggal |
| F5 | Resource Feasibility Checker | Mencocokkan **fungsi/kategori** alat (bukan merek dagang) dengan inventaris lab sekolah |
| F6 | Pelabelan Kesenjangan Kompetensi (Gap) | Skill dari sumber sekunder yang tidak match SKKNI ditandai sebagai kandidat gap, bukan dibuang |
| F7 | Log Koreksi Guru | Setiap penerimaan/penolakan/modifikasi kartu tersimpan sebagai data nyata untuk kalibrasi model |
| F8 | Dashboard Skill Delta Score | Agregat kesenjangan kompetensi per program keahlian/semester untuk kaprogli |
| F9 | Ekspor Dokumen | Modul ajar final diunduh sebagai dokumen siap cetak, dimiliki sekolah |
| F10 | Manajemen Inventaris Lab | Kaprogli mencatat alat yang tersedia per program keahlian |

## 8. Kebutuhan Non-Fungsional

- **Sumber data:** hanya dokumen SKKNI resmi dan sumber sekunder legal (API resmi/input manual); tidak ada scraping.
- **Privasi:** kepatuhan UU PDP (27/2022) untuk data guru/siswa yang tersimpan.
- **Aksesibilitas:** kontras WCAG AA minimum, navigasi keyboard, `prefers-reduced-motion` dihormati.
- **Performa:** first-load JS terjaga wajar (audit bila >200KB); animasi hanya pada `transform`/`opacity`.
- **Keberlanjutan biaya:** arsitektur ML default non-generatif (murah, dapat berjalan tanpa API LLM berbayar terus-menerus); LLM hanya dipanggil saat guru eksplisit meminta perluasan.
- **Kejujuran akurasi:** tidak ada klaim "menjamin akurasi mutlak"; UI menampilkan tingkat keyakinan, bukan kepastian absolut.

## 9. Pertimbangan Teknis & Desain

Rincian arsitektur sistem, ERD, use case, dan alur aktivitas ada di [`ARCHITECTURE.md`](./ARCHITECTURE.md). Rincian sistem desain visual (warna, tipografi, ikon, ilustrasi, motion) ada di [`DESIGN.md`](./DESIGN.md).

## 10. Kesesuaian SDG

| Target | Rumusan resmi | Keterkaitan |
|---|---|---|
| **4.4** | "By 2030, substantially increase the number of youth and adults who have relevant skills, including technical and vocational skills, for employment, decent jobs and entrepreneurship." | Inti produk — menutup jarak kompetensi vokasi-industri |
| **8.6** | Mengurangi proporsi pemuda yang tidak bekerja, tidak sekolah, dan tidak mengikuti pelatihan (NEET) | Dampak hilir — lulusan lebih siap kerja |

## 11. Dasar Pendanaan & Legalitas

Langganan sekolah dapat dibiayai dana BOSP sesuai **Permendikdasmen No. 8 Tahun 2026** (komponen "Pelaksanaan kegiatan pembelajaran", Pasal 42 ayat (1) huruf c: "penyediaan aplikasi atau perangkat lunak yang digunakan dalam proses pembelajaran"), dengan syarat: (a) diposisikan sebagai aplikasi pembelajaran — bukan aplikasi pendataan/pelaporan (larangan Pasal 66 ayat (1) huruf d & e), dan (b) tercatat dalam RKAS/ARKAS.

## 12. Metrik Keberhasilan

Bukan jumlah unduhan atau pengguna terdaftar. Metrik nyata: (1) waktu penyusunan perangkat ajar yang dihemat guru; (2) proporsi butir kompetensi di modul ajar final yang punya rujukan tertelusur; (3) jumlah Skill Delta Report yang benar-benar dipakai kaprogli dalam pengajuan resmi; (4) tingkat penerimaan (bukan penolakan) kartu saran dari waktu ke waktu, sebagai proksi kualitas pencocokan.

## 13. Prioritas (MoSCoW)

- **Must have:** F1, F2, F3 (mode ekstraktif), F4, F7, F9.
- **Should have:** F5, F8.
- **Could have:** F3 (mode perluasan AI opsional), F6, F10.
- **Won't have (tahap ini):** integrasi sinyal lowongan kerja otomatis (menunggu verifikasi API SIAPkerja/Karirhub), Knowledge Graph/QuadStore, IaC penuh.

## 14. Risiko & Asumsi

| Risiko | Mitigasi |
|---|---|
| Guru tidak punya waktu mencoba alat baru | Fokus F1–F4 memangkas kerja yang sudah wajib dilakukan, bukan menambah kerja baru |
| Status API SIAPkerja/Karirhub belum terverifikasi | Sumber sekunder didesain dapat dimatikan sepenuhnya tanpa merusak sistem utama |
| SKKNI jarang diperbarui, tertinggal dari industri | Mekanisme pelabelan gap (F6) menangkap kesenjangan tanpa bergantung pembaruan SKKNI |
| Dokumen SKKNI lama berupa hasil scan, sulit diparsing | Prioritaskan SKKNI dengan teks bersih untuk jurusan yang divalidasi lapangan lebih dulu |
| Guru kelebihan beban aplikasi (kelelahan platform) | Produk melengkapi (bukan menduplikasi) Ruang GTK/Rumah Pendidikan; ekspor dokumen mandiri |

## 15. Stakeholder

| Kategori | Aktor | Peran |
|---|---|---|
| Pengguna primer | Guru Produktif | Operasional harian |
| Pengguna primer | Kaprogli | Keputusan agregat |
| Penyetuju anggaran | Kepala Sekolah | Mengesahkan RKAS/ARKAS |
| Pemilik standar | Kemnaker | Penerbit SKKNI |
| Regulator | Kemendikdasmen | Permendikdasmen BOSP, Kurikulum Merdeka |
| Lembaga sertifikasi | LSP P1 SMK / BNSP | Pengguna hilir potensial |
| Penerima manfaat tidak langsung | Siswa | Menerima perangkat ajar yang lebih relevan |

## 16. Kriteria Penerimaan (Definition of Done — MVP)

- [ ] Guru dapat memilih unit kompetensi dan menerima minimal satu kartu saran yang teksnya tertelusur ke SKKNI asli.
- [ ] Tidak ada kartu saran yang masuk modul ajar final tanpa interaksi drag eksplisit dari guru.
- [ ] Resource Feasibility Checker menolak/menerima berdasarkan kategori alat, bukan string merek.
- [ ] Setiap penolakan/modifikasi guru tersimpan dan dapat diekspor sebagai data evaluasi.
- [ ] Dokumen modul ajar dapat diunduh dalam format yang tidak memerlukan akun aktif untuk dibaca kembali.
- [ ] Tidak ada klaim UI/copy yang menyatakan sistem "sempurna", "akurat 100%", atau setara.
