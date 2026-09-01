import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getUnitKompetensiById, getSaranTopikForUnit, checkFeasibility, getProgramKeahlian } from "@/lib/data-access";
import { ensureLabCacheFresh } from "@/lib/data-access-db";
import { MultiUnitSusunClient, type UnitSaranBundle } from "@/components/guru/multi-unit-susun-client";

export default async function SusunModulMultiPage({
  searchParams,
}: {
  searchParams: Promise<{ units?: string }>;
}) {
  const { units } = await searchParams;
  const ids = (units ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) redirect("/guru");

  await ensureLabCacheFresh();

  const bundles: UnitSaranBundle[] = ids.flatMap((id) => {
    const unit = getUnitKompetensiById(id);
    if (!unit) return [];
    const saranAwal = getSaranTopikForUnit(unit.id);
    const feasibilityByTopikId = Object.fromEntries(
      saranAwal.map((t) => [t.id, checkFeasibility(t, unit.programKeahlianId)])
    );
    return [{ unit, saranAwal, feasibilityByTopikId }];
  });
  if (bundles.length === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
      <Link
        href="/guru"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 transition-colors hover:text-slime-lime-800"
      >
        <ChevronLeft className="size-4" aria-hidden />
        <span>Kembali ke pencarian</span>
      </Link>

      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Tinjau kartu saran dari unit terpilih</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {bundles.length} unit kompetensi dipilih lewat Asisten Kebutuhan Modul. Setiap kartu tetap perlu Anda
          terima, tolak, atau modifikasi satu per satu — tidak ada yang masuk ke draft secara otomatis.
        </p>
      </div>

      <div className="mt-8">
        <MultiUnitSusunClient bundles={bundles} programList={getProgramKeahlian()} />
      </div>
    </main>
  );
}
