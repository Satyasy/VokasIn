import Image from "next/image";
import { Mail, ExternalLink, GitBranch } from "lucide-react";
import { SectionContainer } from "@/components/landing/section-container";

const sumber = [
  {
    label: "SKKNI — Kemnaker RI",
    href: "https://katalog.data.go.id/dataset/standar-kompetensi-kerja-nasional-indonesia-skkni-yang-ditetapkan-s-d-tw-iii-tahun-2022",
  },
  {
    label: "Permendikdasmen No. 8 Tahun 2026",
    href: "https://peraturan.go.id/files/Permendikdasmen-no-8-tahun-2026.pdf",
  },
  {
    label: "Statistik TBIG (JatimTimes, Mei 2026)",
    href: "https://jatimtimes.com/baca/3331344208/20260524/014200/kurikulum-smk-berkejaran-dengan-akselerasi-teknologi-masihkah-pendidikan-vokasi-relevan-dengan-lapangan-kerja",
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-100 text-neutral-900">
      <SectionContainer className="py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          
          {/* Kolom Kiri: Logo Utama, Deskripsi, dan Logo Penyelenggara */}
          <div className="flex flex-col md:col-span-6 lg:col-span-5">
            <div className="flex items-center gap-3.5">
              <Image
                src="/logo.png"
                alt="Logo VokasIn"
                width={64}
                height={64}
                className="size-14 rounded-xl object-contain shadow-sm"
              />
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-neutral-900">VokasIn</span>
                <p className="text-xs font-semibold text-slime-lime-800 uppercase tracking-wide">
                  Analitik Kurikulum SMK
                </p>
              </div>
            </div>
            
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-700">
              Instrumen cerdas bagi guru produktif SMK dan kaprogli untuk menerjemahkan dokumen SKKNI resmi menjadi perangkat ajar terstandar, dengan kendali penuh di tangan guru.
            </p>

            <div className="mt-7 border-t border-neutral-200/80 pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Penyelenggara
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-6">
                <Image
                  src="/logo-binus.png"
                  alt="Logo BINUS University"
                  width={160}
                  height={56}
                  className="h-12 w-auto object-contain transition-transform hover:scale-105"
                />
                <Image
                  src="/logo-beefest.png"
                  alt="Logo BEEFEST 2026"
                  width={160}
                  height={56}
                  className="h-12 w-auto object-contain transition-transform hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Kolom Tengah: Sumber & Referensi */}
          <div className="md:col-span-3 lg:col-span-4">
            <p className="text-base font-bold tracking-wide text-neutral-900">Sumber &amp; Regulasi</p>
            <ul className="mt-4 space-y-3">
              {sumber.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-slime-lime-800"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/satyasy/VokasIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-slime-lime-800"
                >
                  <GitBranch className="size-3.5 shrink-0 opacity-60" aria-hidden />
                  <span>Repositori Kode (GitHub)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom Kanan: Kontak & Informasi */}
          <div className="md:col-span-3 lg:col-span-3">
            <p className="text-base font-bold tracking-wide text-neutral-900">Hubungi Pengembang</p>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="mailto:satyavpandega@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition-colors hover:text-slime-lime-800"
              >
                <Mail className="size-4 shrink-0 text-slime-lime-700" aria-hidden />
                <span>satyavpandega@gmail.com</span>
              </a>
              <p className="text-sm leading-relaxed text-neutral-600">
                Prototipe dikembangkan untuk kompetisi BEEFEST Software Development Life Cycle (SDLC) 2026.
              </p>
            </div>
          </div>

        </div>
      </SectionContainer>

      {/* Baris Bawah: Hak Cipta */}
      <div className="border-t border-neutral-200 bg-neutral-200/50 py-5">
        <SectionContainer className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm font-medium text-neutral-600">
            &copy; 2026 Tim VokasIn. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-xs font-semibold text-neutral-500">
            BEEFEST SDLC 2026 &bull; Bina Nusantara University
          </p>
        </SectionContainer>
      </div>
    </footer>
  );
}
