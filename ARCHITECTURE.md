# ARCHITECTURE — VokasIn

**Versi:** 1.0 · **Tanggal:** 19 Agustus 2026
**Prinsip pegangan:** relasional sederhana, bukan Knowledge Graph/QuadStore; embedding similarity diakui secara eksplisit, bukan diklaim "dihilangkan"; validasi berbasis SKKNI hanya menyaring, tidak "menjamin akurasi mutlak".

---

## 1. Ringkasan Lapisan Sistem

Enam lapisan, dari mentah ke actionable. Hanya Layer 3 yang punya jalur opsional ke LLM generatif — jalur default seluruhnya non-generatif (parsing, embedding, aturan).

```mermaid
flowchart TD
    subgraph L0["Layer 0 — Data Ingestion (Non-ML)"]
        A1[SKKNI PDF Parser]
        A2["Konektor Sumber Sekunder (opsional, legal)"]
    end
    subgraph L1["Layer 1 — Normalisasi & Entity Linking (ML Ringan)"]
        B1[NER berbasis IndoBERT]
        B2[Resolusi Sinonim via Embedding]
    end
    subgraph L2["Layer 2 — Pencarian Semantik (Non-Generatif)"]
        C1[Vector Similarity Matching]
    end
    subgraph L3["Layer 3 — Komposisi Kartu Saran"]
        D1["Ekstraktif dari Teks Asli (default)"]
        D2["Perluas dengan AI (opsional, ditandai)"]
    end
    subgraph L4["Layer 4 — Human-in-the-Loop"]
        E1[Drag-and-Drop Kartu Saran]
        E2[Resource Feasibility Checker]
        E3[Edit Pedagogi & Ekspor]
    end
    subgraph L5["Layer 5 — Feedback Loop"]
        F1["Simpan Koreksi Guru (Data Nyata)"]
    end
    subgraph L6["Layer 6 — Dasbor Kaprogli"]
        G1[Skill Delta Report]
    end

    A1 --> B1
    A2 -.opsional & legal.-> B1
    B1 --> C1
    B2 --> C1
    C1 -->|terdaftar di SKKNI| D1
    C1 -.tidak terdaftar.-> F1
    D1 -.opsional.-> D2
    D1 --> E1
    D2 -.-> E1
    E1 --> E2
    E2 --> E3
    E2 --> F1
    F1 -.kalibrasi berkala — BUKAN validasi masalah.-> C1
    E3 --> G1
    F1 --> G1
```

### Penjelasan tiap lapisan

- **Layer 0 — Data Ingestion.** Parsing dokumen PDF SKKNI resmi menjadi struktur Unit Kompetensi–Elemen–Kriteria Unjuk Kerja. Konektor sumber sekunder bersifat opsional dan hanya boleh menyala jika sumbernya legal (API resmi seperti SIAPkerja/Karirhub, atau input manual guru/kaprogli) — **tidak pernah** web scraping.
- **Layer 1 — Normalisasi.** NER (IndoBERT) mengekstrak entitas skill/alat dari teks sumber sekunder; embedding menyamakan istilah berbeda penamaan antar dokumen. Ini tahap probabilistik — akurasinya dibatasi kualitas model, bukan sempurna.
- **Layer 2 — Pencarian Semantik.** Vector similarity mencocokkan entitas ke Unit Kompetensi SKKNI. Ini **wajib diakui eksplisit dalam dokumentasi** — mencocokkan istilah bebas industri ke istilah baku SKKNI nyaris mustahil dengan exact-match saja.
- **Layer 3 — Komposisi Kartu Saran.** Jalur default: susun ulang teks Elemen+KUK asli (ekstraktif, hampir tidak mungkin berhalusinasi karena tidak mengarang). Jalur opsional: "Perluas dengan AI" memakai LLM hanya atas permintaan eksplisit guru, hasilnya selalu ditandai sebagai buatan AI.
- **Layer 4 — Human-in-the-Loop.** Guru menyeret kartu satu per satu (bukan tombol "setuju semua"); Resource Feasibility Checker mencocokkan **kategori/fungsi** alat terhadap inventaris lab sekolah sebelum kartu dianggap layak.
- **Layer 5 — Feedback Loop.** Setiap keputusan guru (terima/tolak/modifikasi) tersimpan sebagai data nyata. Data ini dipakai untuk kalibrasi ulang model pencocokan secara berkala — **bukan** untuk memvalidasi apakah masalahnya nyata (itu sudah selesai lewat riset lapangan terpisah).
- **Layer 6 — Dasbor Kaprogli.** Skill Delta Report mengagregasi hasil per program keahlian/semester — dasar kuantitatif untuk mengajukan revisi kurikulum atau anggaran alat.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    SEKOLAH ||--o{ PROGRAM_KEAHLIAN : memiliki
    SEKOLAH ||--o{ GURU : mempekerjakan
    PROGRAM_KEAHLIAN ||--o{ GURU : menaungi
    DOKUMEN_SKKNI ||--o{ UNIT_KOMPETENSI : berisi
    UNIT_KOMPETENSI ||--o{ ELEMEN_KOMPETENSI : memiliki
    ELEMEN_KOMPETENSI ||--o{ KRITERIA_UNJUK_KERJA : menjabarkan
    SUMBER_SEKUNDER ||--o{ SKILL_ENTITY : menghasilkan
    SKILL_ENTITY ||--o{ PEMETAAN_SKILL_UNIT : dipetakan
    UNIT_KOMPETENSI ||--o{ PEMETAAN_SKILL_UNIT : menjadi_target
    GURU ||--o{ MODUL_AJAR_DRAFT : menyusun
    PROGRAM_KEAHLIAN ||--o{ MODUL_AJAR_DRAFT : untuk
    UNIT_KOMPETENSI ||--o{ MODUL_AJAR_DRAFT : merujuk
    MODUL_AJAR_DRAFT ||--o{ SARAN_TOPIK : berisi
    UNIT_KOMPETENSI ||--o{ SARAN_TOPIK : berbasis
    SARAN_TOPIK ||--o{ KOREKSI_GURU : dikoreksi
    GURU ||--o{ KOREKSI_GURU : membuat
    SEKOLAH ||--o{ SUMBER_DAYA_LAB : memiliki
    PROGRAM_KEAHLIAN ||--o{ SUMBER_DAYA_LAB : memakai
    PROGRAM_KEAHLIAN ||--o{ SKILL_DELTA_REPORT : menerima
```

### Klaster & alasan desain

| Klaster | Tabel | Kenapa dipisah begini |
|---|---|---|
| Kelembagaan | `Sekolah`, `ProgramKeahlian`, `Guru` | Akar konteks institusional |
| Rujukan Primer | `DokumenSKKNI`, `UnitKompetensi`, `ElemenKompetensi`, `KriteriaUnjukKerja` | Meniru persis hierarki dokumen resmi negara — tertelusur penuh ke sumber |
| Sumber Sekunder | `SumberSekunder`, `SkillEntity`, `PemetaanSkillUnit` | **Sengaja terpisah total** dari rujukan primer; jika API sekunder ternyata tidak legal/tidak tersedia, klaster ini bisa dimatikan tanpa merusak apa pun di klaster primer |
| Kerja Guru | `ModulAjarDraft`, `SaranTopik`, `KoreksiGuru` | `KoreksiGuru` adalah implementasi konkret prinsip "data nyata untuk validasi, sintetis hanya untuk augmentasi" |
| Sumber Daya & Pelaporan | `SumberDayaLab`, `SkillDeltaReport` | Basis kebenaran fisik untuk Resource Feasibility Checker; output agregat untuk kaprogli |

**Field kunci yang wajib ada:** `PemetaanSkillUnit.status_pemetaan` — enum `terpetakan_skkni` / `gap_kandidat`. Field inilah yang mengimplementasikan aturan "skill di luar SKKNI ditandai gap, bukan ditolak otomatis".

---

## 3. Use Case Diagram (ringkasan tekstual)

**Aktor:** Guru Produktif, Kaprogli.

| Use Case | Aktor | Relasi |
|---|---|---|
| Login & Pilih Program Keahlian | Guru, Kaprogli | — |
| Melihat Kartu Saran Kompetensi (Sumber: SKKNI) | Guru | *included by* "Menyusun & Mengekspor Modul Ajar" |
| Memvalidasi Kelayakan Alat Lab | Guru | *included by* "Menyusun & Mengekspor Modul Ajar" |
| Menyusun & Mengekspor Modul Ajar | Guru | — |
| Memberi Koreksi/Menolak Kartu Saran | Guru | *extends* "Melihat Kartu Saran" |
| Melihat Dashboard Skill Delta Score | Kaprogli | *includes* "Meninjau Kandidat Gap" |
| Mengelola Inventaris Alat Lab | Kaprogli | — |
| Meninjau Kandidat Kesenjangan Kompetensi (Gap) | Kaprogli | — |

## 4. Activity Diagram (ringkasan tekstual — alur "Menyusun Modul Ajar")

1. Guru memilih unit kompetensi target → meminta saran kompetensi.
2. Sistem mengekstrak Elemen+KUK dari SKKNI → mencocokkan via embedding similarity.
3. Jika entitas **terdaftar** di SKKNI → sistem menyusun kartu saran ekstraktif → dikirim ke guru.
4. Jika **tidak terdaftar** → ditandai kandidat gap, masuk Skill Delta Report (tidak dibuang).
5. Guru meninjau kartu → memutuskan: **terima** (lanjut konfirmasi alat → drag ke kanvas → edit pedagogi → ekspor) atau **tolak/modifikasi** (tersimpan sebagai KoreksiGuru → guru diberi kartu alternatif).
6. Setiap keputusan guru menjadi data kalibrasi berkala untuk Layer 2 — bukan validasi ulang masalah.

---

## 5. Prinsip Data

1. **Data nyata wajib** untuk: validasi bahwa masalah ada, evaluasi performa model (held-out set), dan klaim dampak.
2. **Data sintetis hanya boleh** untuk: augmentasi pelatihan, uji beban, penyeimbangan kelas minoritas.
3. **Dilarang keras:** meng-generate unit kompetensi atau kriteria unjuk kerja sintetis lalu memperlakukannya sebagai standar asli.
4. **Setiap klaim akurasi di UI harus menampilkan tingkat keyakinan**, bukan pernyataan mutlak ("akurat", "terjamin", "sempurna").

## 6. Catatan Teknis Terbuka

- **Stack:** belum final — Next.js/TypeScript di frontend sudah pasti; pilihan backend (FastAPI/Python vs alternatif) masih terbuka dan tidak memengaruhi validitas arsitektur data di atas.
- **Basis data:** PostgreSQL + tabel relasional (foreign key) sudah cukup untuk hierarki SKKNI yang dangkal (3 tingkat). **Jangan** menambah Knowledge Graph/QuadStore terpisah — itu overengineering untuk struktur pohon sesederhana ini.
- **Status API sumber sekunder** (SIAPkerja/Karirhub) belum terverifikasi — desain sistem harus tetap utuh fungsinya bila jalur ini nonaktif total.
