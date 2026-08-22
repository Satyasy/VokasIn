import Link from "next/link";
import {
  ListChecks,
  FileText,
  MousePointerClick,
  Download,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Landmark,
  Wallet,
  FileStack,
  Map,
  Compass,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SectionContainer } from "@/components/landing/section-container";
import { DotGridTexture, HairlineGridTexture } from "@/components/landing/background-shapes";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentToCardsIllustration } from "@/components/illustrations/document-to-cards";
import { LabCheckIllustration } from "@/components/illustrations/lab-check";

const langkahKerja = [
  {
    icon: ListChecks,
    title: "Pilih unit kompetensi",
    body: "Mulai dari unit kompetensi SKKNI yang relevan dengan kelas peminatan Anda.",
  },
  {
    icon: FileText,
    title: "Baca kartu saran dari teks asli",
    body: "Sistem menyusun kartu dari Elemen dan Kriteria Unjuk Kerja SKKNI — bukan karangan AI.",
  },
  {
    icon: MousePointerClick,
    title: "Seret ke kanvas, cek alat lab",
    body: "Tarik kartu satu per satu ke modul ajar. Resource Feasibility Checker memeriksa kesiapan alat lab Anda.",
  },
  {
    icon: Download,
    title: "Ekspor jadi dokumen Anda",
    body: "Unduh modul ajar sebagai dokumen yang tetap Anda miliki, tanpa akun aktif untuk dibaca ulang.",
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
    body: "Tiap kartu diseret satu per satu ke kanvas — tidak ada tombol “setujui semua”.",
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
    q: "Berapa biaya untuk sekolah saya?",
    a: "Berlangganan sekolah dapat dianggarkan lewat dana BOSP — lihat rincian dasar hukumnya di bagian Regulasi & Dana di atas.",
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
        {/* 1. HERO */}
        <section id="hero" className="relative overflow-hidden">
          <DotGridTexture />
          <SectionContainer className="py-16 sm:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="fade-up">
                <Badge variant="brand" className="gap-1.5 bg-slime-lime-100 text-slime-lime-900">
                  <FileStack className="size-3.5" aria-hidden />
                  SKKNI → PERANGKAT AJAR
                </Badge>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  Susun jobsheet SMK dari{" "}
                  <span className="text-slime-lime-700">SKKNI asli</span> — bukan dari nol.
                </h1>
                <p className="mt-5 text-base text-muted-foreground sm:text-lg">
                  Kartu saran ditarik langsung dari teks Unit Kompetensi &amp; KUK resmi. Anda
                  yang menyeret, mengecek alat lab, dan mengekspor — sistem tidak mengarang
                  sendiri.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/guru"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-cta-primary px-5 text-sm font-medium text-cta-primary-foreground transition-colors hover:bg-neutral-800"
                  >
                    Mulai coba
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <a
                    href="#cara-kerja"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Lihat cara kerja
                  </a>
                </div>
              </div>
              <DocumentToCardsIllustration
                className="mx-auto w-full max-w-md text-slime-lime-600 fade-up [animation-delay:120ms]"
              />
            </div>
          </SectionContainer>
        </section>

        {/* 2. MASALAH — neutral-100, selang-seling dengan putih di Hero/Cara Kerja */}
        <section
          id="masalah"
          className="relative overflow-hidden border-t border-neutral-200/50 bg-neutral-100"
        >
          <HairlineGridTexture />
          <Reveal>
          <SectionContainer className="py-16 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-[1fr_220px] lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Otonomi tanpa instrumen
                </h2>
                <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Kurikulum Merdeka memberi SMK kebebasan membuka kelas peminatan lintas jurusan —
                  misalnya siswa TKJ mendalami Cloud Computing atau DKV. Tapi kebebasan ini tidak
                  disertai instrumen untuk menurunkan minat tersebut menjadi kompetensi yang
                  terverifikasi dan bisa diajarkan.
                </p>
              </div>
              <DocumentToCardsIllustration
                className="hidden w-full max-w-[220px] justify-self-end text-slime-lime-600 lg:block"
                aria-hidden
              />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="bg-card">
                <p className="text-5xl font-extrabold text-slime-lime-800 sm:text-6xl">9,2%</p>
                <p className="mt-3 text-sm text-foreground">
                  Pada kasus mitra sertifikasi TBIG (2025), dari 1.569 siswa yang diajukan
                  sekolah untuk pelatihan, hanya 145 siswa (9,2%) yang lulus standar
                  kualifikasi.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sumber:{" "}
                  <a
                    href="https://jatimtimes.com/baca/3331344208/20260524/014200/kurikulum-smk-berkejaran-dengan-akselerasi-teknologi-masihkah-pendidikan-vokasi-relevan-dengan-lapangan-kerja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    JatimTimes, 24 Mei 2026
                  </a>
                  .
                </p>
              </Card>
              <Card className="bg-card">
                <p className="text-5xl font-extrabold text-slime-lime-800 sm:text-6xl">1.000+</p>
                <p className="mt-3 text-sm text-foreground">
                  Dokumen SKKNI resmi sudah terbuka luas per triwulan III 2022 — tapi uji
                  duplikasi pasar menemukan belum ada satu pun alat yang menerjemahkannya
                  otomatis menjadi perangkat ajar siap pakai.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sumber:{" "}
                  <a
                    href="https://katalog.data.go.id/dataset/standar-kompetensi-kerja-nasional-indonesia-skkni-yang-ditetapkan-s-d-tw-iii-tahun-2022"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Satu Data Indonesia, per TW III 2022
                  </a>
                  .
                </p>
              </Card>
            </div>
          </SectionContainer>
          </Reveal>
        </section>

        {/* 3. CARA KERJA */}
        <section
          id="cara-kerja"
          className="relative overflow-hidden border-t border-neutral-200/50"
        >
          <HairlineGridTexture />
          <SectionContainer className="py-16 sm:py-20">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Empat langkah, dari SKKNI ke jobsheet
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Tidak ada tombol ajaib. Tiap langkah butuh tindakan eksplisit dari Anda.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <RevealGroup className="grid gap-6 sm:grid-cols-2" stagger={0.1}>
              {langkahKerja.map((langkah, i) => (
                <RevealItem key={langkah.title} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <langkah.icon className="size-5 text-slime-lime-700" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-foreground">{langkah.title}</h3>
                  <p className="text-sm text-muted-foreground">{langkah.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
            <LabCheckIllustration className="mx-auto hidden w-full max-w-xs text-slime-lime-600 lg:block" />
          </div>
          </SectionContainer>
        </section>

        {/* 4. KENAPA VOKASIN — section near-black, satu-satunya di halaman ini (Bagian C.2) */}
        <section
          id="kenapa"
          className="relative overflow-hidden border-t border-white/10 bg-neutral-950 text-neutral-50"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 -z-10 size-[420px] rounded-full bg-slime-lime-600/10 blur-[100px]"
          />
          <SectionContainer className="py-16 sm:py-20">
            <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
                Kenapa VokasIn
              </h2>
              <p className="mt-4 max-w-2xl text-base text-neutral-400 sm:text-lg">
                Empat batasan yang sengaja kami pertahankan, bukan fitur yang kami lepas begitu
                saja.
              </p>
            </Reveal>

            {/* Grid 12-kolom di lg: featured col-span-7, 3 kartu kecil col-span-5 ditumpuk
                mengisi tinggi yang sama (align-items stretch bawaan grid + h-full di wrapper).
                Tablet: featured penuh 12 kolom, 3 kecil sejajar 4 kolom masing-masing.
                Mobile: semua col-span-12 ditumpuk vertikal. */}
            <div className="mt-10 grid gap-4 sm:grid-cols-12">
              <RevealItem scale className="sm:col-span-12 lg:col-span-7">
                <div className="card-hover flex h-full flex-col rounded-xl border border-slime-lime-800/60 bg-neutral-900 p-8 ring-1 ring-slime-lime-900/40">
                  <DocumentToCardsIllustration
                    gradient
                    className="mb-6 h-40 w-full text-slime-lime-400"
                    aria-hidden
                  />
                  <alasanFeatured.icon className="card-hover-icon size-8 text-slime-lime-400" aria-hidden />
                  <CardTitle className="mt-3 text-xl text-neutral-50">{alasanFeatured.title}</CardTitle>
                  <CardDescription className="mt-3 text-base text-neutral-300">
                    {alasanFeatured.body}
                  </CardDescription>
                </div>
              </RevealItem>

              <RevealGroup
                className="grid gap-4 sm:col-span-12 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1"
                stagger={0.1}
              >
                {alasanKecil.map((item) => (
                  <RevealItem key={item.title}>
                    <div className="card-hover flex h-full flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                      <item.icon className="card-hover-icon size-6 text-slime-lime-400" aria-hidden />
                      <CardTitle className="text-base text-neutral-50">{item.title}</CardTitle>
                      <CardDescription className="text-neutral-400">{item.body}</CardDescription>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </SectionContainer>
        </section>

        {/* 4b. UNTUK SISWA JUGA — section terang, di antara "Kenapa VokasIn" (dark) dan
            "Regulasi & Dana" (dark) supaya keduanya tidak bertumpuk langsung. Tidak ada
            warna baru, tidak ada titik glass tambahan (batas 2 sudah dipakai nav + CTA). */}
        <section
          id="untuk-siswa"
          className="relative overflow-hidden border-t border-neutral-200/50 bg-neutral-100"
        >
          <HairlineGridTexture />
          <Reveal>
          <SectionContainer className="py-16 sm:py-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Bukan cuma untuk guru.
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Dua alat berbasis SKKNI ini terbuka untuk siapa saja, tanpa akun.
            </p>

            <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2" stagger={0.1}>
              {alatPublik.map((alat) => (
                <RevealItem key={alat.href}>
                  <div className="card-hover flex h-full flex-col rounded-xl border border-border bg-card p-6">
                    <alat.icon className="card-hover-icon size-7 text-slime-lime-700" aria-hidden />
                    <CardTitle className="mt-3 text-lg">{alat.title}</CardTitle>
                    <CardDescription className="mt-2">{alat.body}</CardDescription>
                    <Link
                      href={alat.href}
                      className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-slime-lime-700 hover:text-slime-lime-800"
                    >
                      {alat.cta}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </SectionContainer>
          </Reveal>
        </section>

        {/* 5. REGULASI & DANA — dark tapi tint hijau (slime-lime-950), beda nuansa dari "Kenapa VokasIn" (neutral-950) */}
        <section
          id="regulasi"
          className="relative overflow-hidden border-t border-slime-lime-800/30 bg-slime-lime-950 text-neutral-50"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 -z-10 size-[420px] rounded-full bg-slime-lime-500/20 blur-[100px]"
          />
          <SectionContainer className="py-16 pb-36 sm:py-20 sm:pb-40">
          <div className="grid gap-8 lg:grid-cols-[1fr_200px] lg:items-start">
            <div>
              <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl">
                Bukan celah yang dibuat-buat
              </h2>
              <p className="mt-4 max-w-2xl text-base text-neutral-300 sm:text-lg">
                Kurikulum Merdeka mewajibkan sekolah menentukan sendiri kelas peminatannya, tapi
                tidak menyediakan instrumen untuk menurunkannya menjadi kompetensi yang
                terverifikasi. VokasIn dibangun untuk mengisi celah operasional itu — bukan
                pengganti proses sertifikasi resmi BNSP/LSP.
              </p>
              </Reveal>

              <Card className="mt-8 border-slime-lime-800/60 bg-slime-lime-900/60">
                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 size-6 shrink-0 text-slime-lime-400" aria-hidden />
                  <div>
                    <CardTitle className="text-lg text-neutral-50">Bisa dibiayai dari dana BOSP</CardTitle>
                    <p className="mt-2 text-sm text-neutral-200">
                      Langganan sekolah dapat dibiayai dana BOSP sesuai{" "}
                      <strong className="font-semibold text-neutral-50">Permendikdasmen No. 8 Tahun 2026</strong>
                      , komponen &ldquo;Pelaksanaan kegiatan pembelajaran&rdquo;, Pasal 42 ayat (1)
                      huruf c: &ldquo;penyediaan aplikasi atau perangkat lunak yang digunakan dalam
                      proses pembelajaran&rdquo;.
                    </p>
                    <p className="mt-2 text-sm text-neutral-400">
                      Dengan syarat: diposisikan sebagai aplikasi pembelajaran — bukan aplikasi
                      pendataan/pelaporan (larangan Pasal 66 ayat (1) huruf d &amp; e) — dan
                      tercatat dalam RKAS/ARKAS.
                    </p>
                    <p className="mt-3 text-xs text-neutral-400">
                      Sumber:{" "}
                      <a
                        href="https://peraturan.go.id/files/Permendikdasmen-no-8-tahun-2026.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-neutral-50"
                      >
                        Permendikdasmen No. 8 Tahun 2026, Pasal 42(1)(c) &amp; Pasal 66(1)(d/e)
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </Card>

              <div className="mt-4 flex items-start gap-3 text-sm text-neutral-400">
                <Landmark className="mt-0.5 size-5 shrink-0 text-slime-lime-400" aria-hidden />
                <p>
                  VokasIn tidak menjanjikan pembangunan infrastruktur skala besar (Knowledge
                  Graph/QuadStore, IaC penuh) pada tahap prototipe — cakupannya sengaja dijaga
                  proporsional dengan anggaran sekolah.
                </p>
              </div>
            </div>
            <DocumentToCardsIllustration
              gradient
              className="hidden w-full max-w-[200px] justify-self-end text-slime-lime-300 lg:block"
              aria-hidden
            />
          </div>
          </SectionContainer>
        </section>

        {/* 6. FAQ — bg solid (bukan bg-muted/50 yang translucent) supaya warnanya konsisten
            terhadap section gelap di atas maupun di bawahnya. */}
        <section
          id="faq"
          className="relative overflow-hidden border-t border-black/10"
          style={{
            backgroundColor: "color-mix(in oklch, var(--color-muted) 50%, var(--color-background))",
          }}
        >
          <DotGridTexture />
          <Reveal>
          <SectionContainer className="max-w-3xl py-16 sm:py-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Pertanyaan yang sering ditanyakan
            </h2>
            <div className="mt-8 divide-y divide-border">
              {faq.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-0 py-1 text-base font-medium text-foreground outline-none">
                    {item.q}
                    <ChevronDown
                      className="size-5 shrink-0 text-muted-foreground transition-transform duration-(--duration-ui) group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="fade-up mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </SectionContainer>
          </Reveal>
        </section>

        {/* 7. CTA PENUTUP — neutral-950, titik akhir, boleh gelap */}
        <section
          id="cta"
          className="relative overflow-hidden border-t border-white/10 bg-neutral-950"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slime-lime-500/10 blur-[120px]"
          />
          <SectionContainer className="py-16 sm:py-20">
          <Reveal>
          <Card className="glass glass-cta border border-white/10 bg-neutral-900/70 sm:p-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-50 sm:text-4xl">
              Ajukan ke kaprogli atau kepala sekolah Anda
            </h2>
            <p className="mt-3 max-w-2xl text-base text-neutral-400">
              Karena VokasIn bisa dianggarkan lewat RKAS/ARKAS dari dana BOSP, langkah paling
              realistis adalah membawanya ke rapat program keahlian atau ke kepala sekolah —
              bukan menunggu keputusan dari pusat.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/guru"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-neutral-50 px-5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200"
              >
                Coba alur guru
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/kaprogli"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slime-lime-500 px-5 text-sm font-medium text-neutral-50 transition-colors hover:bg-slime-lime-950"
              >
                Buka dashboard kaprogli
              </Link>
            </div>
          </Card>
          </Reveal>
          </SectionContainer>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
