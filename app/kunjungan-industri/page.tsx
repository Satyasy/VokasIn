import { Building2 } from "lucide-react";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";
import { MitraIndustriClient } from "@/components/industri/mitra-industri-client";
import { SubpageHero } from "@/components/ui/subpage-hero";

export const metadata = {
  title: "Mitra Industri & Pembelajaran Lapangan - VokasIn",
  description:
    "Direktori perusahaan mitra industri untuk kunjungan industri, studi lapangan, dan mini pelatihan kejuruan SMK yang terintegrasi dengan Unit SKKNI resmi.",
};

export default function KunjunganIndustriPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <AdaptiveNavbar />
      <SubpageHero
        badgeIcon={<Building2 className="size-3.5 text-slime-lime-400" aria-hidden />}
        badgeText="PENYELARASAN DUDI (PERMENDIKDASMEN NO. 8/2026)"
        title="Mitra Industri & Pembelajaran"
        titleHighlight="Lapangan"
        oneLiner="Jembatani kurikulum SMK dengan kebutuhan industri nyata lewat kunjungan terarah dan mini pelatihan yang terpetakan langsung ke Unit SKKNI."
        stats={[
          { value: "6 Korporasi", label: "Mitra Industri Nasional" },
          { value: "100%", label: "Terpetakan ke SKKNI" },
          { value: "Full-Day", label: "Agenda Observasi & Lab" },
        ]}
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
        <MitraIndustriClient />
      </main>
    </div>
  );
}
