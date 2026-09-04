export interface MitraIndustri {
  id: string;
  namaPerusahaan: string;
  sektorIndustri: string;
  lokasi: string;
  programKeahlianId: "pk-tkj" | "pk-rpl" | "all";
  programSingkatan: string;
  deskripsi: string;
  fokusPembelajaran: string[];
  unitSkkniTerkait: {
    unitId: string;
    kodeUnit: string;
    judulUnit: string;
    keterkaitan: string;
  }[];
  studiKasusNyata: string;
  kapasitasKunjungan: string;
  fasilitasObservasi: string[];
}

export const MITRA_INDUSTRI_LIST: MitraIndustri[] = [
  {
    id: "mitra-01",
    namaPerusahaan: "PT Telkom Indonesia (Persero) Tbk - Witel Jatim",
    sektorIndustri: "Telekomunikasi & Jaringan Backbone Nasional",
    lokasi: "Surabaya & Sidoarjo, Jawa Timur",
    programKeahlianId: "pk-tkj",
    programSingkatan: "TKJ",
    deskripsi:
      "Perusahaan BUMN penyedia infrastruktur telekomunikasi dan jaringan digital terbesar di Indonesia dengan standar operasional telekomunikasi enterprise.",
    fokusPembelajaran: [
      "Arsitektur Core Network OSPF/BGP dan routing failover antar Point of Presence (PoP)",
      "Penyambungan dan pengujian Optical Time-Domain Reflectometer (OTDR) kabel Fiber Optic",
      "Manajemen NOC (Network Operation Center) 24/7 dan troubleshooting traffic congestion",
    ],
    unitSkkniTerkait: [
      {
        unitId: "uk-02",
        kodeUnit: "ICTNWK506",
        judulUnit:
          "Melakukan Konfigurasi, Verifikasi, dan Mengatasi Masalah Tautan WAN dan Layanan IP di Jaringan Perusahaan Menengah",
        keterkaitan: "Penyambungan routing OSPF failover dan verifikasi throughput tautan WAN backbone antar PoP.",
      },
      {
        unitId: "uk-01",
        kodeUnit: "ICTTEN5201A",
        judulUnit: "Instal, Konfigurasi dan Uji Server",
        keterkaitan: "Instalasi dan konfigurasi server monitoring NOC dan pengujian konektivitas antarmuka.",
      },
    ],
    studiKasusNyata: "Pemeliharaan keandalan jaringan internet backbone 100 Gbps regional Jawa Timur selama event berskala nasional.",
    kapasitasKunjungan: "30 siswa / batch (Workshop Mini & Tur Lab NOC)",
    fasilitasObservasi: ["Ruang Server NOC", "Laboratorium Fiber Optik", "Simulator Rack Router Enterprise"],
  },
  {
    id: "mitra-02",
    namaPerusahaan: "PT Astra Graphia Information Technology (AGIT)",
    sektorIndustri: "Sistem Integrasi TI, Cloud & Keamanan Siber",
    lokasi: "Jakarta & Kawasan Industri Cikarang",
    programKeahlianId: "pk-tkj",
    programSingkatan: "TKJ",
    deskripsi:
      "Anak perusahaan Astra International yang berfokus pada penyediaan solusi cloud enterprise, keamanan informasi perbankan, dan infrastruktur data center.",
    fokusPembelajaran: [
      "Audit keamanan server Linux dan konfigurasi Next-Gen Firewall (NGFW)",
      "Implementasi Virtual Private Network (VPN) terenkripsi antar kantor cabang",
      "Deteksi intrusi jaringan (IDS/IPS) dan penanganan insiden keamanan siber",
    ],
    unitSkkniTerkait: [
      {
        unitId: "uk-06",
        kodeUnit: "J.620100.006.01",
        judulUnit: "Menerapkan Keamanan Jaringan",
        keterkaitan: "Penyusunan aturan firewall/IDS dan segmentasi VLAN jaringan korporat terenkripsi.",
      },
      {
        unitId: "uk-02",
        kodeUnit: "ICTNWK506",
        judulUnit:
          "Melakukan Konfigurasi, Verifikasi, dan Mengatasi Masalah Tautan WAN dan Layanan IP di Jaringan Perusahaan Menengah",
        keterkaitan: "Konfigurasi VPN terenkripsi IPsec antar kantor cabang perusahaan.",
      },
    ],
    studiKasusNyata: "Simulasi pencegahan insiden kebocoran data dan mitigasi serangan distributed denial-of-service (DDoS) pada portal layanan publik.",
    kapasitasKunjungan: "25 siswa / batch (Simulasi SOC & Live Cyber Attack Mitigation)",
    fasilitasObservasi: ["Security Operations Center (SOC)", "Demo Room Cyber Defense", "Server Farm"],
  },
  {
    id: "mitra-03",
    namaPerusahaan: "PT GoTo Gojek Tokopedia Tbk (Tech Division)",
    sektorIndustri: "Pengembangan Perangkat Lunak & Platform Digital Skala Besar",
    lokasi: "Jakarta Selatan & Tech Hub Surabaya",
    programKeahlianId: "pk-rpl",
    programSingkatan: "RPL",
    deskripsi:
      "Perusahaan teknologi terdepan di Asia Tenggara yang mengembangkan ekosistem layanan on-demand, e-commerce, dan sistem pembayaran digital mikro.",
    fokusPembelajaran: [
      "Penerapan metodologi Agile Scrum dalam siklus sprint pengembangan 2 mingguan",
      "Branching strategy Git Flow, code review tim, dan continuous integration (CI) dengan GitHub Actions",
      "Pengenalan arsitektur microservices dan container Docker/Kubernetes",
    ],
    unitSkkniTerkait: [
      {
        unitId: "uk-04",
        kodeUnit: "ICAPRG502A",
        judulUnit: "Mengelola Sebuah Proyek Menggunakan Software Management Tools",
        keterkaitan: "Penyusunan user stories, task tracking Jira, dan QA automated unit testing sebelum rilis.",
      },
    ],
    studiKasusNyata: "Deployment modul checkout belanja dengan arsitektur microservices yang tahan menghadapi lonjakan 100.000 pesanan per menit.",
    kapasitasKunjungan: "25 siswa / batch (Agile Workshop & Mini Hackathon)",
    fasilitasObservasi: ["Co-working Lab", "DevOps Monitoring Station", "Product Design Studio"],
  },
  {
    id: "mitra-04",
    namaPerusahaan: "PT Lintasarta (Indosat Ooredoo Hutchison Group)",
    sektorIndustri: "Cloud Infrastructure, Disaster Recovery & Data Center",
    lokasi: "Jatiluhur & Jakarta Pusat",
    programKeahlianId: "pk-tkj",
    programSingkatan: "TKJ",
    deskripsi:
      "Penyedia komunikasi data, internet, dan layanan nilai tambah terkemuka untuk industri perbankan, keuangan, dan pemerintahan.",
    fokusPembelajaran: [
      "Virtualisasi server multi-tenant menggunakan Proxmox VE dan VMware ESXi",
      "Strategi cadangan data berkala (Backup & Replication) dan Disaster Recovery Center (DRC)",
      "High Availability (HA) clustering server web dan database",
    ],
    unitSkkniTerkait: [
      {
        unitId: "uk-01",
        kodeUnit: "ICTTEN5201A",
        judulUnit: "Instal, Konfigurasi dan Uji Server",
        keterkaitan: "Penyusunan clustering server dan automasi backup database menggunakan cron job.",
      },
      {
        unitId: "uk-02",
        kodeUnit: "ICTNWK506",
        judulUnit:
          "Melakukan Konfigurasi, Verifikasi, dan Mengatasi Masalah Tautan WAN dan Layanan IP di Jaringan Perusahaan Menengah",
        keterkaitan: "Konfigurasi tautan jaringan berkecepatan tinggi antar data center utama dan secondary DRC.",
      },
    ],
    studiKasusNyata: "Simulasi failover otomatis data center utama ke data center sekunder dalam waktu kurang dari 3 menit tanpa data loss.",
    kapasitasKunjungan: "20 siswa / batch (Data Center Walkthrough & Cloud Provisioning Lab)",
    fasilitasObservasi: ["Data Center Tier III Jatiluhur", "Cooling & Power Redundancy Lab", "Network Hub"],
  },
  {
    id: "mitra-05",
    namaPerusahaan: "PT Petrokimia Gresik (Divisi Otomasi & IT Industri)",
    sektorIndustri: "Manufaktur Kimia, IoT Telemetri & SCADA Pabrik",
    lokasi: "Gresik, Jawa Timur",
    programKeahlianId: "pk-tkj",
    programSingkatan: "TKJ",
    deskripsi:
      "Produsen pupuk terlengkap di Indonesia yang menerapkan smart factory berbasis integrasi sensor IoT telemetri nirkabel dan SCADA industri.",
    fokusPembelajaran: [
      "Pemasangan dan integrasi sensor telemetri lingkungan pabrik dengan gateway nirkabel LoRaWAN / MQTT",
      "Visualisasi data telemetri suhu dan tekanan pipa pada dashboard industrial real-time",
      "Proteksi jaringan kontrol industri dari interferensi elektromagnetik dan serangan siber",
    ],
    unitSkkniTerkait: [
      {
        unitId: "uk-03",
        kodeUnit: "J.61IOT01.005.1",
        judulUnit: "Menguji Coba Device IoT",
        keterkaitan: "Pengujian sensor telemetri lingkungan pabrik dan verifikasi protokol transmisi data.",
      },
    ],
    studiKasusNyata: "Sistem peringatan dini (early warning system) kebocoran gas amonia menggunakan sensor IoT nirkabel berdaya rendah.",
    kapasitasKunjungan: "30 siswa / batch (Smart Plant Tour & IoT Workshop)",
    fasilitasObservasi: ["Control Room SCADA", "Laboratorium Kalibrasi Sensor", "Pabrik Pupuk Otomasi"],
  },
  {
    id: "mitra-06",
    namaPerusahaan: "PT Bank Central Asia Tbk (BCA Digital & IT Operations)",
    sektorIndustri: "Perbankan Digital, Quality Assurance & Bug Tracking",
    lokasi: "Tangerang & Surabaya",
    programKeahlianId: "pk-rpl",
    programSingkatan: "RPL",
    deskripsi:
      "Institusi perbankan swasta terbesar di Indonesia yang memproses puluhan juta transaksi digital harian dengan standar keandalan finansial 99.99%.",
    fokusPembelajaran: [
      "Penyusunan test scenario dan automated regression testing pada aplikasi mobile banking",
      "Dokumentasi bug tracking dan release notes versi aplikasi berbasis standar audit perbankan",
      "Pengujian ketahanan beban sistem (Stress Testing) dengan Apache JMeter",
    ],
    unitSkkniTerkait: [
      {
        unitId: "uk-04",
        kodeUnit: "ICAPRG502A",
        judulUnit: "Mengelola Sebuah Proyek Menggunakan Software Management Tools",
        keterkaitan: "Penyusunan rencana pengujian perangkat lunak, bug lifecycle, dan dokumentasi acceptance test.",
      },
    ],
    studiKasusNyata: "Pengujian konkurensi 50.000 transaksi pembayaran QRIS per detik menjelang periode promo belanja tanggal kembar.",
    kapasitasKunjungan: "25 siswa / batch (Software QA Lab & Financial Tech Case Study)",
    fasilitasObservasi: ["IT Quality Assurance Lab", "Command Center Transaksi", "Usability Testing Room"],
  },
];

/**
 * Mengambil daftar Mitra Industri yang membutuhkan atau relevan dengan Unit SKKNI tertentu.
 * Pencocokan mendukung perbandingan ID unit atau Kode Unit.
 */
export function getMitraByUnit(unitIdOrCode: string): MitraIndustri[] {
  if (!unitIdOrCode) return [];
  const query = unitIdOrCode.trim().toLowerCase();
  return MITRA_INDUSTRI_LIST.filter((m) =>
    m.unitSkkniTerkait.some(
      (u) =>
        u.unitId.toLowerCase() === query ||
        u.kodeUnit.toLowerCase() === query ||
        query.includes(u.kodeUnit.toLowerCase()) ||
        u.kodeUnit.toLowerCase().includes(query)
    )
  );
}

/**
 * Mengambil daftar Mitra Industri yang terafiliasi dengan Program Keahlian tertentu.
 */
export function getMitraByProgram(programKeahlianId: string): MitraIndustri[] {
  return MITRA_INDUSTRI_LIST.filter(
    (m) => m.programKeahlianId === programKeahlianId || m.programKeahlianId === "all"
  );
}

