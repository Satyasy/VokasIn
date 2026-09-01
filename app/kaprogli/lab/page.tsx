import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProgramKeahlian, getLabForProgram } from "@/lib/data-access";
import { ensureLabCacheFresh } from "@/lib/data-access-db";
import { LabInventorySection } from "@/components/kaprogli/lab-inventory-section";

export default async function LabInventoriPage() {
  await ensureLabCacheFresh();
  const programList = getProgramKeahlian();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
      <Link href="/kaprogli" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 transition-colors hover:text-slime-lime-800">
        <ArrowLeft className="size-4" aria-hidden />
        <span>Kembali ke dashboard</span>
      </Link>
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Manajemen Inventaris Lab</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Perubahan di sini langsung dipakai oleh Resource Feasibility Checker saat guru menyusun
          modul ajar.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-10">
        {programList.map((program) => (
          <section key={program.id}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {program.nama} ({program.singkatan})
            </h2>
            <LabInventorySection programKeahlianId={program.id} items={getLabForProgram(program.id)} />
          </section>
        ))}
      </div>
    </main>
  );
}
