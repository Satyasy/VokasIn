import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProgramKeahlian } from "@/lib/data-access";
import { TinjauAkhirClient } from "@/components/guru/tinjau-akhir-client";

export default function TinjauAkhirPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6">
      <Link
        href="/guru"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 transition-colors hover:text-slime-lime-800"
      >
        <ChevronLeft className="size-4" aria-hidden />
        <span>Kembali ke kanvas</span>
      </Link>

      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Tinjau akhir sebelum ekspor</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Baca ulang semua kartu yang sudah diterima secara utuh. Anda masih bisa menghapus kartu
          atau mengubah catatan pedagogi di sini sebelum mengekspor.
        </p>
      </div>

      <div className="mt-8">
        <TinjauAkhirClient programList={getProgramKeahlian()} />
      </div>
    </main>
  );
}
