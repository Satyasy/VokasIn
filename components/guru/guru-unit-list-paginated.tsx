"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import type { ProgramKeahlian, UnitKompetensi } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { ParallaxCard } from "@/components/ui/parallax-card";
import { PaginatedList } from "@/components/ui/pagination";

interface GuruUnitListPaginatedProps {
  programList: ProgramKeahlian[];
  units: (UnitKompetensi & { programSingkatan?: string })[];
}

export function GuruUnitListPaginated({
  programList,
  units,
}: GuruUnitListPaginatedProps) {
  const [selectedProgram, setSelectedProgram] = useState<string>("all");

  const filteredUnits = selectedProgram === "all"
    ? units
    : units.filter((u) => u.programKeahlianId === selectedProgram);

  return (
    <div className="space-y-6">
      {/* Program Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-3">
        <button
          type="button"
          onClick={() => setSelectedProgram("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
            selectedProgram === "all"
              ? "bg-slime-lime-500 text-neutral-950 shadow-sm"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Semua Program ({units.length})
        </button>
        {programList.map((prog) => {
          const count = units.filter((u) => u.programKeahlianId === prog.id).length;
          return (
            <button
              key={prog.id}
              type="button"
              onClick={() => setSelectedProgram(prog.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                selectedProgram === prog.id
                  ? "bg-slime-lime-500 text-neutral-950 shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              {prog.singkatan} ({count})
            </button>
          );
        })}
      </div>

      {/* Paginated List Unit SKKNI (10 Kartu per Sub-Halaman) */}
      <PaginatedList<UnitKompetensi & { programSingkatan?: string }>
        items={filteredUnits}
        itemsPerPage={10}
        searchPlaceholder="Cari kode unit SKKNI (mis. J.620100) atau kata kunci judul..."
        searchFilter={(u, q) =>
          u.kodeUnit.toLowerCase().includes(q) ||
          u.judulUnit.toLowerCase().includes(q) ||
          u.dokumenSkkni.toLowerCase().includes(q)
        }
        emptyState={
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <BookOpenText className="mx-auto size-8 text-neutral-400" />
            <p className="mt-2 text-sm font-bold text-neutral-900">
              Tidak ada unit kompetensi yang sesuai pencarian.
            </p>
          </div>
        }
        renderItem={(unit) => (
          <Link key={unit.id} href={`/guru/susun/${unit.id}`} className="group block">
            <ParallaxCard className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all group-hover:border-slime-lime-500 group-hover:shadow-md sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="brand"
                    className="rounded-lg border border-slime-lime-300 bg-slime-lime-100 font-bold text-slime-lime-900"
                  >
                    {unit.kodeUnit}
                  </Badge>
                  {unit.programSingkatan && (
                    <Badge variant="default" className="font-bold">
                      {unit.programSingkatan}
                    </Badge>
                  )}
                  <span className="text-xs text-neutral-500">{unit.dokumenSkkni}</span>
                </div>
                <CardTitle className="mt-2 text-base font-bold text-neutral-900 leading-snug">
                  {unit.judulUnit}
                </CardTitle>
              </div>

              <div className="mt-4 flex shrink-0 items-center gap-1.5 text-xs font-bold text-slime-lime-700 transition-colors group-hover:text-slime-lime-900 sm:mt-0 sm:pl-4">
                <span>Susun Modul Ajar</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </div>
            </ParallaxCard>
          </Link>
        )}
      />
    </div>
  );
}
