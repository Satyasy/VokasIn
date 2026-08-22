import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Bucket kualitatif "tingkat kecocokan" — soal relevansi teks pencarian
// terhadap deskripsi kompetensi, BUKAN penilaian kemampuan orangnya (lihat
// larangan bahasa di CLAUDE.md). Dipakai oleh Asisten Kebutuhan Modul (guru)
// dan Jelajah Kompetensi (publik) — satu skala, jangan digandakan.
export type TingkatKecocokan = "Tinggi" | "Sedang" | "Rendah";

export function tingkatKecocokan(score: number, skorTertinggi: number): TingkatKecocokan {
  if (skorTertinggi <= 0) return "Rendah";
  const rasio = score / skorTertinggi;
  if (rasio >= 0.7) return "Tinggi";
  if (rasio >= 0.4) return "Sedang";
  return "Rendah";
}

export const badgeVariantByTingkatKecocokan: Record<TingkatKecocokan, "success" | "warning" | "default"> = {
  Tinggi: "success",
  Sedang: "warning",
  Rendah: "default",
};
