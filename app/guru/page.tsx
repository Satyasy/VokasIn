import Link from "next/link";
import { BookOpenText, ArrowRight } from "lucide-react";
import { getProgramKeahlian, getUnitKompetensiByProgram } from "@/lib/data-access";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ParallaxCard } from "@/components/ui/parallax-card";
import { UnitSearch } from "@/components/guru/unit-search";
import { AsistenKebutuhanModul } from "@/components/guru/asisten-kebutuhan-modul";
import { DraftStatusBar } from "@/components/guru/draft-status-bar";

export default function GuruPage() {
  const programList = getProgramKeahlian();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
      <div className="border-b border-neutral-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slime-lime-700">
          Alur Penyusunan Perangkat Ajar
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-neutral-900">
          Pilih Unit Kompetensi SKKNI
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          Pilih unit kompetensi resmi untuk menyusun kartu saran jobsheet dan rencana praktikum berbasis standar nasional.
        </p>
      </div>

      <div className="mt-8">
        <DraftStatusBar programList={programList} />
        <UnitSearch />
        <AsistenKebutuhanModul />
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {programList.map((program) => {
          const units = getUnitKompetensiByProgram(program.id);
          return (
            <section key={program.id}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
                  {program.nama} ({program.singkatan})
                </h2>
                <span className="text-xs font-semibold text-neutral-500">
                  {units.length} Unit Tersedia
                </span>
              </div>

              {units.length === 0 ? (
                <EmptyState
                  icon={<BookOpenText className="size-8" />}
                  title="Belum ada unit kompetensi"
                  description="Dokumen SKKNI untuk program keahlian ini belum diunggah."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {units.map((unit) => (
                    <Link key={unit.id} href={`/guru/susun/${unit.id}`} className="group h-full">
                      <ParallaxCard className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all group-hover:border-slime-lime-500 group-hover:shadow-md">
                        <div>
                          <Badge
                            variant="brand"
                            className="rounded-lg border border-slime-lime-300 bg-slime-lime-100 font-bold text-slime-lime-900"
                          >
                            {unit.kodeUnit}
                          </Badge>
                          <CardTitle className="mt-3 text-base font-bold text-neutral-900 leading-snug">
                            {unit.judulUnit}
                          </CardTitle>
                          <CardDescription className="mt-2 text-xs leading-relaxed text-neutral-500">
                            {unit.dokumenSkkni}
                          </CardDescription>
                        </div>

                        <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-slime-lime-700 transition-colors group-hover:text-slime-lime-900">
                          <span>Susun Modul Ajar</span>
                          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                        </div>
                      </ParallaxCard>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
