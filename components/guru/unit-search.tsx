"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { cariUnitKompetensi } from "@/app/guru/search-action";
import type { SearchHit } from "@/lib/data-access-db";

export function UnitSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    startTransition(async () => {
      setResults(await cariUnitKompetensi(trimmed));
    });
  }

  function handleReset() {
    setQuery("");
    setResults(null);
  }

  return (
    <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <label htmlFor="unit-search-input" className="text-xs font-bold uppercase tracking-wider text-slime-lime-700">
          Pencarian Unit Cepat
        </label>
        {results !== null && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
          >
            <X className="size-3.5" aria-hidden />
            <span>Bersihkan hasil</span>
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="unit-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kata kunci unit, mis. “jaringan WAN”, “keamanan cloud”, “IoT”"
            className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-slime-lime-600 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slime-lime-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700"
              aria-label="Hapus teks pencarian"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-bold text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
        >
          <Search className="size-4" aria-hidden />
          <span>{isPending ? "Mencari…" : "Cari"}</span>
        </button>
      </form>

      {results !== null && (
        <div className="mt-4 flex flex-col gap-2.5 pt-3 border-t border-neutral-100">
          {results.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">
              Tidak ada unit kompetensi yang cocok dengan kata kunci tersebut. Coba gunakan istilah umum seperti &ldquo;jaringan&rdquo;, &ldquo;database&rdquo;, atau &ldquo;instalasi&rdquo;.
            </p>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                href={`/guru/susun/${r.id}`}
                className="group flex flex-col gap-1 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 text-sm transition-all hover:border-slime-lime-500 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slime-lime-900">{r.kodeUnit}</span>
                    <span className="font-semibold text-neutral-900">: {r.judulUnit}</span>
                  </div>
                  <ArrowRight className="size-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-slime-lime-700" aria-hidden />
                </div>
                {r.programKeahlian && (
                  <span className="text-xs font-semibold text-neutral-500">
                    Program: {r.programKeahlianId === "pk-belum-ditentukan" ? "Belum ditentukan kaprogli" : r.programKeahlian}
                  </span>
                )}
                {r.snippet && <p className="mt-1 text-xs text-neutral-600 leading-relaxed italic bg-white/80 p-2 rounded-lg border border-neutral-100">…{r.snippet}…</p>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
