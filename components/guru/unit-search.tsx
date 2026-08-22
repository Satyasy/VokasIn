"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cariUnitKompetensi } from "@/app/guru/search-action";
import type { SearchHit } from "@/lib/data-access-db";

// Pelengkap navigasi berdasarkan kode unit di bawah, bukan pengganti —
// pencarian bebas ini hanya menjangkau unit yang sudah punya embedding
// (lib/embedding.ts), yaitu unit yang sudah diverifikasi manual.
export function UnitSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setResults(await cariUnitKompetensi(query));
    });
  }

  return (
    <div className="mb-8">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari unit kompetensi, mis. “jaringan WAN”, “keamanan cloud”"
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-slime-lime-700 disabled:opacity-60"
        >
          <Search className="size-4" aria-hidden />
          {isPending ? "Mencari…" : "Cari"}
        </button>
      </form>

      {results !== null && (
        <div className="mt-3 flex flex-col gap-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada unit kompetensi yang cocok.</p>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                href={`/guru/susun/${r.id}`}
                className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary"
              >
                <div>
                  <span className="font-medium text-foreground">{r.kodeUnit}</span>{" "}
                  <span className="text-muted-foreground">— {r.judulUnit}</span>
                  {r.programKeahlian && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {r.programKeahlianId === "pk-belum-ditentukan"
                        ? "Belum ditentukan kaprogli"
                        : r.programKeahlian}
                    </span>
                  )}
                </div>
                {r.snippet && <p className="mt-0.5 text-xs text-muted-foreground">…{r.snippet}…</p>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
