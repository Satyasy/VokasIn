import Link from "next/link";
import { Map, ChevronRight, BookOpenText } from "lucide-react";
import { getProgramKeahlian, getUnitKompetensiByProgram } from "@/lib/data-access";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubpageHero } from "@/components/ui/subpage-hero";

export default function RoadmapPage() {
  const programList = getProgramKeahlian();

  return (
    <>
      <SubpageHero
        badgeIcon={<Map className="size-3.5 text-slime-lime-400" aria-hidden />}
        badgeText="NAVIGASI STANDAR NASIONAL"
        title="Roadmap Kompetensi Kejuruan"
        titleHighlight="SMK"
        oneLiner="Petakan capaian belajar siswa langkah demi langkah berbasis unit SKKNI terverifikasi untuk setiap program keahlian."
        stats={[
          { value: `${programList.length}`, label: "Program Keahlian" },
          { value: "1.000+", label: "Unit SKKNI Resmi" },
          { value: "100%", label: "Standar Kemnaker" },
        ]}
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-neutral-900">
            Pilih Program Keahlian
          </h2>
          <span className="text-xs text-neutral-500 font-medium">
            Tersedia {programList.length} peminatan vokasi
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {programList.map((program) => {
            const jumlahUnit = getUnitKompetensiByProgram(program.id).length;
            return (
              <Link key={program.id} href={`/roadmap/${program.id}`} className="group block">
                <Card className="flex items-center justify-between p-5 rounded-2xl border border-neutral-200 bg-white transition-all group-hover:border-slime-lime-500 group-hover:shadow-md">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base font-bold text-neutral-900">
                        {program.nama}
                      </CardTitle>
                      <Badge variant="brand" className="font-bold">
                        {program.singkatan}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1.5 text-xs text-neutral-500 flex items-center gap-1.5">
                      <BookOpenText className="size-3.5 text-neutral-400" />
                      <span>
                        {jumlahUnit === 0
                          ? "Belum ada unit terverifikasi"
                          : `${jumlahUnit} unit kompetensi SKKNI terverifikasi`}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-slime-lime-500 group-hover:text-neutral-950">
                    <ChevronRight className="size-5" aria-hidden />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
