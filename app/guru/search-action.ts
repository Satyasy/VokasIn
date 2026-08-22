"use server";

import { searchUnitKompetensiHybrid, type SearchHit } from "@/lib/data-access-db";

// Runtime Node.js standar (bukan edge) — tidak ada `export const runtime` di
// file ini atau di app/guru/*, jadi Next.js pakai default Node.js. WAJIB:
// model embedding (lib/embedding.ts) tidak proporsional dijalankan di edge.
export async function cariUnitKompetensi(query: string, limit = 10): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return searchUnitKompetensiHybrid(trimmed, limit);
}
