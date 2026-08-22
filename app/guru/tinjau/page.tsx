import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProgramKeahlian } from "@/lib/data-access";
import { TinjauAkhirClient } from "@/components/guru/tinjau-akhir-client";

export default function TinjauAkhirPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/guru"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Kembali ke kanvas
      </Link>

      <h1 className="text-2xl font-bold text-foreground">Tinjau akhir sebelum ekspor</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Baca ulang semua kartu yang sudah diterima secara utuh. Anda masih bisa menghapus kartu
        atau mengubah catatan pedagogi di sini sebelum mengekspor.
      </p>

      <div className="mt-8">
        <TinjauAkhirClient programList={getProgramKeahlian()} />
      </div>
    </main>
  );
}
