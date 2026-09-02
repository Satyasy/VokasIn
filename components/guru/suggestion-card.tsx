"use client";

import { GripVertical, CheckCircle2, XCircle, Wrench } from "lucide-react";
import type { SaranTopik } from "@/lib/types";
import type { FeasibilityResult } from "@/lib/data-access";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SuggestionCardProps {
  topik: SaranTopik;
  feasibility: FeasibilityResult;
  kodeUnit: string;
  draftAktif?: boolean;
  onTerima: (topikId: string) => void;
  onTolakModifikasi: (topikId: string) => void;
}

// Kartu ini bisa di-drag (F4) DAN dioperasikan lewat tombol — drag-and-drop
// tidak boleh jadi satu-satunya jalur, keyboard harus tetap bisa (CLAUDE.md aksesibilitas).
export function SuggestionCard({
  topik,
  feasibility,
  kodeUnit,
  draftAktif = true,
  onTerima,
  onTolakModifikasi,
}: SuggestionCardProps) {
  return (
    <Card
      draggable={draftAktif}
      onDragStart={(e) => {
        if (!draftAktif) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", topik.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        draftAktif ? "cursor-grab active:cursor-grabbing" : "opacity-90"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{kodeUnit}</Badge>
            <Badge variant={feasibility.layak ? "success" : "warning"}>
              {feasibility.layak ? "Alat lab tersedia" : "Sebagian alat tidak tersedia"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Keyakinan pencocokan: {Math.round(topik.skorKeyakinan * 100)}%
            </span>
          </div>

          <h3 className="mt-2.5 text-base font-bold text-neutral-900 leading-snug">
            {topik.judul}
          </h3>

          {/* Box Kutipan Ekstraktif SKKNI yang Jelas & Nyaman Dibaca */}
          <div className="mt-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-800 font-medium">
            &ldquo;{topik.isiEkstraktif}&rdquo;
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-neutral-500 mr-1">Alat Praktikum:</span>
            {topik.alatDibutuhkan.map((alat) => {
              const tersedia = feasibility.tersedia.some((t) => t.label === alat.label);
              return (
                <span
                  key={alat.label}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-xs",
                    tersedia
                      ? "border-slime-lime-300 bg-slime-lime-50 text-slime-lime-950"
                      : "border-amber-300 bg-amber-50 text-amber-950"
                  )}
                >
                  <Wrench className="size-3" aria-hidden />
                  {alat.label} ({tersedia ? "Tersedia" : "Perlu Tambahan"})
                </span>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={!draftAktif}
              title={!draftAktif ? "Pilih peminatan di panel kanan terlebih dahulu" : undefined}
              onClick={() => onTerima(topik.id)}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Tambahkan ke modul ajar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onTolakModifikasi(topik.id)}>
              <XCircle className="size-4" aria-hidden />
              Tolak / modifikasi
            </Button>
            {!draftAktif && (
              <span className="text-xs text-muted-foreground">
                (Pilih peminatan dulu di panel kanan)
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
