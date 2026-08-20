import Link from "next/link";
import { AlertTriangle, Gauge, Package, Settings, CheckCircle2 } from "lucide-react";
import {
  getProgramKeahlian,
  getSkillDeltaReport,
  getGapKandidat,
  getLabForProgram,
} from "@/lib/data-access";
import { ensureLabCacheFresh } from "@/lib/data-access-db";
import { toggleGapReviewedAction } from "./actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const SEMESTER = "Ganjil 2026/2027";

export default async function KaprogliPage() {
  await ensureLabCacheFresh();
  const programList = getProgramKeahlian();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Skill Delta Score</h1>
          <p className="mt-1 text-muted-foreground">
            Semester {SEMESTER}. Skor makin tinggi berarti kesenjangan antara materi ajar dan
            SKKNI makin besar — bukan pengukuran mutlak, gunakan bersama penilaian lapangan.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
                <Badge variant={level as "error" | "warning" | "success"}>
                  <Gauge className="size-3" aria-hidden />
                  Skor {report.skorDelta}
                </Badge>
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

      <section className="mt-10">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Kandidat kesenjangan kompetensi</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Skill dari sumber sekunder yang belum match SKKNI — ditandai sebagai gap, bukan
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
    </main>
  );
}
