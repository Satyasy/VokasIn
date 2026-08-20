import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getUnitKompetensiById, getSaranTopikForUnit, checkFeasibility } from "@/lib/data-access";
import { ensureLabCacheFresh } from "@/lib/data-access-db";
import { SusunModulClient } from "@/components/guru/susun-modul-client";

export default async function SusunModulPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  await ensureLabCacheFresh();
  const unit = getUnitKompetensiById(unitId);
  if (!unit) notFound();

  const saran = getSaranTopikForUnit(unit.id);
  const feasibilityByTopikId = Object.fromEntries(
    saran.map((t) => [t.id, checkFeasibility(t, unit.programKeahlianId)])
  );

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Link
        href="/guru"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Pilih unit lain
      </Link>

      <h1 className="text-2xl font-bold text-foreground">{unit.judulUnit}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {unit.kodeUnit} &middot; {unit.dokumenSkkni}
      </p>

      <div className="mt-8">
        <SusunModulClient unit={unit} saranAwal={saran} feasibilityByTopikId={feasibilityByTopikId} />
      </div>
    </main>
  );
}
