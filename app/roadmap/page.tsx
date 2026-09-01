import Link from "next/link";
import { Map, ChevronRight } from "lucide-react";
import { getProgramKeahlian, getUnitKompetensiByProgram } from "@/lib/data-access";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RoadmapPage() {
  const programList = getProgramKeahlian();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2">
          <Map className="size-5 text-slime-lime-700" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Roadmap Kompetensi</h1>
        </div>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
          Pilih program keahlian untuk melihat daftar unit kompetensi SKKNI yang sudah
          terverifikasi, lalu tandai unit yang sudah Anda kuasai sebagai catatan pribadi.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {programList.map((program) => {
          const jumlahUnit = getUnitKompetensiByProgram(program.id).length;
          return (
            <Link key={program.id} href={`/roadmap/${program.id}`}>
              <Card className="flex items-center justify-between p-5 transition-all hover:border-slime-lime-500 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-neutral-900">{program.nama}</CardTitle>
                    <Badge variant="brand">{program.singkatan}</Badge>
                  </div>
                  <CardDescription className="mt-1 text-xs text-neutral-500">
                    {jumlahUnit === 0
                      ? "Belum ada unit terverifikasi"
                      : `${jumlahUnit} unit kompetensi terverifikasi`}
                  </CardDescription>
                </div>
                <ChevronRight className="size-5 text-neutral-400" aria-hidden />
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
