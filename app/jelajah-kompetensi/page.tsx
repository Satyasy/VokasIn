import { Compass } from "lucide-react";
import { JelajahKompetensiClient } from "@/components/jelajah/jelajah-kompetensi-client";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";
import { SubpageHero } from "@/components/ui/subpage-hero";

export default function JelajahKompetensiPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <AdaptiveNavbar />
      <SubpageHero
        badgeIcon={<Compass className="size-3.5 text-slime-lime-400" aria-hidden />}
        badgeText="PENCOCOKAN SEMANTIK INSTAN"
        title="Jelajahi Kompetensi dari Portofolio"
        titleHighlight="Nyata"
        oneLiner="Temukan unit SKKNI yang paling relevan dengan riwayat proyek, pengalaman magang, atau portofolio teknis Anda secara otomatis."
        stats={[
          { value: "Hybrid Match", label: "Semantik & Kata Kunci" },
          { value: "< 1 Detik", label: "Kecepatan Analisis" },
          { value: "1.000+", label: "Unit Terintegrasi" },
        ]}
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
        <JelajahKompetensiClient />
      </main>
    </div>
  );
}
