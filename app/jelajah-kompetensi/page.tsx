import { Compass } from "lucide-react";
import { JelajahKompetensiClient } from "@/components/jelajah/jelajah-kompetensi-client";

// Rute PUBLIK — tidak ada pengecekan sesi (proxy.ts hanya menjaga /guru dan
// /kaprogli).
export default function JelajahKompetensiPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center gap-2">
        <Compass className="size-5 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-bold text-foreground">Jelajah Kompetensi</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Tempelkan ringkasan pengalaman, proyek, atau portofolio Anda untuk melihat unit
        kompetensi SKKNI yang berkaitan.
      </p>

      <JelajahKompetensiClient />
    </main>
  );
}
