import Link from "next/link";
import {
  FileText,
  MousePointerClick,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Landmark,
  FileStack,
  Map,
  Compass,
  CheckCircle2,
  TrendingDown,
  BookOpen,
  FileCheck2,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SectionContainer } from "@/components/landing/section-container";
import { HairlineGridTexture } from "@/components/landing/background-shapes";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParallaxCard } from "@/components/ui/parallax-card";
import { HeroIllustration } from "@/components/illustrations/hero-illustration";
import { DocumentToCardsIllustration } from "@/components/illustrations/document-to-cards";
import {
  StepPilihIkon,
  StepBacaKartu,
  StepSeretKanvas,
  StepEkspor,
} from "@/components/illustrations/step-icons";

const langkahKerja = [
  {
    icon: StepPilihIkon,
    title: "Pilih unit kompetensi",
    body: "Mulai dari unit kompetensi SKKNI yang relevan dengan kelas peminatan Anda.",
    detail: "Telusuri 1.000+ unit kompetensi dari dokumen SKKNI resmi.",
  },
  {
    icon: StepBacaKartu,
    title: "Baca kartu saran dari teks asli",
    body: "Sistem menyusun kartu dari Elemen dan Kriteria Unjuk Kerja SKKNI — bukan karangan AI.",
    detail: "Setiap kartu mencantumkan sumber asalnya dari teks standar.",
  },
  {
    icon: StepSeretKanvas,
    title: "Seret ke kanvas, cek alat lab",
    body: "Tarik kartu satu per satu ke modul ajar. Resource Feasibility Checker memeriksa kesiapan alat lab Anda.",
    detail: "Tidak ada tombol 'setujui semua' — setiap keputusan ada di tangan Anda.",
  },
  {
    icon: StepEkspor,
    title: "Ekspor jadi dokumen Anda",
    body: "Unduh modul ajar sebagai dokumen yang tetap Anda miliki, tanpa akun aktif untuk dibaca ulang.",
    detail: "Format siap pakai, bukan draf mentah yang masih butuh banyak edit.",
  },
];

const alasanFeatured = {
  icon: FileText,
  title: "Bukan generator RPP asal jadi",
  body: "Kartu saran ditarik langsung dari teks Unit Kompetensi dan Kriteria Unjuk Kerja SKKNI asli. Perluasan dengan AI bersifat opsional dan selalu ditandai jelas saat dipakai — tidak pernah dicampur diam-diam dengan teks standar.",
};

const alasanKecil = [
  {
    icon: MousePointerClick,
    title: "Anda yang memutuskan",
    body: "Tiap kartu diseret satu per satu ke kanvas — tidak ada tombol 'setujui semua'.",
  },
  {
    icon: Wrench,
    title: "Cek alat lab dulu",
    body: "Resource Feasibility Checker mencocokkan fungsi alat dengan inventaris lab Anda.",
  },
  {
    icon: AlertTriangle,
    title: "Skill di luar standar tidak dibuang",
    body: "Kompetensi belum tercatat SKKNI ditandai sebagai gap, bukan hilang begitu saja.",
  },
];

const alatPublik = [
  {
    icon: Map,
    title: "Roadmap Kompetensi",
    body: "Susuri unit kompetensi SKKNI per program keahlian dan tandai yang sudah Anda kuasai.",
    href: "/roadmap",
    cta: "Buka roadmap",
  },
  {
    icon: Compass,
    title: "Jelajah Kompetensi",
    body: "Tempelkan ringkasan pengalaman Anda, temukan unit kompetensi SKKNI yang berkaitan.",
    href: "/jelajah-kompetensi",
    cta: "Mulai menjelajah",
  },
];

const statsData = [
  {
    value: "9,2%",
    label: "tingkat lulus kualifikasi",
    sub: "dari 1.569 siswa yang diajukan ke mitra sertifikasi TBIG (2025), hanya 145 yang lulus standar.",
    icon: TrendingDown,
  },
  {
    value: "1.000+",
    label: "dokumen SKKNI resmi",
    sub: "tersedia terbuka sejak TW III 2022 — belum ada satu alat yang menerjemahkannya menjadi perangkat ajar siap pakai.",
    icon: BookOpen,
  },
  {
    value: "100%",
    label: "keputusan di tangan guru",
    sub: "tidak ada kartu yang masuk ke dokumen final tanpa konfirmasi eksplisit dari Anda.",
    icon: CheckCircle2,
  },
];

const faq = [
  {
    q: "Apakah AI di VokasIn bisa salah?",
    a: "Bisa. Model pencocokan (NER dan embedding similarity) bersifat probabilistik, bukan pasti benar — karena itu setiap kartu saran wajib dikonfirmasi guru sebelum masuk dokumen final. VokasIn tidak pernah mengklaim akurasi mutlak.",
  },
  {
    q: "Apakah VokasIn menggantikan peran guru?",
    a: "Tidak. VokasIn mempercepat penyusunan draf awal jobsheet dan rencana praktikum. Keputusan pedagogis — apa yang diajarkan dan bagaimana caranya — tetap sepenuhnya di tangan guru.",
  },
  {
    q: "Data lowongan kerja diambil dari mana?",
    a: "Hanya dari sumber legal: API resmi (mis. SIAPkerja/Karirhub, setelah status aksesnya terverifikasi) atau input manual guru/kaprogli. VokasIn tidak pernah scraping portal lowongan manapun, dan jalur sumber sekunder ini bisa dimatikan sepenuhnya tanpa mengganggu fungsi utama yang berbasis SKKNI.",
  },
  {
    q: "Bagaimana jika sekolah kami ingin mengintegrasikan kurikulum industri?",
    a: "VokasIn memetakan unit kompetensi SKKNI dengan kebutuhan keahlian industri sehingga rencana pembelajaran tetap terstruktur dan memiliki bukti standar yang kuat.",
  },
  {
    q: "Bagaimana kalau SKKNI di bidang saya sudah ketinggalan zaman?",
    a: "SKKNI memang tidak selalu mengikuti kecepatan industri. Untuk itu, skill dari sumber sekunder yang belum tercatat di SKKNI ditandai sebagai kandidat kesenjangan (gap) — bukan ditolak — sehingga kaprogli tetap punya bukti kuantitatif untuk mengusulkan revisi kurikulum.",
  },
];

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <main className="flex-1">

        {/* ====================================================
            1. HERO — slime-lime-950 gelap dengan blob
            ==================================================== */}
        <section
          id="hero"
          className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slime-lime-950"
        >
          {/* Blob 1 — kiri atas */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 size-[480px] rounded-full bg-slime-lime-300 opacity-10 blur-[90px]"
          />
          {/* Blob 2 — kanan tengah */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/3 right-0 size-[520px] rounded-full bg-slime-lime-600 opacity-10 blur-[110px]"
          />
          {/* Blob 3 — kiri bawah */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 left-1/4 size-[360px] rounded-full bg-slime-lime-900 opacity-40 blur-[80px]"
          />

          <SectionContainer className="relative py-20 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Teks hero */}
              <div className="fade-up">
                <Badge
                  variant="brand"
                  className="gap-1.5 border border-slime-lime-700/60 bg-slime-lime-900/80 text-slime-lime-300 font-semibold"
                >
                  <FileStack className="size-3.5" aria-hidden />
                  SKKNI PERANGKAT AJAR
                </Badge>
                <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-neutral-50 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  Susun jobsheet SMK dari{" "}
                  <span className="text-slime-lime-400">SKKNI asli</span>{" "}
                  {String.fromCharCode(8212)} bukan dari nol.
                </h1>
                <p className="mt-5 text-base leading-relaxed text-neutral-300 sm:text-lg">
                  Kartu saran ditarik langsung dari teks Unit Kompetensi &amp; KUK resmi. Anda
                  yang menyeret, mengecek alat lab, dan mengekspor {String.fromCharCode(8212)} sistem tidak mengarang
                  sendiri.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/guru"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-slime-lime-500 px-6 text-sm font-semibold text-neutral-950 transition-colors hover:bg-slime-lime-400"
                  >
                    Mulai coba
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <a
                    href="#cara-kerja"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 px-6 text-sm font-medium text-neutral-200 transition-colors hover:border-white/40 hover:text-neutral-50"
                  >
                    Lihat cara kerja
                  </a>
                </div>
              </div>

              {/* Ilustrasi hero + floating cards */}
              <div className="relative mx-auto w-full max-w-lg fade-up [animation-delay:120ms]">
                <HeroIllustration
                  className="w-full text-slime-lime-400"
                  aria-hidden
                />

                {/* Floating card 1 — unit kompetensi */}
                <div
                  className="absolute -left-4 top-8 rounded-xl border border-slime-lime-700/40 bg-slime-lime-900/90 p-3.5 shadow-xl backdrop-blur-sm sm:-left-8"
                  aria-hidden
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slime-lime-400">
                    Unit Kompetensi
                  </p>
                  <p className="mt-1 text-sm font-bold text-neutral-50">
                    J.620100.001.01
                  </p>
                  <p className="text-xs text-neutral-300">Mengoperasikan Komputer</p>
                </div>

                {/* Floating card 2 — status lab */}
                <div
                  className="absolute -right-4 bottom-16 rounded-xl border border-slime-lime-700/40 bg-slime-lime-900/90 p-3.5 shadow-xl backdrop-blur-sm sm:-right-8"
                  aria-hidden
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-slime-lime-400" />
                    <p className="text-xs font-bold text-slime-lime-300">Lab siap</p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-300">
                    3/3 alat tersedia di inventaris
                  </p>
                </div>

                {/* Floating card 3 — konfirmasi kartu */}
                <div
                  className="absolute left-8 bottom-0 rounded-xl border border-slime-lime-700/40 bg-slime-lime-900/90 px-4 py-2.5 shadow-xl backdrop-blur-sm"
                  aria-hidden
                >
                  <p className="text-xs font-semibold text-slime-lime-300">
                    4 kartu dikonfirmasi
                  </p>
                </div>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* ====================================================
            2. TANTANGAN VOKASI (STATS) — putih bersih
            ==================================================== */}
        <section
          id="stats"
          className="relative overflow-hidden border-t border-neutral-100 bg-white"
        >
          <HairlineGridTexture />
          <Reveal>
            <SectionContainer className="py-16 sm:py-24">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-slime-lime-700">
                  Tantangan Vokasi
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                  Kesenjangan standar dan realitas pembelajaran
                </h2>
                <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">
                  Kurikulum Merdeka memberi otonomi bagi SMK membuka kelas peminatan lintas jurusan, namun penyelarasan dengan standar kompetensi resmi membutuhkan instrumen operasional yang akurat.
                </p>
              </div>

              <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
                {statsData.map((stat) => (
                  <div key={stat.value} className="flex flex-col gap-3">
                    <stat.icon className="size-8 text-slime-lime-700" aria-hidden />
                    <p className="text-5xl font-extrabold tracking-tight text-slime-lime-700 sm:text-6xl">
                      {stat.value}
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wider text-neutral-600">
                      {stat.label}
                    </p>
                    <p className="text-sm leading-relaxed text-neutral-700">{stat.sub}</p>
                  </div>
                ))}
              </div>
              <p className="mt-10 text-sm text-neutral-600">
                Sumber data resmi:{" "}
                <a
                  href="https://jatimtimes.com/baca/3331344208/20260524/014200/kurikulum-smk-berkejaran-dengan-akselerasi-teknologi-masihkah-pendidikan-vokasi-relevan-dengan-lapangan-kerja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-800 underline underline-offset-2 hover:text-slime-lime-700"
                >
                  JatimTimes, 24 Mei 2026
                </a>{" "}
                &amp;{" "}
                <a
                  href="https://katalog.data.go.id/dataset/standar-kompetensi-kerja-nasional-indonesia-skkni-yang-ditetapkan-s-d-tw-iii-tahun-2022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-800 underline underline-offset-2 hover:text-slime-lime-700"
                >
                  Satu Data Indonesia, per TW III 2022
                </a>
                .
              </p>
            </SectionContainer>
          </Reveal>
        </section>

        {/* ====================================================
            3. CARA KERJA — putih, step cards visual per langkah
            ==================================================== */}
        <section
          id="cara-kerja"
          className="relative overflow-hidden border-t border-neutral-100 bg-white"
        >
          <SectionContainer className="py-16 sm:py-24">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-slime-lime-700">
                Cara kerja
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                Empat langkah, dari SKKNI ke jobsheet
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                Tidak ada tombol ajaib. Tiap langkah butuh tindakan eksplisit dari Anda.
              </p>
            </Reveal>

            <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
              {langkahKerja.map((langkah, i) => (
                <RevealItem key={langkah.title}>
                  <ParallaxCard className="flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span
                        style={{ transform: "translateZ(30px)" }}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slime-lime-100 text-sm font-bold text-slime-lime-800 shadow-sm"
                      >
                        {i + 1}
                      </span>
                      <div
                        style={{ transform: "translateZ(35px)" }}
                        className="flex size-14 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-neutral-200/60"
                      >
                        <langkah.icon className="size-9 text-slime-lime-700" aria-hidden />
                      </div>
                    </div>
                    <h3
                      style={{ transform: "translateZ(20px)" }}
                      className="mt-5 text-base font-bold text-neutral-900"
                    >
                      {langkah.title}
                    </h3>
                    <p
                      style={{ transform: "translateZ(10px)" }}
                      className="mt-2.5 flex-1 text-sm leading-relaxed text-neutral-700"
                    >
                      {langkah.body}
                    </p>
                    <p
                      style={{ transform: "translateZ(15px)" }}
                      className="mt-4 text-sm font-semibold text-slime-lime-800"
                    >
                      {langkah.detail}
                    </p>
                  </ParallaxCard>
                </RevealItem>
              ))}
            </RevealGroup>
          </SectionContainer>
        </section>

        {/* ====================================================
            4. KENAPA VOKASIN — putih bersih
            ==================================================== */}
        <section
          id="kenapa"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 600px" }}
          className="relative overflow-hidden border-t border-neutral-100 bg-white"
        >
          <SectionContainer className="py-16 sm:py-24">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-slime-lime-700">
                Kenapa VokasIn
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                Batasan yang sengaja kami pertahankan
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                Empat batasan yang sengaja kami pertahankan, bukan fitur yang kami lepas begitu saja.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-12">
              <RevealItem scale className="sm:col-span-12 lg:col-span-7">
                <ParallaxCard className="flex h-full flex-col rounded-2xl border border-slime-lime-200/80 bg-slime-lime-50 p-8 shadow-sm">
                  <div style={{ transform: "translateZ(20px)" }}>
                    <DocumentToCardsIllustration
                      className="mb-6 h-44 w-full text-slime-lime-600"
                      aria-hidden
                    />
                  </div>
                  <div style={{ transform: "translateZ(30px)" }}>
                    <alasanFeatured.icon
                      className="size-8 text-slime-lime-700"
                      aria-hidden
                    />
                  </div>
                  <CardTitle
                    style={{ transform: "translateZ(25px)" }}
                    className="mt-4 text-xl font-bold text-neutral-900"
                  >
                    {alasanFeatured.title}
                  </CardTitle>
                  <CardDescription
                    style={{ transform: "translateZ(15px)" }}
                    className="mt-3 text-sm leading-relaxed text-neutral-700 sm:text-base"
                  >
                    {alasanFeatured.body}
                  </CardDescription>
                </ParallaxCard>
              </RevealItem>

              <RevealGroup
                className="grid gap-4 sm:col-span-12 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1"
                stagger={0.1}
              >
                {alasanKecil.map((item) => (
                  <RevealItem key={item.title}>
                    <ParallaxCard className="flex h-full flex-col gap-2.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-5 shadow-sm">
                      <div style={{ transform: "translateZ(30px)" }}>
                        <item.icon
                          className="size-6 text-slime-lime-700"
                          aria-hidden
                        />
                      </div>
                      <CardTitle
                        style={{ transform: "translateZ(20px)" }}
                        className="text-base font-bold text-neutral-900"
                      >
                        {item.title}
                      </CardTitle>
                      <CardDescription
                        style={{ transform: "translateZ(10px)" }}
                        className="text-sm leading-relaxed text-neutral-700"
                      >
                        {item.body}
                      </CardDescription>
                    </ParallaxCard>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </SectionContainer>
        </section>

        {/* ====================================================
            4b. UNTUK SISWA JUGA — dengan Parallax Focus Effect
            ==================================================== */}
        <section
          id="untuk-siswa"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 500px" }}
          className="relative overflow-hidden border-t border-neutral-100 bg-neutral-50/80"
        >
          <HairlineGridTexture />
          <Reveal>
            <SectionContainer className="py-16 sm:py-20">
              <p className="text-xs font-semibold uppercase tracking-widest text-slime-lime-700">
                Bukan cuma untuk guru
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                Dua alat terbuka untuk siapa saja
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                Dua alat berbasis SKKNI ini terbuka untuk siapa saja, tanpa perlu akun atau login.
              </p>

              <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2" stagger={0.1}>
                {alatPublik.map((alat) => (
                  <RevealItem key={alat.href}>
                    <ParallaxCard className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
                      <div
                        style={{ transform: "translateZ(35px)" }}
                        className="flex size-12 items-center justify-center rounded-xl bg-slime-lime-100 shadow-sm"
                      >
                        <alat.icon
                          className="size-6 text-slime-lime-700"
                          aria-hidden
                        />
                      </div>
                      <CardTitle
                        style={{ transform: "translateZ(25px)" }}
                        className="mt-4 text-lg font-bold text-neutral-900"
                      >
                        {alat.title}
                      </CardTitle>
                      <CardDescription
                        style={{ transform: "translateZ(15px)" }}
                        className="mt-2 text-sm leading-relaxed text-neutral-700"
                      >
                        {alat.body}
                      </CardDescription>
                      <div style={{ transform: "translateZ(20px)" }} className="mt-5">
                        <Link
                          href={alat.href}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-slime-lime-700 hover:text-slime-lime-800"
                        >
                          <span>{alat.cta}</span>
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      </div>
                    </ParallaxCard>
                  </RevealItem>
                ))}
              </RevealGroup>
            </SectionContainer>
          </Reveal>
        </section>

        {/* ====================================================
            5. REGULASI — slime-lime-950 gelap dengan blob
            ==================================================== */}
        <section
          id="regulasi"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 600px" }}
          className="relative overflow-hidden bg-slime-lime-950 text-neutral-50"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 size-[420px] rounded-full bg-slime-lime-500 opacity-15 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 size-[320px] rounded-full bg-slime-lime-700 opacity-20 blur-[90px]"
          />

          <SectionContainer className="relative py-16 pb-32 sm:py-24 sm:pb-40">
            <div className="grid gap-10 lg:grid-cols-[1fr_220px] lg:items-start">
              <div>
                <Reveal>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slime-lime-400">
                    Regulasi
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
                    Landasan Regulasi Resmi
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
                    Kurikulum Merdeka mewajibkan sekolah menentukan sendiri kelas peminatannya dan menurunkan kompetensi keahlian secara terverifikasi. VokasIn dibangun untuk memenuhi kebutuhan standar kurikulum tersebut.
                  </p>
                </Reveal>

                <Card className="mt-8 border-slime-lime-800/60 bg-slime-lime-900/70 p-6 shadow-md sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slime-lime-800">
                      <FileCheck2 className="size-6 text-slime-lime-400" aria-hidden />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-neutral-50">
                        Kesesuaian Standar Kompetensi Nasional
                      </CardTitle>
                      <p className="mt-2.5 text-sm leading-relaxed text-neutral-200">
                        Seluruh pemetaan perangkat ajar mengacu langsung pada dokumen resmi SKKNI yang ditetapkan oleh Kementerian Ketenagakerjaan RI serta kerangka pedoman pembelajaran dan asesmen vokasi dari Kemendikdasmen.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                        Setiap elemen kompetensi dan kriteria unjuk kerja diturunkan secara presisi untuk memastikan kesiapan peserta didik menghadapi uji kompetensi dan sertifikasi keahlian.
                      </p>
                      <p className="mt-3.5 text-sm text-neutral-300">
                        Sumber rujukan:{" "}
                        <a
                          href="https://peraturan.go.id/files/Permendikdasmen-no-8-tahun-2026.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slime-lime-300 underline underline-offset-2 hover:text-neutral-50"
                        >
                          Pedoman Standar Kurikulum &amp; Pembelajaran Vokasi
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-neutral-300">
                  <Landmark className="mt-0.5 size-5 shrink-0 text-slime-lime-400" aria-hidden />
                  <p>
                    VokasIn memposisikan diri sebagai instrumen digital guru dalam mempermudah adopsi regulasi SKKNI secara langsung di ruang kelas dan laboratorium praktikum.
                  </p>
                </div>
              </div>

              <DocumentToCardsIllustration
                gradient
                className="hidden w-full max-w-[220px] justify-self-end text-slime-lime-400 lg:block"
                aria-hidden
              />
            </div>
          </SectionContainer>
        </section>

        {/* ====================================================
            6. FAQ — putih bersih
            ==================================================== */}
        <section
          id="faq"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 500px" }}
          className="relative overflow-hidden border-t border-neutral-100 bg-white"
        >
          <Reveal>
            <SectionContainer className="max-w-3xl py-16 sm:py-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-slime-lime-700">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                Pertanyaan yang sering ditanyakan
              </h2>
              <div className="mt-10 divide-y divide-neutral-200">
                {faq.map((item) => (
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-0 py-1 text-base font-bold text-neutral-900 outline-none">
                      <span>{item.q}</span>
                      <ChevronDown
                        className="size-5 shrink-0 text-neutral-500 transition-transform duration-(--duration-ui) group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <p className="fade-up mt-3 text-sm leading-relaxed text-neutral-700">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </SectionContainer>
          </Reveal>
        </section>

        {/* ====================================================
            7. CTA PENUTUP — slime-lime-950 gelap
            ==================================================== */}
        <section
          id="cta"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 400px" }}
          className="relative overflow-hidden bg-slime-lime-950"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slime-lime-500 opacity-10 blur-[120px]"
          />

          <SectionContainer className="relative py-20 sm:py-28">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-slime-lime-400">
                  Mulai sekarang
                </p>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
                  Ajukan ke kaprogli atau kepala sekolah Anda
                </h2>
                <p className="mt-5 text-base leading-relaxed text-neutral-300 sm:text-lg">
                  Langkah paling realistis adalah membawanya ke rapat program keahlian untuk mempermudah penyusunan perangkat ajar berbasis SKKNI di sekolah Anda.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/guru"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-slime-lime-500 px-7 text-sm font-semibold text-neutral-950 transition-colors hover:bg-slime-lime-400"
                  >
                    Coba alur guru
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href="/kaprogli"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-slime-lime-700/60 px-7 text-sm font-medium text-neutral-200 transition-colors hover:border-slime-lime-500/60 hover:text-neutral-50"
                  >
                    Buka dashboard kaprogli
                  </Link>
                </div>
              </div>
            </Reveal>
          </SectionContainer>
        </section>

      </main>
      <LandingFooter />
    </>
  );
}
