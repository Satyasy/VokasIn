import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProgramKeahlian, getLabForProgram } from "@/lib/data-access";
import { ensureLabCacheFresh } from "@/lib/data-access-db";
import { LabInventorySection } from "@/components/kaprogli/lab-inventory-section";

export default async function LabInventoriPage() {
  await ensureLabCacheFresh();
  const programList = getProgramKeahlian();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link href="/kaprogli" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-foreground">Manajemen Inventaris Lab</h1>
      <p className="mt-1 text-muted-foreground">
        Perubahan di sini langsung dipakai oleh Resource Feasibility Checker saat guru menyusun
        modul ajar.
      </p>

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
