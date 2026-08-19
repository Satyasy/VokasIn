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
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
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

const alasan = [
  {
    icon: FileText,
    title: "Bukan generator RPP asal jadi",
    body: "Kartu saran ditarik langsung dari teks Unit Kompetensi dan Kriteria Unjuk Kerja SKKNI asli. Perluasan dengan AI bersifat opsional dan selalu ditandai jelas saat dipakai.",
  },
  {
    icon: MousePointerClick,
    title: "Anda yang memutuskan, bukan sistem",
    body: "Setiap kartu saran harus Anda seret satu per satu ke kanvas modul ajar. Tidak ada tombol “setujui semua” — friksi ini disengaja.",
  },
  {
    icon: Wrench,
    title: "Cek alat lab dulu sebelum menyarankan",
    body: "Resource Feasibility Checker mencocokkan fungsi alat, bukan merek dagang, dengan inventaris lab sekolah Anda — supaya tidak ada praktik yang mustahil dijalankan.",
  },
  {
    icon: AlertTriangle,
    title: "Skill di luar standar tidak dibuang",
    body: "Kompetensi dari sumber sekunder yang belum tercatat di SKKNI ditandai sebagai kandidat kesenjangan (gap), bukan hilang begitu saja — kaprogli yang menindaklanjuti.",
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
        <section id="hero" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="fade-up">
              <Badge variant="brand">Untuk guru produktif & kaprogli SMK</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Asisten penyusunan perangkat ajar untuk guru produktif SMK, agar jobsheet siap
                pakai tanpa menyusun dari nol.
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                VokasIn menyusun kartu saran langsung dari teks Unit Kompetensi dan Kriteria
                Unjuk Kerja SKKNI resmi. Anda yang menyeret satu per satu ke kanvas modul ajar,
                memeriksa kelayakan alat lab, lalu mengekspornya — bukan sistem yang
                meng-auto-generate.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/guru"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-slime-lime-700"
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
            <DocumentToCardsIllustration className="mx-auto w-full max-w-md text-slime-lime-600 fade-up" />
          </div>
        </section>

        {/* 2. MASALAH */}
        <section id="masalah" className="border-t border-border bg-muted/50">
          <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Otonomi tanpa instrumen
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Kurikulum Merdeka memberi SMK kebebasan membuka kelas peminatan lintas jurusan —
              misalnya siswa TKJ mendalami Cloud Computing atau DKV. Tapi kebebasan ini tidak
              disertai instrumen untuk menurunkan minat tersebut menjadi kompetensi yang
              terverifikasi dan bisa diajarkan.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="bg-card">
                <p className="text-4xl font-bold text-slime-lime-800">9,2%</p>
                <p className="mt-2 text-sm text-foreground">
                  Pada kasus mitra sertifikasi TBIG (2025), dari 1.569 siswa yang diajukan
                  sekolah untuk pelatihan, hanya 145 siswa (9,2%) yang lulus standar
                  kualifikasi.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sumber: kasus mitra sertifikasi TBIG, dicatat di PRD.md §2.
                </p>
              </Card>
              <Card className="bg-card">
                <p className="text-4xl font-bold text-slime-lime-800">1.000+</p>
                <p className="mt-2 text-sm text-foreground">
                  Dokumen SKKNI resmi sudah terbuka luas per triwulan III 2022 — tapi uji
                  duplikasi pasar menemukan belum ada satu pun alat yang menerjemahkannya
                  otomatis menjadi perangkat ajar siap pakai.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Sumber: PRD.md §2.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. CARA KERJA */}
        <section id="cara-kerja" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Empat langkah, dari SKKNI ke jobsheet
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Tidak ada tombol ajaib. Tiap langkah butuh tindakan eksplisit dari Anda.
          </p>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <ol className="grid gap-6 sm:grid-cols-2">
              {langkahKerja.map((langkah, i) => (
                <li key={langkah.title} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <langkah.icon className="size-5 text-slime-lime-700" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-foreground">{langkah.title}</h3>
                  <p className="text-sm text-muted-foreground">{langkah.body}</p>
                </li>
              ))}
            </ol>
            <LabCheckIllustration className="mx-auto hidden w-full max-w-xs text-slime-lime-600 lg:block" />
          </div>
        </section>

        {/* 4. KENAPA VOKASIN */}
        <section id="kenapa" className="border-t border-border bg-muted/50">
          <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Kenapa VokasIn
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Empat batasan yang sengaja kami pertahankan, bukan fitur yang kami lepas begitu
              saja.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {alasan.map((item) => (
                <Card key={item.title} className="bg-card">
                  <item.icon className="size-7 text-slime-lime-700" aria-hidden />
                  <CardTitle className="mt-3 text-base">{item.title}</CardTitle>
                  <CardDescription className="mt-1.5">{item.body}</CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5. REGULASI & DANA */}
        <section id="regulasi" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Bukan celah yang dibuat-buat
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Kurikulum Merdeka mewajibkan sekolah menentukan sendiri kelas peminatannya, tapi
            tidak menyediakan instrumen untuk menurunkannya menjadi kompetensi yang
            terverifikasi. VokasIn dibangun untuk mengisi celah operasional itu — bukan
            pengganti proses sertifikasi resmi BNSP/LSP.
          </p>

          <Card className="mt-8 bg-card">
            <div className="flex items-start gap-3">
              <Wallet className="mt-0.5 size-6 shrink-0 text-slime-lime-700" aria-hidden />
              <div>
                <CardTitle className="text-lg">Bisa dibiayai dari dana BOSP</CardTitle>
                <p className="mt-2 text-sm text-foreground">
                  Langganan sekolah dapat dibiayai dana BOSP sesuai{" "}
                  <strong className="font-semibold">Permendikdasmen No. 8 Tahun 2026</strong>
                  , komponen &ldquo;Pelaksanaan kegiatan pembelajaran&rdquo;, Pasal 42 ayat (1)
                  huruf c: &ldquo;penyediaan aplikasi atau perangkat lunak yang digunakan dalam
                  proses pembelajaran&rdquo;.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dengan syarat: diposisikan sebagai aplikasi pembelajaran — bukan aplikasi
                  pendataan/pelaporan (larangan Pasal 66 ayat (1) huruf d &amp; e) — dan
                  tercatat dalam RKAS/ARKAS.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">Sumber: PRD.md §11.</p>
              </div>
            </div>
          </Card>

          <div className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
            <Landmark className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p>
              VokasIn tidak menjanjikan pembangunan infrastruktur skala besar (Knowledge
              Graph/QuadStore, IaC penuh) pada tahap prototipe — cakupannya sengaja dijaga
              proporsional dengan anggaran sekolah.
            </p>
          </div>
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="border-t border-border bg-muted/50">
          <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Pertanyaan yang jujur perlu dijawab jujur
            </h2>
            <div className="mt-8 divide-y divide-border">
              {faq.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground">
                    {item.q}
                    <ChevronDown
                      className="size-5 shrink-0 text-muted-foreground transition-transform duration-(--duration-ui) group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 7. CTA PENUTUP */}
        <section id="cta" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <Card className="border-slime-lime-700 bg-slime-lime-50 sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ajukan ke kaprogli atau kepala sekolah Anda
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Karena VokasIn bisa dianggarkan lewat RKAS/ARKAS dari dana BOSP, langkah paling
              realistis adalah membawanya ke rapat program keahlian atau ke kepala sekolah —
              bukan menunggu keputusan dari pusat.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/guru"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-slime-lime-700"
              >
                Coba alur guru
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/kaprogli"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slime-lime-700 px-5 text-sm font-medium text-foreground transition-colors hover:bg-slime-lime-100"
              >
                Buka dashboard kaprogli
              </Link>
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}
