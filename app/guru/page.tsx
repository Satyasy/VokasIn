import Link from "next/link";
import { BookOpenText, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getProgramKeahlian, getUnitKompetensiByProgram, getGuruById } from "@/lib/data-access";
import { listJadwal, getJpSummaryByGuru } from "@/lib/data-access-db";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ParallaxCard } from "@/components/ui/parallax-card";
import { UnitSearch } from "@/components/guru/unit-search";
import { AsistenKebutuhanModul } from "@/components/guru/asisten-kebutuhan-modul";
import { DraftStatusBar } from "@/components/guru/draft-status-bar";
import { GuruTabsContainer } from "@/components/guru/guru-tabs-container";
import { GuruUnitListPaginated } from "@/components/guru/guru-unit-list-paginated";

export default async function GuruPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const initialTab = params?.tab;
  const session = await getSession();
  const guruId = session?.guruId || "guru-01";
  const guru = getGuruById(guruId);
  const programKeahlianId = guru?.programKeahlianId || "pk-tkj";
  const programList = getProgramKeahlian();

  // Ambil data jadwal riil dan agregat JP dari database
  const [jadwalList, jpSummary] = await Promise.all([
    listJadwal({ guruId }),
    getJpSummaryByGuru(guruId),
  ]);

  const allAvailableUnits = programList.flatMap((p) =>
    getUnitKompetensiByProgram(p.id).map((u) => ({
      ...u,
      programSingkatan: p.singkatan,
    }))
  );

  // Node penyusunan modul ajar (tab ke-3) dengan Paginasi 10 Kartu & Search Bar
  const modulAjarNode = (
    <div className="space-y-8">
      <div>
        <DraftStatusBar programList={programList} />
        <UnitSearch />
        <AsistenKebutuhanModul />
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="border-b border-neutral-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-neutral-900">
            Katalog Unit Kompetensi SKKNI Terverifikasi
          </h2>
          <p className="text-xs text-neutral-500">
            Pilih unit kompetensi untuk menyusun modul ajar, kartu saran praktikum, dan jobsheet berbasis standar nasional.
          </p>
        </div>

        <GuruUnitListPaginated
          programList={programList}
          units={allAvailableUnits}
        />
      </div>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
      {/* Header Utama Guru */}
      <div className="border-b border-neutral-200 pb-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slime-lime-700">
          Ruang Kerja Guru Produktif
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-neutral-900">
          Dashboard Pembelajaran &amp; Modul Ajar
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          Kelola agenda mengajar harian, pantau alokasi Jam Pelajaran (JP), dan rancang perangkat ajar berbasis SKKNI resmi.
        </p>
      </div>

      {/* Kontainer Tab Segmented Terpadu */}
      <GuruTabsContainer
        jadwalList={jadwalList}
        jpSummary={jpSummary}
        availableUnits={allAvailableUnits}
        programKeahlianId={programKeahlianId}
        modulAjarNode={modulAjarNode}
        initialTab={initialTab}
      />
    </main>
  );
}
