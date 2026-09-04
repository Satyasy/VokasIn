import Link from "next/link";
import {
  AlertTriangle,
  Gauge,
  Package,
  Settings,
  CheckCircle2,
  Wrench,
  Info,
  Sparkles,
  FileText,
} from "lucide-react";
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
  ensureGuruCacheFresh,
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

export const dynamic = "force-dynamic";
const SEMESTER = "Ganjil 2026/2027";

export default async function KaprogliPage() {
  try {
    await Promise.all([
      ensureLabCacheFresh().catch((e) => console.error("ensureLabCacheFresh error:", e)),
      ensureGuruCacheFresh().catch((e) => console.error("ensureGuruCacheFresh error:", e)),
    ]);
    const session = await getSession();
    const programList = getProgramKeahlian();

    const [guruList, jadwalList, kandidatList, mapelList, allUnits] = await Promise.all([
      listAllGuru().catch((e) => {
        console.error("listAllGuru error:", e);
        return [];
      }),
      listJadwal().catch((e) => {
        console.error("listJadwal error:", e);
        return [];
      }),
      listKandidat("menunggu").catch((e) => {
        console.error("listKandidat error:", e);
        return [];
      }),
      listMataPelajaran().catch((e) => {
        console.error("listMataPelajaran error:", e);
        return [];
      }),
      listUnitKompetensi().catch((e) => {
        console.error("listUnitKompetensi error:", e);
        return [];
      }),
    ]);

    const guru = session ? getGuruById(session.guruId) : undefined;
    const currentProgramId = guru?.programKeahlianId || "pk-rpl";

  // Node 1: Skill Delta Score & Gap Kandidat (Persentase 0-100%)
  const deltaScoreNode = (
    <div className="space-y-8">
      {/* Penjelasan Formula & Transparansi Metrik */}
      <div className="rounded-xl border border-slime-lime-300 bg-slime-lime-50/50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-slime-lime-800 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm text-neutral-800">
            <h2 className="font-bold text-neutral-900">
              Dasar Perhitungan Skor Delta &amp; Indeks Keselarasan Industri (Skala 0–100%)
            </h2>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Metrik ini memadukan dua pilar kesiapan vokasi:{" "}
              <span className="font-semibold">70% Defisit Cakupan SKKNI</span> (proporsi unit standar kompetensi kerja nasional yang belum diakomodasi materi ajar) dan{" "}
              <span className="font-semibold">30% Kebutuhan Industri Aktual</span> dengan pembobotan dinamis berdasarkan tingkat urgensi gap (🔴 Kritis +10%, 🟡 Standar +6%, ⚪ Opsional +4%).
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold text-neutral-700">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-slime-lime-600 inline-block" />
                Indeks Keselarasan: 100% - Skor Delta
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                Tingkat Kesenjangan: Skor Delta (0-100%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {programList.map((program) => {
          const report = getSkillDeltaReport(program.id, SEMESTER);
          const cakupanPersen =
            report.totalUnitKompetensi === 0
              ? 0
              : Math.round((report.unitTerajarkan / report.totalUnitKompetensi) * 100);

          const statusKesenjangan =
            report.skorDelta > 35
              ? { variant: "error" as const, text: "Kesenjangan Signifikan", color: "text-red-600" }
              : report.skorDelta > 15
              ? { variant: "warning" as const, text: "Perlu Penyesuaian", color: "text-amber-600" }
              : { variant: "success" as const, text: "Sangat Selaras", color: "text-slime-lime-700" };

          return (
            <Card key={program.id} className="flex flex-col justify-between p-5 sm:p-6">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold">{program.nama}</CardTitle>
                    <CardDescription className="text-xs font-medium text-neutral-500">{program.singkatan}</CardDescription>
                  </div>
                  <Badge variant={statusKesenjangan.variant} className="font-bold shrink-0">
                    <Gauge className="size-3" aria-hidden />
                    Gap {report.skorDelta}%
                  </Badge>
                </div>

                {/* Visual Indikator Keselarasan vs Kesenjangan */}
                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-neutral-50 p-4 border border-neutral-100">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Indeks Keselarasan Industri
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-neutral-900">
                        {report.keselarasanPersen}%
                      </span>
                      <span className={cn("text-xs font-bold", statusKesenjangan.color)}>
                        {statusKesenjangan.text}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Tingkat Kesenjangan (Skill Delta): <span className="font-semibold text-neutral-800">{report.skorDelta}%</span>
                    </p>
                  </div>

                  <div className="shrink-0">
                    <CircularProgress
                      value={report.keselarasanPersen}
                      size={54}
                      strokeWidth={6}
                      label={`${report.keselarasanPersen}%`}
                      className={cn(
                        report.keselarasanPersen < 65 && "[&_circle:nth-child(2)]:text-red-500",
                        report.keselarasanPersen >= 65 && report.keselarasanPersen < 85 && "[&_circle:nth-child(2)]:text-amber-500",
                        report.keselarasanPersen >= 85 && "[&_circle:nth-child(2)]:text-slime-lime-500"
                      )}
                    />
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg border border-neutral-100 bg-white p-2.5">
                    <dt className="text-muted-foreground text-xs">Cakupan Unit SKKNI</dt>
                    <dd className="mt-0.5 font-bold text-foreground">
                      {report.unitTerajarkan} / {report.totalUnitKompetensi} Unit ({cakupanPersen}%)
                    </dd>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-white p-2.5">
                    <dt className="text-muted-foreground text-xs">Kandidat Gap Industri</dt>
                    <dd className="mt-0.5 font-bold text-foreground">
                      {report.gapKandidatCount} Kebutuhan Terdeteksi
                    </dd>
                  </div>
                </dl>

                {/* Bar Visual Tingkat Kesenjangan */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-neutral-500">
                    <span>Keselarasan ({report.keselarasanPersen}%)</span>
                    <span>Gap ({report.skorDelta}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 flex" role="presentation">
                    <div
                      className="h-full bg-slime-lime-500 transition-all duration-500"
                      style={{ width: `${report.keselarasanPersen}%` }}
                    />
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        statusKesenjangan.variant === "error" && "bg-red-500",
                        statusKesenjangan.variant === "warning" && "bg-amber-500",
                        statusKesenjangan.variant === "success" && "bg-neutral-300"
                      )}
                      style={{ width: `${report.skorDelta}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Inventaris Lab */}
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Inventaris Lab &amp; Praktikum
                  </h3>
                  <Link
                    href="/kaprogli/lab"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Settings className="size-3" aria-hidden />
                    Kelola
                  </Link>
                </div>
                {getLabForProgram(program.id).length === 0 ? (
                  <p className="text-xs text-muted-foreground">Belum ada alat terdaftar.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {getLabForProgram(program.id).map((item) => (
                      <li key={item.id} className="flex items-center gap-2 text-xs text-foreground">
                        <Package className="size-3.5 text-muted-foreground" aria-hidden />
                        {item.nama}
                        <span className="text-muted-foreground">&times;{item.jumlah}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Kandidat Kesenjangan Kompetensi */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Kandidat Kesenjangan Kompetensi Industri</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kebutuhan keahlian riil dari industri rekanan yang belum tercantum dalam rujukan SKKNI formal. 
            Ditandai dengan bobot urgensi dinamis untuk memandu pembaruan modul ajar dan jobsheet praktikum.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {programList.map((program) => {
            const gapKandidat = getGapKandidat(program.id);
            if (gapKandidat.length === 0) return null;
            return (
              <div key={program.id} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slime-lime-800">
                  {program.nama} ({program.singkatan})
                </h3>
                <div className="flex flex-col gap-3">
                  {gapKandidat.map((skill) => {
                    const urgensi = skill.tingkatUrgensi ?? "standar";
                    return (
                      <div
                        key={skill.id}
                        className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle
                              className={cn(
                                "size-4 shrink-0 mt-0.5",
                                urgensi === "kritis" && "text-red-500",
                                urgensi === "standar" && "text-amber-500",
                                urgensi === "opsional" && "text-slate-400"
                              )}
                              aria-hidden
                            />
                            <div>
                              <p className="text-sm font-bold text-foreground">{skill.namaSkill}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Sumber: <span className="text-neutral-700 font-medium">{skill.sumberSekunder}</span> &middot; Belum ada di rujukan SKKNI
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            {/* Urgency Badge */}
                            {urgensi === "kritis" && (
                              <Badge variant="error" className="font-bold">
                                🔴 Kritis (+10%)
                              </Badge>
                            )}
                            {urgensi === "standar" && (
                              <Badge variant="warning" className="font-bold">
                                🟡 Standar (+6%)
                              </Badge>
                            )}
                            {urgensi === "opsional" && (
                              <Badge variant="default" className="font-bold">
                                ⚪ Opsional (+4%)
                              </Badge>
                            )}

                            {/* Status Review Badge */}
                            {skill.sudahDitinjau ? (
                              <Badge variant="success">
                                <CheckCircle2 className="size-3" aria-hidden />
                                Sudah Ditinjau
                              </Badge>
                            ) : (
                              <Badge variant="warning">Perlu Tindak Lanjut</Badge>
                            )}
                          </div>
                        </div>

                        {/* Rekomendasi Tindak Lanjut AI */}
                        {skill.rekomendasiTindakLanjut && (
                          <div className="rounded-lg bg-slime-lime-50/70 border border-slime-lime-200 p-2.5 text-xs text-neutral-800 flex items-start gap-2">
                            <Sparkles className="size-4 text-slime-lime-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slime-lime-900">Rekomendasi Tindak Lanjut: </span>
                              <span>{skill.rekomendasiTindakLanjut}</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                          <Link href="/guru/modul">
                            <Button size="sm" variant="secondary" className="gap-1.5 text-xs font-semibold">
                              <FileText className="size-3.5" />
                              Sintesis ke Modul Praktikum
                            </Button>
                          </Link>
                          <form action={toggleGapReviewedAction.bind(null, skill.id)}>
                            <Button
                              type="submit"
                              size="sm"
                              variant={skill.sudahDitinjau ? "secondary" : "primary"}
                              className="text-xs font-semibold"
                            >
                              {skill.sudahDitinjau ? "Batalkan Tinjauan" : "Tandai Selesai Ditinjau"}
                            </Button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
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
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
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
  } catch (error: any) {
    console.error("CRITICAL ERROR in KaprogliPage:", error);
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
          <h2 className="text-xl font-bold">Terjadi Kesalahan Memuat Halaman Kaprogli</h2>
          <p className="mt-2 text-sm text-red-700">
            {error?.message || String(error)}
          </p>
        </div>
      </main>
    );
  }
}

