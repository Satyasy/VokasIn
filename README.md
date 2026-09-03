# VokasIn

> **Platform Asisten Analitik Kurikulum Berbasis Human-in-the-Loop (HITL) untuk SMK**  
> *Menjembatani Standar Kompetensi Kerja Nasional Indonesia (SKKNI) Kemnaker dengan Perangkat Ajar Operasional Kejuruan.*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B%20%7C%20pgvector-blue?logo=postgresql)](https://github.com/pgvector/pgvector)
[![ONNX Runtime](https://img.shields.io/badge/Embeddings-Local%20ONNX%20Inference-emerald)](https://huggingface.co/Xenova/multilingual-e5-small)
[![Terraform](https://img.shields.io/badge/IaC-Terraform%20(AWS%20Graviton)-623CE4?logo=terraform)](./terraform)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## 📌 Mengapa VokasIn?

Di jenjang SMK, terjadi kesenjangan (*mismatch*) besar antara **SKKNI resmi Kemnaker** (berisi puluhan unit kompetensi tebal) dengan **kebutuhan praktikum di bengkel/lab sekolah**:
1. **Beban Administratif Guru**: Guru produktif menghabiskan puluhan jam membedah dokumen PDF SKKNI menjadi Modul Ajar, jobsheet, dan rubrik penilaian secara manual.
2. **Keterbatasan Fasilitas Lab**: Modul ajar sering kali tidak realistis karena dirancang tanpa memeriksa apakah alat/mesin di lab sekolah benar-benar tersedia.
3. **Ketergantungan API Eksternal**: Solusi AI generatif berbasis API pihak ketiga memiliki latensi jaringan, risiko kebocoran data kurikulum, serta rentan halusinasi pada terminologi teknis vokasi spesifik.

**VokasIn hadir memecahkan masalah ini** menggunakan pendekatan *AI-Assisted Hybrid Classification* berbasis inferensi lokal, menjamin akurasi deterministik berdasar rujukan resmi, menjaga kedaulatan data sekolah, dan tidak bergantung pada API berbayar eksternal.

---

## ⚡ Fitur Utama

| Fitur | Deskripsi Singkat |
| :--- | :--- |
| **🚀 Client-Side PDF ETL Pipeline** | *Drag-and-drop* file PDF resmi SKKNI Kemnaker langsung di browser. Teks, nomor Kepmenaker, kode unit, judul, elemen, dan KUK diekstrak dalam 2–4 detik tanpa perlu mengunggah berkas besar ke server. |
| **🔍 Search Bar & Penelaahan Luas** | Halaman dedikasi lebar untuk menyaring unit berdasarkan kata kunci kompetensi industri (misal: *"Docker"*, *"Routing"*, *"API"*, *"Database"*) dengan tipografi yang renggang dan nyaman dibaca. |
| **🎯 Klasifikasi Semantik AI (HITL)** | Klasifikasi otomatis unit kompetensi ke jurusan (RPL vs TJKT) via *cosine distance* pgvector terhadap teks jangkar. Guru/Kaprogli memvalidasi hasil akhir melalui antarmuka *Drag-and-Drop* 3 kolom. |
| **🛠️ Resource Feasibility Checker** | Sistem otomatis memvalidasi apakah alat/bahan yang disyaratkan oleh KUK tersedia di inventaris bengkel sekolah sebelum modul ajar dicetak. |
| **📋 Kanvas Modul Ajar & Ekspor Multi-Format** | Guru menyusun modul ajar secara visual, menyematkan catatan pedagogi, dan mengekspor dokumen resmi siap pakai berformat **DOCX** (standar Kemendikbud) atau **PDF**. |
| **📊 Metrik Skill Delta & Alokasi JP** | Dasbor analitik untuk Kaprogli mengukur *Skill Delta Score* (rasio kesenjangan industri) serta pemantauan Jam Pelajaran (JP) sesuai regulasi **Permendikdasmen No. 8/2026**. |
| **🛡️ Privacy-by-Design (UU PDP No. 27/2022)** | Fitur *Jelajah Kompetensi* & *Roadmap* untuk siswa beroperasi murni di sisi klien. **Sama sekali tidak ada tabel data siswa di database**, menjamin privasi anak di bawah umur 100% aman. |

---

## 🏗️ Tech Stack & Alasan Pemilihannya

```
                    ┌──────────────────────────────────────────────┐
                    │               Next.js 16 (App Router)        │
                    │        React 19  •  Tailwind CSS v4          │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    │          Client-Side Processing Engine       │
                    │     PDF.js Web Worker  •  @dnd-kit/core      │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    │           Server & Local AI Inference        │
                    │    @huggingface/transformers (ONNX Runtime)  │
                    │        multilingual-e5-small (Q8)            │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    │               PostgreSQL Database            │
                    │     pgvector (Cosine <=>)  •  tsvector (FTS) │
                    └──────────────────────────────────────────────┘
```

### 1. Next.js 16 (App Router & Turbopack) + React 19
- **Alasan**: Mendukung arsitektur *Server Components* untuk keamanan akses basis data dan *Server Actions* untuk mutasi data instan tanpa perlu membangun REST API terpisah. Kompilasi Turbopack memberikan siklus iterasi yang sangat cepat.

### 2. PostgreSQL + Ekstensi `pgvector` & `tsvector` (Hybrid Search RRF)
- **Alasan**: Menggabungkan pencarian semantik vektor (`<=>` cosine distance) dengan pencarian leksikal kata kunci (*Full-Text Search*), lalu dilebur menggunakan algoritma **Reciprocal Rank Fusion (RRF, $k=60$)**. Istilah teknis vokasi yang spesifik tidak akan hilang atau halusinasi.

### 3. Eksekusi Inferensi AI Lokal: `@huggingface/transformers` (ONNX Runtime Q8)
- **Alasan**: Menjalankan model `Xenova/multilingual-e5-small` terkuantisasi 8-bit murni di CPU server/lokal. 
  - **Memory Footprint Ringan**: Alokasi memori konstan hanya ~220 MB RAM.
  - **Latensi Cepat**: Inferensi vektor selesai dalam 15–35 ms tanpa memerlukan GPU dedicated.
  - **Kedaulatan Data & Bebas Ketergantungan**: Inferensi berjalan mandiri (*on-premise / on-instance*); tidak ada data kurikulum atau portofolio sekolah yang dikirim ke penyedia AI eksternal.

### 4. Client-Side PDF Extraction (`pdfjs-dist` via Web Worker)
- **Alasan**: Dokumen SKKNI tebalnya bisa mencapai 100+ halaman (20–60 MB). Mengekstrak teks di memori browser pengguna menghilangkan *upload bottleneck* bermenit-menit pada koneksi internet sekolah yang terbatas.

### 5. `@dnd-kit` (Core & Sortable)
- **Alasan**: Library interaksi *drag-and-drop* berbasis standar aksesibilitas modern untuk React, sangat ringan dan mulus di perangkat desktop maupun tablet sekolah.

---

## ☁️ Infrastruktur Otomatis (Infrastructure as Code — Terraform)

Seluruh infrastruktur cloud produksi VokasIn dikodifikasi secara deklaratif menggunakan **Terraform** pada direktori [`terraform/`](./terraform), menjamin replikasi lingkungan yang cepat, aman, dan dapat diaudit:

- **Komputasi Efisien (AWS Graviton2)**: Menggunakan instans **EC2 `t4g.small` (ARM64)** yang hemat energi dan memiliki rasio *price-to-performance* tinggi untuk eksekusi runtime Node.js dan ONNX.
- **Jaringan & Keamanan**:
  - Konfigurasi Security Group terisolasi: port `22` (SSH terkelola), port `80` (HTTP reverse proxy Nginx), dan port `443` (HTTPS terenkripsi SSL via Certbot).
  - Alokasi **Elastic IP (EIP)** statis untuk konsistensi DNS domain produksi.
- **Automated Provisioning (Cloud-Init `user_data`)**:
  - Konfigurasi **2 GB Swapfile** otomatis untuk mencegah *Out-of-Memory* saat kompilasi build pada RAM 2 GB.
  - Pemasangan otomatis Node.js 24 LTS, Nginx (*reverse proxy* dengan batas muatan `client_max_body_size 50M`), PM2 Process Manager (*systemd auto-restart on boot*), dan PostgreSQL lokal.

### Cara Menerapkan Infrastruktur:
```bash
cd terraform

# 1. Inisialisasi provider AWS
terraform init

# 2. Periksa rencana perubahan infrastruktur
terraform plan

# 3. Terapkan provisioning ke AWS
terraform apply
```

---

## 🚀 Memulai (Panduan Menjalankan Lokal)

### Prasyarat
- **Node.js**: `v20.x` atau `v22.x` / `v24.x`
- **PostgreSQL**: `v15+` dengan ekstensi `pgvector` terpasang
- **NPM** / **PNPM**

### 1. Klon Repositori & Pasang Dependensi
```bash
git clone https://github.com/Satyasy/VokasIn.git
cd VokasIn
npm install
```

### 2. Konfigurasi Lingkungan (`.env.local`)
Salin atau buat file `.env.local` di root proyek:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/vokasin?sslmode=disable"
SESSION_SECRET="kunci-rahasia-sesi-minimal-32-karakter"
```

### 3. Inisialisasi Database & Vektor
Jalankan skrip migrasi skema dan *seed data* dasar:
```bash
# Menjalankan schema dasar dan tabel anchor AI
npm run migrate # atau jalankan scripts/schema.sql & scripts/add_anchor_table.sql di database Anda
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Akses aplikasi melalui peramban di [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Direktori Utama

```text
├── app/                      # Next.js App Router (Rute & Server Actions)
│   ├── admin/                # Dasbor Admin, Manajemen Pengguna & SKKNI
│   ├── guru/                 # Dasbor Guru, Kanvas Modul Ajar, Halaman Unggah SKKNI
│   ├── kaprogli/             # Dasbor Kaprogli, Verifikasi Jurusan, Validasi Lab
│   ├── jelajah-kompetensi/   # Pencarian Semantik Portofolio Siswa (Client-side)
│   └── roadmap/              # Visualisasi Roadmap Kompetensi Kejuruan
├── components/               # Komponen Antarmuka Reusable
│   ├── guru/                 # Kanvas Modul Ajar & Koreksi Guru
│   ├── kaprogli/             # Dasbor Analitik & Validasi Kurikulum
│   ├── skkni/                # Drag-and-Drop Classification & Ekstraksi PDF
│   └── ui/                   # Sistem Desain (Design System) VokasIn
├── lib/                      # Utilitas Inti & Logika Bisnis
│   ├── embedding.ts          # Pipeline Embedding ONNX Lokal
│   ├── skkni-text-extractor.ts # Ekstraktor Teks & Heuristic Word Healing
│   ├── client-pdf-parser.ts  # Mesin Ekstraksi PDF di Browser (PDF.js)
│   ├── data-access-db.ts     # Hybrid Search RRF & Query PostgreSQL
│   └── types.ts              # Kontrak Tipe Data TypeScript (ERD Domain)
├── terraform/                # Infrastructure as Code (AWS EC2, EIP, Nginx, PM2)
├── public/                   # Asset Statis & pdf.worker.min.mjs
└── scripts/                  # Skrip Migrasi SQL & Seed Data SKKNI
```

---

## 📜 Kepatuhan & Kebijakan Data
- **UU No. 27 Tahun 2022 (Perlindungan Data Pribadi)**: VokasIn tidak menyimpan profil, identitas, maupun data komputasi siswa di basis data (*Zero-Student Database*).
- **Permendikdasmen No. 8 Tahun 2026**: Struktur alokasi jam pembelajaran dan pelaporan JP guru dirancang selaras dengan panduan beban ajar kejuruan terbaru.
- **Kedaulatan Konten**: Dokumen hasil susunan modul ajar adalah milik penuh institusi sekolah dan dapat diunduh kapan saja tanpa pembatasan platform.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi terbuka [MIT License](./LICENSE). Silakan gunakan, pelajari, dan kembangkan untuk kemajuan pendidikan vokasi di Indonesia.

---

<p align="center">
  Dikembangkan dengan integritas untuk memajukan pendidikan vokasi Indonesia.
</p>
