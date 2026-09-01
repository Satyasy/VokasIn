import Link from "next/link";
import { Map, ChevronRight } from "lucide-react";
import { getProgramKeahlian, getUnitKompetensiByProgram } from "@/lib/data-access";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Rute PUBLIK — tidak ada pengecekan sesi (proxy.ts hanya menjaga /guru dan
// /kaprogli). Siswa maupun pengunjung tanpa akun bisa membuka ini langsung.
export default function RoadmapPage() {
  const programList = getProgramKeahlian();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="flex items-center gap-2">
        <Map className="size-5 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-bold text-foreground">Roadmap Kompetensi</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Pilih program keahlian untuk melihat daftar unit kompetensi SKKNI yang sudah
        terverifikasi, lalu tandai unit yang sudah Anda kuasai sebagai catatan pribadi.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {programList.map((program) => {
          const jumlahUnit = getUnitKompetensiByProgram(program.id).length;
          return (
            <Link key={program.id} href={`/roadmap/${program.id}`}>
              <Card className="flex items-center justify-between gap-4 transition-colors hover:border-primary">
                <div>
                  <CardTitle className="text-base">
                    {program.nama} ({program.singkatan})
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {jumlahUnit === 0
                      ? "Belum ada unit kompetensi SKKNI terverifikasi"
                      : `${jumlahUnit} unit kompetensi SKKNI terverifikasi`}
                  </CardDescription>
                  {program.singkatan === "?" && (
                    <Badge variant="warning" className="mt-2">
                      Belum ditentukan kaprogli
                    </Badge>
                  )}
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
