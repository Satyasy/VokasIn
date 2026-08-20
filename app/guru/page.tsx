import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { getProgramKeahlian, getUnitKompetensiByProgram } from "@/lib/data-access";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LogoutButton } from "@/components/logout-button";

export default function GuruPage() {
  const programList = getProgramKeahlian();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pilih unit kompetensi</h1>
          <p className="mt-1 text-muted-foreground">
            Kartu saran akan disusun dari Elemen dan Kriteria Unjuk Kerja unit yang Anda pilih.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {programList.map((program) => {
          const units = getUnitKompetensiByProgram(program.id);
          return (
            <section key={program.id}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {program.nama} ({program.singkatan})
              </h2>
              {units.length === 0 ? (
                <EmptyState
                  icon={<BookOpenText className="size-8" />}
                  title="Belum ada unit kompetensi"
                  description="Dokumen SKKNI untuk program keahlian ini belum diunggah."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {units.map((unit) => (
                    <Link key={unit.id} href={`/guru/susun/${unit.id}`}>
                      <Card className="h-full transition-colors hover:border-primary">
                        <Badge variant="brand">{unit.kodeUnit}</Badge>
                        <CardTitle className="mt-2 text-base">{unit.judulUnit}</CardTitle>
                        <CardDescription className="mt-1">{unit.dokumenSkkni}</CardDescription>
                      </Card>
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
