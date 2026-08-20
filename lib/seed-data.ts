import type {
  ProgramKeahlian,
  UnitKompetensi,
  SkillEntity,
  SaranTopik,
} from "./types";

// Data contoh realistis (bukan Lorem Ipsum) — lihat CLAUDE.md "Data contoh".
//
// Provenance per unit (jangan hapus catatan ini tanpa verifikasi ulang):
// - uk-01, uk-02: disalin PERSIS dari dokumen SKKNI asli di data/skkni-raw/
//   (Kepmenaker No. 22 Tahun 2019, unit ICTTEN5201A & ICTNWK506). Lihat field
//   "sumber" per unit untuk kode unit + halaman.
// - uk-03: disalin dari SKKNI No. 300 Tahun 2020 (Internet of Things), unit
//   J.61IOT01.005.1 "Menguji Coba Device IoT". Halaman dikoreksi ke 40-43
//   (nomor footer tercetak di dokumen; catatan sesi sebelumnya "hal. 45-47"
//   ternyata salah baca). programKeahlianId dipindah ke "pk-tkj" — TKJ
//   (jaringan/infrastruktur) menaungi topik IoT lebih masuk akal daripada
//   RPL; tidak ada unit SKKNI "debugging perangkat lunak" di data/skkni-raw/
//   sama sekali, jadi pemetaan lama ke pk-rpl memang keliru sejak awal.
// - uk-04, uk-05, uk-06: unit baru (sesi ini), dipilih dari
//   data/skkni-parsed.json karena elemen paling sedikit (2-3) dan topik
//   (Cloud Computing, AI) belum terwakili oleh uk-01..03. Tiap teks
//   Elemen/KUK diverifikasi terhadap `pdftotext -layout` mentah per unit
//   (bukan hanya hasil parser regex). Baris yang melebar 2 kolom pada
//   dokumen asli direkonstruksi dengan memisah kolom saja (tanpa menambah
//   kata) dan ditandai VERIFIKASI ULANG di komentar KUK terkait.
//
// Status berkas SKKNI di data/skkni-raw/: hanya 4 PDF tersedia (Kepmenaker
// 22/2019, 102/2023, 300/2020, 103/2026) — bukan 5, sejak awal proyek ini.
//
// - uk-07: pk-rpl sempat 0 unit (lihat riwayat di atas — uk-03 dipindah ke
//   pk-tkj). Dicari 1 unit pemrograman/software murni di skema B dokumen
//   Kepmenaker 22/2019: ICAPRG502A "Manage a project using software
//   management tools", hal. 1112-1118 (skema adopsi, bukan skema resmi J./K.).
//   parser regex menandai unit ini parsing_uncertain karena Elemen/KUK
//   melebar 2 kolom yang tidak bisa dipisah otomatis — sama seperti uk-04.
//   Diverifikasi manual terhadap `pdftotext -layout` mentah halaman
//   1112-1118: versi INGGRIS-nya (hal. 1115) bersih dan tidak melebar 2
//   kolom, dipakai sebagai rujukan pengurutan yang pasti. Versi INDONESIA
//   (hal. 1116) melebar 2 kolom — label 3 judul Elemen tercetak di kolom
//   kiri terpisah dari 10 teks KUK bernomor (1.1-3.3) di kolom kanan, dan
//   nomor elemen ikut tergeser saat digabung linear. Direkonstruksi dengan
//   memisah kolom kiri (3 judul Elemen, urutan sesuai versi Inggris) dari
//   kolom kanan (10 teks KUK, dikelompokkan menurut prefiks nomornya
//   sendiri: 1.x/2.x/3.x) tanpa menambah kata — ditandai VERIFIKASI ULANG
//   di komentar Elemen ke-3 karena urutan kata judulnya paling mencurigakan.
//   Kebutuhan alat diambil dari "Context of and specific resources for
//   assessment" (hal. 1119) — setara Batasan Variabel pada skema resmi.

export const programKeahlian: ProgramKeahlian[] = [
  { id: "pk-tkj", nama: "Teknik Komputer dan Jaringan", singkatan: "TKJ" },
  { id: "pk-rpl", nama: "Rekayasa Perangkat Lunak", singkatan: "RPL" },
  // uk-04 (AI) tidak masuk tema jaringan/infrastruktur/elektronika TKJ
  // maupun RPL secara wajar — dibuat netral, bukan dipaksa ke pk-rpl.
  // Perlu diberi nama/dipetakan oleh kaprogli sungguhan, bukan ditebak sistem.
  { id: "pk-belum-ditentukan", nama: "(Belum ditentukan oleh kaprogli)", singkatan: "?" },
];

// guru pindah ke Postgres (tabel guru, kolom email/password_hash/role
// ditambahkan untuk auth) — lihat scripts/seed.sql dan lib/data-access-db.ts.

export const unitKompetensi: UnitKompetensi[] = [
  {
    id: "uk-01",
    kodeUnit: "ICTTEN5201A",
    judulUnit: "Instal, Konfigurasi dan Uji Server",
    dokumenSkkni: "Kepmenaker No. 22 Tahun 2019",
    sumber: "Kepmenaker No. 22 Tahun 2019, unit ICTTEN5201A, hal. 1169–1175",
    programKeahlianId: "pk-tkj",
    elemenKompetensi: [
      {
        id: "ek-01",
        judul: "Persiapkan untuk memasang server",
        kriteriaUnjukKerja: [
          {
            id: "kuk-01",
            kode: "1.4",
            // VERIFIKASI ULANG: dokumen sumber tercetak "refeensi" (bukan "referensi") — kemungkinan typo pada dokumen asli/hasil scan, disalin persis apa adanya.
            teks:
              "Pilih server yang paling sesuai dengan refeensi ke aplikasi server dan fitur server yang diperlukan.",
          },
          {
            id: "kuk-02",
            kode: "1.11",
            teks: "Buat dan dokumentasikan rencana penerapan.",
          },
        ],
      },
      {
        id: "ek-02",
        judul: "Instal dan konfigurasi server",
        kriteriaUnjukKerja: [
          {
            id: "kuk-03",
            kode: "2.2",
            teks:
              "Instal dan konfigurasikan server seperti yang dipersyaratkan oleh persyaratan teknis dan spesifikasi fungsional.",
          },
          {
            id: "kuk-04",
            kode: "2.4",
            teks:
              "Hubungkan kembali dan konfigurasi ulang perangkat konektivitas yang relevan.",
          },
        ],
      },
    ],
  },
  {
    id: "uk-02",
    kodeUnit: "ICTNWK506",
    judulUnit:
      "Melakukan Konfigurasi, Verifikasi, dan Mengatasi Masalah Tautan WAN dan Layanan IP di Jaringan Perusahaan Menengah",
    dokumenSkkni: "Kepmenaker No. 22 Tahun 2019",
    sumber: "Kepmenaker No. 22 Tahun 2019, unit ICTNWK506, hal. 1135–1143",
    programKeahlianId: "pk-tkj",
    elemenKompetensi: [
      {
        id: "ek-03",
        judul: "Melakukan konfigurasikan tautan WAN",
        kriteriaUnjukKerja: [
          {
            id: "kuk-05",
            kode: "2.1",
            teks:
              "Menentukan metode yang berbeda untuk menghubungkan ke jaringan area luas (WAN).",
          },
          {
            id: "kuk-06",
            kode: "2.4",
            teks: "Menentukan teknologi jaringan pribadi virtual (VPN).",
          },
        ],
      },
      {
        id: "ek-04",
        judul: "Mengatasi masalah tautan WAN pada perusahaan menengah",
        kriteriaUnjukKerja: [
          {
            id: "kuk-07",
            kode: "5.1",
            teks: "Mengatasi masalah implementasi WAN.",
          },
          {
            id: "kuk-12",
            kode: "5.2",
            teks: "Memperbaiki masalah WAN.",
          },
        ],
      },
    ],
  },
  {
    id: "uk-03",
    kodeUnit: "J.61IOT01.005.1",
    judulUnit: "Menguji Coba Device IoT",
    dokumenSkkni: "Kepmenaker No. 300 Tahun 2020",
    sumber: "Kepmenaker No. 300 Tahun 2020, unit J.61IOT01.005.1, hal. 40–43",
    programKeahlianId: "pk-tkj",
    elemenKompetensi: [
      {
        id: "ek-05",
        judul: "Melakukan persiapan uji coba",
        kriteriaUnjukKerja: [
          {
            id: "kuk-08",
            kode: "1.1",
            teks:
              "Jenis jaringan dan detail spesifikasi sistem IoT yang akan diujicoba diidentifikasi.",
          },
          {
            id: "kuk-09",
            kode: "1.2",
            teks: "Device IoT disiapkan untuk persiapan uji coba.",
          },
          {
            id: "kuk-13",
            kode: "1.3",
            teks:
              "Alur kerja aplikasi beserta panduannya disiapkan sebelum uji coba dimulai.",
          },
          {
            id: "kuk-14",
            kode: "1.4",
            teks:
              "Peralatan antistatic untuk persiapan uji coba disiapkan sesuai kebutuhan.",
          },
        ],
      },
      {
        id: "ek-06",
        judul: "Melakukan pengujian desain aplikasi",
        kriteriaUnjukKerja: [
          {
            id: "kuk-10",
            kode: "2.1",
            // VERIFIKASI ULANG: dokumen sumber melebar 2 kolom di baris ini —
            // "desain aplikasi" (sisa judul Elemen 2) tercetak berdampingan
            // dengan awal kalimat KUK ini. Teks di bawah adalah rekonstruksi
            // dari 3 fragmen kolom kanan digabung berurutan (tanpa menambah
            // kata), bukan salinan satu baris bersih seperti KUK lain di unit
            // ini — perlu dicek ulang terhadap PDF asli.
            teks:
              "Device IoT yang sesuai dengan rancangan desain sesuai cetak biru disiapkan sesuai desain.",
          },
          {
            id: "kuk-11",
            kode: "2.2",
            teks:
              "Aplikasi yang tertanam sesuai dengan tujuan nya disiapkan sesuai desain.",
          },
        ],
      },
    ],
  },
  {
    id: "uk-04",
    kodeUnit: "K.62AIN00.001.2",
    judulUnit: "Menentukan Sasaran Bisnis Solusi Artificial Intelligence",
    dokumenSkkni: "Kepmenaker No. 103 Tahun 2026",
    sumber: "Kepmenaker No. 103 Tahun 2026, unit K.62AIN00.001.2, hal. 16–18",
    programKeahlianId: "pk-belum-ditentukan",
    elemenKompetensi: [
      {
        id: "ek-07",
        judul: "Mengidentifikasi permasalahan dan sasaran bisnis proyek Artificial Intelligence (AI)",
        kriteriaUnjukKerja: [
          {
            id: "kuk-15",
            kode: "1.1",
            teks:
              "Latar belakang, tujuan, dan permasalahan bisnis proyek AI diidentifikasi sesuai dengan prosedur bisnis AI yang berlaku.",
          },
          {
            id: "kuk-16",
            kode: "1.2",
            teks:
              "Poin-poin sasaran bisnis Solusi AI diidentifikasi sesuai dengan permasalahan bisnis proyek AI.",
          },
        ],
      },
      {
        id: "ek-08",
        judul: "Menyusun kriteria kesuksesan dari sasaran bisnis proyek AI",
        kriteriaUnjukKerja: [
          {
            id: "kuk-17",
            kode: "2.1",
            // VERIFIKASI ULANG: dokumen sumber melebar 2 kolom di elemen ini —
            // judul elemen (kolom kiri) dan teks KUK 2.1+2.2 (kolom kanan)
            // tercetak berselang-seling per baris, dengan marker "2.2"
            // muncul di baris terakhir kolom kiri tanpa teks menyertainya.
            // Direkonstruksi dengan memisah kolom kiri/kanan lalu urut
            // baris kolom kanan (tanpa menambah kata) — perlu dicek ulang
            // terhadap PDF asli.
            teks:
              "Elemen-elemen metrik kesuksesan dibuat berdasarkan sasaran bisnis Solusi AI.",
          },
          {
            id: "kuk-18",
            kode: "2.2",
            // VERIFIKASI ULANG: lihat catatan pada kuk-17 — hasil rekonstruksi
            // kolom yang sama.
            teks:
              "Kriteria kesuksesan dari sasaran bisnis proyek AI dipilih sesuai dengan objektif bisnis Solusi AI.",
          },
        ],
      },
    ],
  },
  {
    id: "uk-05",
    kodeUnit: "J.63HOS00.003.2",
    judulUnit: "Menjabarkan Berbagai Jenis Perangkat Keras Cloud Computing",
    dokumenSkkni: "Kepmenaker No. 102 Tahun 2023",
    sumber: "Kepmenaker No. 102 Tahun 2023, unit J.63HOS00.003.2, hal. 26–28",
    programKeahlianId: "pk-tkj",
    elemenKompetensi: [
      {
        id: "ek-09",
        judul: "Mengidentifikasi fungsi perangkat keras untuk sistem cloud",
        kriteriaUnjukKerja: [
          {
            id: "kuk-19",
            kode: "1.1",
            teks:
              "Berbagai perangkat keras dideskripsikan sesuai dengan pemanfaatan pada cloud.",
          },
          {
            id: "kuk-20",
            kode: "1.2",
            teks:
              "Perangkat keras penyimpan data diuraikan sesuai dengan pemanfaatan pada cloud.",
          },
          {
            id: "kuk-21",
            kode: "1.3",
            teks:
              "Perangkat interkoneksi dalam jaringan wireless dan wire diuraikan sesuai dengan pemanfaatan pada cloud.",
          },
        ],
      },
      {
        id: "ek-10",
        judul: "Menguraikan jenis perangkat yang memenuhi fungsi cloud",
        kriteriaUnjukKerja: [
          {
            id: "kuk-22",
            kode: "2.1",
            teks:
              "Berbagai penggunaan jenis perangkat keras pada sistem cloud computing dideskripsikan sesuai dengan fungsinya pada sistem cloud.",
          },
          {
            id: "kuk-23",
            kode: "2.2",
            teks:
              "Berbagai jenis perangkat keras penyimpanan data (hard disk/SSD, dlsb) dideskripsikan sesuai dengan jenis fungsinya pada pada sistem cloud.",
          },
          {
            id: "kuk-24",
            kode: "2.3",
            teks: "Berbagai router dan switch pada sistem cloud diuraikan.",
          },
        ],
      },
    ],
  },
  {
    id: "uk-06",
    kodeUnit: "J.63HOS00.018.2",
    judulUnit: "Melakukan Antisipasi Gangguan dan Ancaman terhadap Sistem Cloud",
    dokumenSkkni: "Kepmenaker No. 102 Tahun 2023",
    sumber: "Kepmenaker No. 102 Tahun 2023, unit J.63HOS00.018.2, hal. 83–86",
    programKeahlianId: "pk-tkj",
    elemenKompetensi: [
      {
        id: "ek-11",
        judul:
          "Mendeteksi gangguan dan ancaman terhadap keamanan sistem cloud secara berkelanjutan",
        kriteriaUnjukKerja: [
          {
            id: "kuk-25",
            kode: "1.1",
            teks:
              "Potensi gangguan dan ancaman terhadap keamanan sistem cloud diidentifikasi sesuai dengan model risiko yang ada.",
          },
          {
            id: "kuk-26",
            kode: "1.2",
            teks:
              "Kondisi keamanan layanan sistem cloud yang teridentifikasi dianalisis secara lengkap meliputi aspek teknis dan non-teknis.",
          },
        ],
      },
      {
        id: "ek-12",
        judul: "Menyusun rencana pencegahan terhadap gangguan dan ancaman pada sistem cloud",
        kriteriaUnjukKerja: [
          {
            id: "kuk-27",
            kode: "2.1",
            teks:
              "Strategi pemulihan sistem cloud setelah kejadian gangguan dan ancaman ditentukan sesuai kebutuhan organisasi.",
          },
          {
            id: "kuk-28",
            kode: "2.2",
            teks:
              "Pemulihan sistem cloud setelah kejadian gangguan dan ancaman dilakukan sesuai dengan strategi pemulihan sistem cloud.",
          },
          {
            id: "kuk-29",
            kode: "2.3",
            teks: "Pencegahan terhadap gangguan dan ancaman pada sistem cloud dilakukan secara berkelanjutan.",
          },
        ],
      },
      {
        id: "ek-13",
        judul:
          "Mendokumentasi potensi dan rencana pencegahan terhadap gangguan dan ancaman terhadap sistem cloud",
        kriteriaUnjukKerja: [
          {
            id: "kuk-30",
            kode: "3.1",
            teks:
              "Laporan hasil analisis data gangguan dan ancaman keamanan sistem cloud disusun secara lengkap sesuai dengan aspek teknis dan non teknis.",
          },
          {
            id: "kuk-31",
            kode: "3.2",
            teks:
              "Rencana pencegahan dan pemulihan sistem cloud setelah kejadian gangguan dan ancaman disusun secara lengkap sesuai dengan Service Level Agreement (SLA).",
          },
        ],
      },
    ],
  },
  {
    id: "uk-07",
    kodeUnit: "ICAPRG502A",
    judulUnit: "Mengelola Sebuah Proyek Menggunakan Software Management Tools",
    dokumenSkkni: "Kepmenaker No. 22 Tahun 2019",
    sumber: "Kepmenaker No. 22 Tahun 2019, unit ICAPRG502A, hal. 1112–1118",
    programKeahlianId: "pk-rpl",
    elemenKompetensi: [
      {
        id: "ek-14",
        judul: "Mengidentifikasi perangkat lunak alat manajemen",
        kriteriaUnjukKerja: [
          {
            id: "kuk-32",
            kode: "1.1",
            teks: "Menentukan perangkat lunak metodologi pengembangan yang akan digunakan untuk pengembangan proyek.",
          },
          {
            id: "kuk-33",
            kode: "1.2",
            teks: "Menentukan perangkat lunak proyek-manajemen yang akan digunakan untuk mengelola pengembangan proyek.",
          },
          {
            id: "kuk-34",
            kode: "1.3",
            teks: "Menentukan sistem kontrol-sumber untuk mengelola kode sumber dan menangani konflik.",
          },
          {
            id: "kuk-35",
            kode: "1.4",
            teks: "Menentukan perangkat lunak kolaborasi untuk digunakan dalam pengembangan proyek.",
          },
        ],
      },
      {
        id: "ek-15",
        judul: "Melaksanakan alat manajemen perangkat lunak",
        kriteriaUnjukKerja: [
          {
            id: "kuk-36",
            kode: "2.1",
            teks: "Membuat rencana proyek sesuai dengan spesifikasi kebutuhan perangkat lunak.",
          },
          {
            id: "kuk-37",
            kode: "2.2",
            teks: "Menentukan prosedur kontrol-sumber.",
          },
          {
            id: "kuk-38",
            kode: "2.3",
            teks: "Membuat lingkungan kolaborasi.",
          },
        ],
      },
      {
        id: "ek-16",
        // VERIFIKASI ULANG: dokumen sumber (hal. 1116) mencetak judul elemen ini
        // sebagai "Penggunaan Monitor alat manajemen perangkat lunak" (urutan
        // kata tergeser akibat wrap 2 kolom). Disusun ulang mengikuti urutan
        // kata versi Inggris bersih di hal. 1115 ("Monitor use of software
        // management tools") tanpa menambah kata baru.
        judul: "Memantau penggunaan alat manajemen perangkat lunak",
        kriteriaUnjukKerja: [
          {
            id: "kuk-39",
            kode: "3.1",
            teks: "Memantau dan menyesuaikan rencana proyek untuk mempertahankan kemajuan sesuai dengan rencana proyek.",
          },
          {
            id: "kuk-40",
            kode: "3.2",
            teks: "Memastikan kode dengan benar dimasukkan ke dalam sistem kontrol sumber.",
          },
          {
            id: "kuk-41",
            kode: "3.3",
            teks: "Memantau lingkungan kolaborasi dan menyelesaikan masalah di mana diperlukan.",
          },
        ],
      },
    ],
  },
];

// sumberDayaLab pindah ke Postgres (tabel sumber_daya_lab) — lihat
// scripts/seed.sql untuk seed awal (nilai identik dengan array lama ini) dan
// lib/data-access.ts untuk baca/tulisnya. Sengaja TIDAK ada entri "server"
// untuk pk-rpl di seed itu — mensimulasikan gap infrastruktur nyata untuk
// demo Resource Feasibility Checker.

export const saranTopik: SaranTopik[] = [
  {
    id: "st-01",
    unitKompetensiId: "uk-01",
    elemenKompetensiId: "ek-02",
    judul: "Instalasi dan Konfigurasi Server sesuai Spesifikasi Teknis",
    isiEkstraktif:
      "Instal dan konfigurasikan server seperti yang dipersyaratkan oleh persyaratan teknis dan spesifikasi fungsional. Hubungkan kembali dan konfigurasi ulang perangkat konektivitas yang relevan.",
    alatDibutuhkan: [
      { kategori: "komputer-kerja", label: "Server rak/tower untuk praktik instalasi" },
      { kategori: "perangkat-lunak", label: "Sistem operasi server" },
      { kategori: "perangkat-jaringan", label: "Switch managed" },
    ],
    skorKeyakinan: 0.88,
  },
  {
    id: "st-02",
    unitKompetensiId: "uk-02",
    elemenKompetensiId: "ek-04",
    judul: "Mengatasi dan Memperbaiki Masalah Implementasi WAN",
    isiEkstraktif:
      "Mengatasi masalah implementasi WAN. Memperbaiki masalah WAN.",
    alatDibutuhkan: [
      { kategori: "komputer-kerja", label: "PC dengan akses jaringan" },
      { kategori: "perangkat-jaringan", label: "Router" },
    ],
    skorKeyakinan: 0.79,
  },
  {
    id: "st-03",
    unitKompetensiId: "uk-03",
    elemenKompetensiId: "ek-06",
    judul: "Menguji Device IoT sesuai Rancangan Desain",
    isiEkstraktif:
      "Device IoT yang sesuai dengan rancangan desain sesuai cetak biru disiapkan sesuai desain. Aplikasi yang tertanam sesuai dengan tujuan nya disiapkan sesuai desain.",
    // alatDibutuhkan disusun ulang dari BATASAN VARIABEL §2 unit J.61IOT01.005.1
    // (Peralatan: module/device IoT, komputer/notebook/server, data storage,
    // kabel konektor, smartphone, aplikasi, software analisis UI; Perlengkapan:
    // desain aplikasi, wrist band/lapisan lantai anti-static) — menggantikan
    // isi lama peninggalan tema debugging yang tidak bersumber dari dokumen.
    alatDibutuhkan: [
      { kategori: "alat-tangan", label: "Module/device IoT atau Printed Circuit Board Assembly (PCBA)" },
      { kategori: "komputer-kerja", label: "Komputer, notebook, atau server" },
      { kategori: "perangkat-jaringan", label: "Kabel sesuai konektor yang dibutuhkan untuk pengujian" },
      { kategori: "perangkat-lunak", label: "Software analisis aplikasi untuk pengumpulan data hasil pengujian UI" },
      { kategori: "alat-tangan", label: "Wrist band anti-static atau lapisan lantai anti-static" },
    ],
    skorKeyakinan: 0.71,
  },
  {
    id: "st-04",
    unitKompetensiId: "uk-04",
    elemenKompetensiId: "ek-07",
    judul: "Mengidentifikasi Permasalahan dan Sasaran Bisnis Proyek AI",
    isiEkstraktif:
      "Latar belakang, tujuan, dan permasalahan bisnis proyek AI diidentifikasi sesuai dengan prosedur bisnis AI yang berlaku. Poin-poin sasaran bisnis Solusi AI diidentifikasi sesuai dengan permasalahan bisnis proyek AI.",
    // Dari BATASAN VARIABEL §2 unit K.62AIN00.001.2.
    alatDibutuhkan: [
      { kategori: "komputer-kerja", label: "Komputer" },
      { kategori: "perangkat-lunak", label: "Aplikasi pengolah kata" },
      { kategori: "perangkat-lunak", label: "Aplikasi spreadsheet" },
      { kategori: "perangkat-lunak", label: "Aplikasi presentasi" },
    ],
    skorKeyakinan: 0.68,
  },
  {
    id: "st-05",
    unitKompetensiId: "uk-05",
    elemenKompetensiId: "ek-09",
    judul: "Mengidentifikasi Fungsi Perangkat Keras untuk Sistem Cloud",
    isiEkstraktif:
      "Berbagai perangkat keras dideskripsikan sesuai dengan pemanfaatan pada cloud. Perangkat keras penyimpan data diuraikan sesuai dengan pemanfaatan pada cloud. Perangkat interkoneksi dalam jaringan wireless dan wire diuraikan sesuai dengan pemanfaatan pada cloud.",
    // Dari BATASAN VARIABEL §2 unit J.63HOS00.003.2.
    alatDibutuhkan: [
      { kategori: "komputer-kerja", label: "Alat pengolah data" },
      { kategori: "perangkat-lunak", label: "Perangkat lunak bantu" },
      { kategori: "alat-tangan", label: "Alat tulis kantor" },
    ],
    skorKeyakinan: 0.74,
  },
  {
    id: "st-06",
    unitKompetensiId: "uk-06",
    elemenKompetensiId: "ek-11",
    judul: "Mendeteksi Gangguan dan Ancaman Keamanan Sistem Cloud",
    isiEkstraktif:
      "Potensi gangguan dan ancaman terhadap keamanan sistem cloud diidentifikasi sesuai dengan model risiko yang ada. Kondisi keamanan layanan sistem cloud yang teridentifikasi dianalisis secara lengkap meliputi aspek teknis dan non-teknis.",
    // Dari BATASAN VARIABEL §2 unit J.63HOS00.018.2.
    alatDibutuhkan: [
      { kategori: "komputer-kerja", label: "Alat pengolah data" },
      { kategori: "perangkat-jaringan", label: "Jaringan internet" },
      { kategori: "perangkat-lunak", label: "Perangkat lunak bantu perkantoran (pengolah kata, lembar kerja, gambar)" },
      { kategori: "alat-tangan", label: "Alat tulis kantor" },
    ],
    skorKeyakinan: 0.7,
  },
  {
    id: "st-07",
    unitKompetensiId: "uk-07",
    elemenKompetensiId: "ek-15",
    judul: "Melaksanakan Alat Manajemen Perangkat Lunak dalam Proyek",
    isiEkstraktif:
      "Membuat rencana proyek sesuai dengan spesifikasi kebutuhan perangkat lunak. Menentukan prosedur kontrol-sumber. Membuat lingkungan kolaborasi.",
    // Dari "Context of and specific resources for assessment" (setara Batasan Variabel), hal. 1119:
    // "internet", "project-management software", "source-control software",
    // "specific tools and licences, depending on particular platform". Item
    // terakhir tidak eksplisit menyebut alat tertentu (tergantung platform),
    // jadi tidak diikutsertakan — bukan ditebak jadi "perangkat lunak
    // kolaborasi" seperti versi sebelumnya (itu ada di Elements, bukan di
    // bagian sumber daya penilaian ini).
    alatDibutuhkan: [
      { kategori: "perangkat-jaringan", label: "Akses internet" },
      { kategori: "perangkat-lunak", label: "Perangkat lunak manajemen proyek" },
      { kategori: "perangkat-lunak", label: "Perangkat lunak kontrol-sumber (version control)" },
    ],
    skorKeyakinan: 0.6,
  },
];

// Kandidat gap: skill dari sumber sekunder yang TIDAK match SKKNI — ditandai, bukan dibuang (CLAUDE.md).
export const skillEntity: SkillEntity[] = [
  {
    id: "se-01",
    namaSkill: "Konfigurasi Container Orchestration (Kubernetes dasar)",
    sumberSekunder: "Input manual kaprogli — hasil kunjungan industri",
    programKeahlianId: "pk-tkj",
    statusPemetaan: "gap_kandidat",
    sudahDitinjau: false,
  },
  {
    id: "se-02",
    namaSkill: "Terminasi Kabel UTP",
    sumberSekunder: "Input manual kaprogli",
    programKeahlianId: "pk-tkj",
    statusPemetaan: "terpetakan_skkni",
    unitKompetensiTerkaitId: "uk-01",
    skorKemiripan: 0.91,
  },
  {
    id: "se-03",
    namaSkill: "Automated Testing dengan CI/CD Pipeline",
    sumberSekunder: "Input manual kaprogli — hasil kunjungan industri",
    programKeahlianId: "pk-rpl",
    statusPemetaan: "gap_kandidat",
    sudahDitinjau: false,
  },
];

// koreksiGuru pindah ke Postgres (tabel koreksi_guru) — lihat scripts/seed.sql
// (kg-01 di sini disalin persis) dan lib/data-access.ts (getKoreksiGuru,
// addKoreksiGuru).
