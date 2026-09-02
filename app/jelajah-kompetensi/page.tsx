import { Compass } from "lucide-react";
import { JelajahKompetensiClient } from "@/components/jelajah/jelajah-kompetensi-client";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";

export default function JelajahKompetensiPage() {
  return (
    <>
      <AdaptiveNavbar />
      <div className="pt-24 sm:pt-28 pb-16">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
          <div className="border-b border-neutral-200 pb-6">
            <div className="flex items-center gap-2">
              <Compass className="size-5 text-slime-lime-700" aria-hidden />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Jelajah Kompetensi</h1>
            </div>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              Tempelkan ringkasan pengalaman, proyek, atau portofolio Anda untuk melihat unit
              kompetensi SKKNI yang berkaitan secara otomatis.
            </p>
          </div>

          <JelajahKompetensiClient />
        </main>
      </div>
    </>
  );
}
