import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getUnitKompetensiById, getSaranTopikForUnit, checkFeasibility, getProgramKeahlian } from "@/lib/data-access";
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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
      <Link
        href="/guru"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 transition-colors hover:text-slime-lime-800"
      >
        <ChevronLeft className="size-4" aria-hidden />
        <span>Pilih unit lain</span>
      </Link>

      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">{unit.judulUnit}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {unit.kodeUnit} &middot; {unit.dokumenSkkni}
        </p>
      </div>

      <div className="mt-8">
        <SusunModulClient
          unit={unit}
          saranAwal={saran}
          feasibilityByTopikId={feasibilityByTopikId}
          programList={getProgramKeahlian()}
        />
      </div>
    </main>
  );
}
