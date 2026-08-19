import type {
  ProgramKeahlian,
  Guru,
  UnitKompetensi,
  SumberDayaLab,
  SkillEntity,
  SaranTopik,
  KoreksiGuru,
} from "./types";

// Data contoh realistis (bukan Lorem Ipsum) — lihat CLAUDE.md "Data contoh".
// Struktur & istilah mengikuti pola SKKNI Bidang Jaringan Komputer & Rekayasa
// Perangkat Lunak. Berdiri sebagai stand-in untuk Layer 0 (PDF parser) sampai
// korpus SKKNI resmi diunggah — lihat catatan swappable di ARCHITECTURE.md §6.

export const programKeahlian: ProgramKeahlian[] = [
  { id: "pk-tkj", nama: "Teknik Komputer dan Jaringan", singkatan: "TKJ" },
  { id: "pk-rpl", nama: "Rekayasa Perangkat Lunak", singkatan: "RPL" },
];

export const guru: Guru[] = [
  { id: "guru-01", nama: "Siti Rahmawati, S.Kom.", programKeahlianId: "pk-tkj" },
  { id: "guru-02", nama: "Bambang Wijaya, S.T.", programKeahlianId: "pk-rpl" },
];

export const unitKompetensi: UnitKompetensi[] = [
  {
    id: "uk-01",
    kodeUnit: "J.611000.001.02",
    judulUnit: "Menginstalasi Perangkat Jaringan Komputer",
    dokumenSkkni: "Kepmenaker No. 45 Tahun 2021",
    programKeahlianId: "pk-tkj",
    elemenKompetensi: [
      {
        id: "ek-01",
        judul: "Mempersiapkan instalasi perangkat jaringan",
        kriteriaUnjukKerja: [
          {
            id: "kuk-01",
            kode: "1.1",
            teks:
              "Perangkat jaringan (switch, router, access point) diperiksa kesesuaiannya dengan spesifikasi rancangan topologi.",
          },
          {
            id: "kuk-02",
            kode: "1.2",
            teks:
              "Alat kerja dan alat ukur (crimping tool, cable tester, tang potong) disiapkan sesuai kebutuhan instalasi.",
          },
        ],
      },
      {
        id: "ek-02",
        judul: "Melakukan instalasi dan konfigurasi dasar",
        kriteriaUnjukKerja: [
          {
            id: "kuk-03",
            kode: "2.1",
            teks:
              "Kabel jaringan dipasang dan diterminasi sesuai standar pengkabelan (T568A/T568B) yang berlaku.",
          },
          {
            id: "kuk-04",
            kode: "2.2",
            teks:
              "Perangkat switch/router dikonfigurasi dengan pengalamatan IP dasar sesuai rancangan jaringan.",
          },
        ],
      },
    ],
  },
  {
    id: "uk-02",
    kodeUnit: "J.611000.007.02",
    judulUnit: "Melakukan Perawatan dan Perbaikan Koneksi Peralatan Jaringan ke Internet",
    dokumenSkkni: "Kepmenaker No. 45 Tahun 2021",
    programKeahlianId: "pk-tkj",
    elemenKompetensi: [
      {
        id: "ek-03",
        judul: "Mengidentifikasi gangguan koneksi jaringan",
        kriteriaUnjukKerja: [
          {
            id: "kuk-05",
            kode: "1.1",
            teks:
              "Gejala gangguan koneksi diidentifikasi melalui pengujian konektivitas (ping, traceroute) pada titik-titik jaringan.",
          },
          {
            id: "kuk-06",
            kode: "1.2",
            teks:
              "Sumber gangguan dilokalisasi pada lapisan fisik, jaringan, atau layanan sesuai hasil pengujian.",
          },
        ],
      },
      {
        id: "ek-04",
        judul: "Memperbaiki gangguan koneksi",
        kriteriaUnjukKerja: [
          {
            id: "kuk-07",
            kode: "2.1",
            teks:
              "Perangkat atau kabel yang rusak diganti sesuai spesifikasi teknis yang dipersyaratkan.",
          },
        ],
      },
    ],
  },
  {
    id: "uk-03",
    kodeUnit: "J.620100.017.02",
    judulUnit: "Melakukan Debugging Perangkat Lunak",
    dokumenSkkni: "Kepmenaker No. 282 Tahun 2016",
    programKeahlianId: "pk-rpl",
    elemenKompetensi: [
      {
        id: "ek-05",
        judul: "Mengidentifikasi kesalahan program",
        kriteriaUnjukKerja: [
          {
            id: "kuk-08",
            kode: "1.1",
            teks:
              "Pesan kesalahan (error log/stack trace) dianalisis untuk menentukan lokasi kesalahan dalam kode program.",
          },
          {
            id: "kuk-09",
            kode: "1.2",
            teks:
              "Kesalahan logika dan kesalahan sintaks dibedakan berdasarkan gejala yang muncul saat eksekusi program.",
          },
        ],
      },
      {
        id: "ek-06",
        judul: "Memperbaiki dan menguji ulang program",
        kriteriaUnjukKerja: [
          {
            id: "kuk-10",
            kode: "2.1",
            teks:
              "Kode program diperbaiki menggunakan tools debugging (breakpoint, step-through) sesuai dengan akar masalah yang ditemukan.",
          },
          {
            id: "kuk-11",
            kode: "2.2",
            teks:
              "Program yang telah diperbaiki diuji ulang menggunakan data uji yang mewakili kasus normal dan kasus tepi (edge case).",
          },
        ],
      },
    ],
  },
];

export const sumberDayaLab: SumberDayaLab[] = [
  { id: "lab-01", nama: "Switch Managed 24 port", kategori: "perangkat-jaringan", jumlah: 6, programKeahlianId: "pk-tkj" },
  { id: "lab-02", nama: "Router Mikrotik RB750", kategori: "perangkat-jaringan", jumlah: 4, programKeahlianId: "pk-tkj" },
  { id: "lab-03", nama: "Cable tester", kategori: "alat-ukur", jumlah: 10, programKeahlianId: "pk-tkj" },
  { id: "lab-04", nama: "PC rakitan lab jaringan", kategori: "komputer-kerja", jumlah: 20, programKeahlianId: "pk-tkj" },
  { id: "lab-05", nama: "Access point indoor", kategori: "perangkat-jaringan", jumlah: 8, programKeahlianId: "pk-tkj" },
  { id: "lab-06", nama: "PC lab pemrograman", kategori: "komputer-kerja", jumlah: 24, programKeahlianId: "pk-rpl" },
  { id: "lab-07", nama: "Lisensi IDE (VS Code, JetBrains edu)", kategori: "perangkat-lunak", jumlah: 24, programKeahlianId: "pk-rpl" },
  // ponytail: sengaja TIDAK ada entri "server" untuk pk-rpl — mensimulasikan gap infrastruktur nyata untuk demo Resource Feasibility Checker.
];

export const saranTopik: SaranTopik[] = [
  {
    id: "st-01",
    unitKompetensiId: "uk-01",
    elemenKompetensiId: "ek-02",
    judul: "Praktik Terminasi Kabel UTP Standar T568B",
    isiEkstraktif:
      "Kabel jaringan dipasang dan diterminasi sesuai standar pengkabelan (T568A/T568B) yang berlaku. Perangkat switch/router dikonfigurasi dengan pengalamatan IP dasar sesuai rancangan jaringan.",
    alatDibutuhkan: [
      { kategori: "alat-tangan", label: "Crimping tool & tang potong" },
      { kategori: "alat-ukur", label: "Cable tester" },
      { kategori: "perangkat-jaringan", label: "Switch managed" },
    ],
    skorKeyakinan: 0.88,
  },
  {
    id: "st-02",
    unitKompetensiId: "uk-02",
    elemenKompetensiId: "ek-03",
    judul: "Diagnosis Gangguan Konektivitas dengan Ping & Traceroute",
    isiEkstraktif:
      "Gejala gangguan koneksi diidentifikasi melalui pengujian konektivitas (ping, traceroute) pada titik-titik jaringan. Sumber gangguan dilokalisasi pada lapisan fisik, jaringan, atau layanan sesuai hasil pengujian.",
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
    judul: "Debugging Program dengan Breakpoint dan Step-Through",
    isiEkstraktif:
      "Kode program diperbaiki menggunakan tools debugging (breakpoint, step-through) sesuai dengan akar masalah yang ditemukan. Program yang telah diperbaiki diuji ulang menggunakan data uji yang mewakili kasus normal dan kasus tepi (edge case).",
    alatDibutuhkan: [
      { kategori: "komputer-kerja", label: "PC pemrograman" },
      { kategori: "perangkat-lunak", label: "IDE dengan debugger" },
      { kategori: "server", label: "Server staging untuk uji integrasi" },
    ],
    skorKeyakinan: 0.71,
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
  },
];

export const koreksiGuru: KoreksiGuru[] = [
  {
    id: "kg-01",
    saranTopikId: "st-02",
    guruId: "guru-01",
    tindakan: "modifikasi",
    catatan: "Ditambahkan studi kasus gangguan Wi-Fi, bukan hanya kabel.",
    waktu: "2026-08-12T09:30:00.000Z",
  },
];
