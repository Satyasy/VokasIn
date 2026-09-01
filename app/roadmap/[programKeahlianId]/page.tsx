import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProgramKeahlian, getUnitKompetensiByProgram } from "@/lib/data-access";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpenText } from "lucide-react";
import { RoadmapJalurClient } from "@/components/roadmap/roadmap-jalur-client";

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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
      <Link
        href="/roadmap"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 transition-colors hover:text-slime-lime-800"
      >
        <ChevronLeft className="size-4" aria-hidden />
        <span>Pilih program keahlian lain</span>
      </Link>

      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {program.nama} ({program.singkatan})
        </h1>
      </div>

      {units.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<BookOpenText className="size-8" />}
          title="Belum ada unit kompetensi"
          description="Dokumen SKKNI untuk program keahlian ini belum diunggah."
        />
      ) : (
        <RoadmapJalurClient programKeahlianId={programKeahlianId} units={units} />
      )}
    </main>
  );
}
