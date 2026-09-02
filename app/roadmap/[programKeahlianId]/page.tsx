import { notFound } from "next/navigation";
import { Map, BookOpenText } from "lucide-react";
import { getProgramKeahlian, getUnitKompetensiByProgram } from "@/lib/data-access";
import { EmptyState } from "@/components/ui/empty-state";
import { RoadmapJalurClient } from "@/components/roadmap/roadmap-jalur-client";
import { SubpageHero } from "@/components/ui/subpage-hero";

export default async function RoadmapJalurPage({
  params,
}: {
  params: Promise<{ programKeahlianId: string }>;
}) {
  const { programKeahlianId } = await params;
  const program = getProgramKeahlian().find((p) => p.id === programKeahlianId);
  if (!program) notFound();

  const units = getUnitKompetensiByProgram(programKeahlianId);

  return (
    <>
      <SubpageHero
        badgeIcon={<Map className="size-3.5 text-slime-lime-400" aria-hidden />}
        badgeText={`PROGRAM KEAHLIAN ${program.singkatan}`}
        title={program.nama}
        titleHighlight={`(${program.singkatan})`}
        oneLiner={`Alur penguasaan unit kompetensi SKKNI resmi untuk kurikulum kejuruan ${program.nama}.`}
        backLink={{
          href: "/roadmap",
          label: "Kembali ke Direktori Program Keahlian",
        }}
        stats={[
          { value: `${units.length}`, label: "Unit SKKNI Terdaftar" },
          { value: "Fase F", label: "Jenjang SMK Kelas XI & XII" },
        ]}
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
        {units.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<BookOpenText className="size-8" />}
            title="Belum ada unit kompetensi"
            description="Dokumen SKKNI untuk program keahlian ini belum diunggah."
          />
        ) : (
          <RoadmapJalurClient programKeahlianId={programKeahlianId} units={units} />
        )}
      </main>
    </>
  );
}
