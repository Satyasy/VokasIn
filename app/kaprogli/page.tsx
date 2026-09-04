import Link from "next/link";
import { AlertTriangle, Gauge, Package, Settings, CheckCircle2, Wrench } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getProgramKeahlian,
  getSkillDeltaReport,
  getGapKandidat,
  getLabForProgram,
  getGuruById,
} from "@/lib/data-access";
import {
  ensureLabCacheFresh,
  listAllGuru,
  listJadwal,
  listKandidat,
  listMataPelajaran,
  listUnitKompetensi,
} from "@/lib/data-access-db";
import { toggleGapReviewedAction } from "./actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/circular-progress";
import { KaprogliTabsContainer } from "@/components/kaprogli/kaprogli-tabs-container";

const SEMESTER = "Ganjil 2026/2027";

export default async function KaprogliPage() {
  await ensureLabCacheFresh();
  const session = await getSession();
  const programList = getProgramKeahlian();

  const [guruList, jadwalList, kandidatList, mapelList, allUnits] = await Promise.all([
    listAllGuru(),
    listJadwal(),
    listKandidat("menunggu"),
    listMataPelajaran(),
    listUnitKompetensi(),
  ]);

  const guru = session ? getGuruById(session.guruId) : undefined;
  const currentProgramId = guru?.programKeahlianId || "pk-rpl";

  // Node 1: Skill Delta Score & Gap Kandidat
  const deltaScoreNode = (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2">
        {programList.map((program) => {
          const report = getSkillDeltaReport(program.id, SEMESTER);
          const level =
            report.skorDelta >= 50 ? "error" : report.skorDelta >= 25 ? "warning" : "success";
          return (
            <Card key={program.id}>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{program.nama}</CardTitle>
                  <CardDescription>{program.singkatan}</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <CircularProgress
                    value={report.skorDelta}
                    size={48}
                    strokeWidth={5}
                    label={`${report.skorDelta}`}
                    className={cn(
                      level === "error" && "[&_circle:nth-child(2)]:text-red-500",
                      level === "warning" && "[&_circle:nth-child(2)]:text-amber-500",
                      level === "success" && "[&_circle:nth-child(2)]:text-slime-lime-500"
                    )}
                  />
                  <Badge variant={level as "error" | "warning" | "success"}>
                    <Gauge className="size-3" aria-hidden />
                    Skor {report.skorDelta}
                  </Badge>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Unit tertelusur ke saran</dt>
                  <dd className="font-medium text-foreground">
                    {report.unitTerajarkan} / {report.totalUnitKompetensi}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Kandidat gap</dt>
                  <dd className="font-medium text-foreground">{report.gapKandidatCount}</dd>
                </div>
              </dl>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted" role="presentation">
                <div
                  className={cn(
                    "h-full rounded-full",
                    level === "error" && "bg-error",
                    level === "warning" && "bg-warning",
                    level === "success" && "bg-success"
                  )}
                  style={{ width: `${Math.min(report.skorDelta, 100)}%` }}
                />
              </div>

              <div className="mt-5 mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Inventaris lab
                </h3>
                <Link href="/kaprogli/lab" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <Settings className="size-3" aria-hidden />
                  Kelola
                </Link>
              </div>
              {getLabForProgram(program.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada alat terdaftar.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {getLabForProgram(program.id).map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm text-foreground">
                      <Package className="size-3.5 text-muted-foreground" aria-hidden />
                      {item.nama}
                      <span className="text-muted-foreground">&times;{item.jumlah}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <section>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Kandidat kesenjangan kompetensi</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Skill dari sumber sekunder yang belum match SKKNI ditandai sebagai gap, bukan
          ditolak otomatis.
        </p>
        <div className="flex flex-col gap-6">
          {programList.map((program) => {
            const gapKandidat = getGapKandidat(program.id);
            if (gapKandidat.length === 0) return null;
            return (
              <div key={program.id}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {program.singkatan}
                </h3>
                <div className="flex flex-col gap-2">
                  {gapKandidat.map((skill) => (
                    <Card key={skill.id} className="flex items-center gap-3 p-3">
                      <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{skill.namaSkill}</p>
                        <p className="text-xs text-muted-foreground">
                          Sumber: {skill.sumberSekunder} &middot; Tidak memiliki skor kemiripan ke
                          unit SKKNI manapun yang memenuhi ambang pemetaan.
                        </p>
                      </div>
                      {skill.sudahDitinjau ? (
                        <Badge variant="success">
                          <CheckCircle2 className="size-3" aria-hidden />
                          Sudah ditinjau
                        </Badge>
                      ) : (
                        <Badge variant="warning">Belum ada di SKKNI</Badge>
                      )}
                      <form action={toggleGapReviewedAction.bind(null, skill.id)}>
                        <Button type="submit" size="sm" variant={skill.sudahDitinjau ? "secondary" : "primary"}>
                          {skill.sudahDitinjau ? "Batalkan tinjauan" : "Tandai sudah ditinjau"}
                        </Button>
                      </form>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );

  // Node 3: Inventaris Lab & Alat
  const inventarisNode = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Inventaris &amp; Kesiapan Fasilitas Lab
          </h2>
          <p className="text-xs text-neutral-600">
            Daftar peralatan praktikum kejuruan per program keahlian untuk pengujian kelayakan materi ajar.
          </p>
        </div>
        <Link href="/kaprogli/lab">
          <Button size="sm" className="bg-slime-lime-600 font-bold text-neutral-950 hover:bg-slime-lime-500">
            <Settings className="size-3.5 mr-1.5" aria-hidden />
            Buka Pengelolaan Lengkap
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {programList.map((program) => {
          const items = getLabForProgram(program.id);
          return (
            <div key={program.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-neutral-900">{program.nama} ({program.singkatan})</h3>
                <Badge variant="brand">{items.length} Alat Terdata</Badge>
              </div>

              {items.length === 0 ? (
                <p className="mt-4 text-xs text-neutral-500">Belum ada alat terdaftar untuk program ini.</p>
              ) : (
                <ul className="mt-4 divide-y divide-neutral-100">
                  {items.map((item) => (
                    <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="size-4 text-slime-lime-700" aria-hidden />
                        <span className="font-medium text-neutral-800">{item.nama}</span>
                      </div>
                      <Badge variant="default" className="font-bold">
                        {item.jumlah} Unit
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
      {/* Header Utama Kaprogli */}
      <div className="border-b border-neutral-200 pb-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slime-lime-700">
          Area Kerja Ketua Program Keahlian
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Dashboard Kaprogli &amp; Supervisi Kurikulum
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          Semester {SEMESTER}. Pantau kesenjangan kurikulum (Skill Delta), supervisi beban JP guru produktif, dan kelola ketersediaan inventaris lab.
        </p>
      </div>

      {/* Tab Navigasi Terpadu */}
      <KaprogliTabsContainer
        guruList={guruList}
        jadwalList={jadwalList}
        currentKaprogliProgramId={currentProgramId}
        deltaScoreNode={deltaScoreNode}
        inventarisNode={inventarisNode}
        kandidatList={kandidatList}
        programList={programList}
        mapelList={mapelList}
        availableUnits={allUnits}
      />
    </main>
  );
}
