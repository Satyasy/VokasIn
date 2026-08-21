import { Mail } from "lucide-react";
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
    label: "JatimTimes, 24 Mei 2026 (statistik TBIG)",
    href: "https://jatimtimes.com/baca/3331344208/20260524/014200/kurikulum-smk-berkejaran-dengan-akselerasi-teknologi-masihkah-pendidikan-vokasi-relevan-dengan-lapangan-kerja",
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <SectionContainer className="grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-foreground">VokasIn</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Alat bagi guru produktif SMK dan kaprogli untuk menerjemahkan SKKNI menjadi
            perangkat ajar, dengan konfirmasi manusia di setiap langkah.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Prototipe — proyek BEEFEST SDLC 2026
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Sumber &amp; Referensi</p>
          <ul className="mt-2 space-y-1.5">
            {sumber.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/satyasy/VokasIn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Repositori kode (GitHub)
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Kontak</p>
          <a
            href="mailto:satyavpandega@gmail.com"
            className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Mail className="size-4 shrink-0" aria-hidden />
            satyavpandega@gmail.com
          </a>
        </div>
      </SectionContainer>

      <div className="border-t border-border">
        <SectionContainer as="p" className="py-4 text-xs text-muted-foreground">
          © 2026 Tim VokasIn
        </SectionContainer>
      </div>
    </footer>
  );
}
