import { Building2 } from "lucide-react";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";
import { MitraIndustriClient } from "@/components/industri/mitra-industri-client";

export const metadata = {
  title: "Mitra Industri & Pembelajaran Lapangan - VokasIn",
  description:
    "Direktori perusahaan mitra industri untuk kunjungan industri, studi lapangan, dan mini pelatihan kejuruan SMK yang terintegrasi dengan Unit SKKNI resmi.",
};

export default function KunjunganIndustriPage() {
  return (
    <>
      <AdaptiveNavbar />
      <div className="pt-24 sm:pt-28 pb-16">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
          <div className="border-b border-neutral-200 pb-6 mb-8">
            <div className="flex items-center gap-2">
              <Building2 className="size-6 text-slime-lime-800" aria-hidden />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Mitra Industri &amp; Pembelajaran Lapangan
              </h1>
            </div>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base leading-relaxed">
              Daftar mitra industri nyata untuk referensi kunjungan industri, studi observasi, dan mini pelatihan kejuruan SMK. Seluruh topik lapangan telah diselaraskan dengan Unit SKKNI rujukan kurikulum nasional.
            </p>
          </div>

          <MitraIndustriClient />
        </main>
      </div>
    </>
  );
}
