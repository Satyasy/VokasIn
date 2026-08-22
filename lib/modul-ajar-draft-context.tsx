"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { SaranTopik, UnitKompetensi } from "./types";

// Draft modul ajar = keranjang persisten selama sesi guru bekerja (ARCHITECTURE.md
// §2: ModulAjarDraft 1-ke-banyak SaranTopik), TERLEPAS dari unit kompetensi mana
// guru sedang buka. Context ini dipasang satu kali di app/guru/layout.tsx supaya
// state-nya selamat dari navigasi antar /guru/susun/[unitId] (bukan di-scope per
// halaman seperti sebelumnya).
export interface DraftUnitGroup {
  unit: UnitKompetensi;
  topikDiterima: SaranTopik[];
}

interface ModulAjarDraftState {
  programKeahlianId: string | null;
  unitGroups: DraftUnitGroup[];
}

interface ModulAjarDraftContextValue extends ModulAjarDraftState {
  mulaiDraftBaru: (programKeahlianId: string) => void;
  resetDraft: () => void;
  tambahKeDraft: (unit: UnitKompetensi, topik: SaranTopik) => void;
  hapusDariDraft: (unitId: string, topikId: string) => void;
  ubahCatatanPedagogi: (topikId: string, catatan: string) => void;
  jumlahKartu: number;
}

const ModulAjarDraftContext = createContext<ModulAjarDraftContextValue | null>(null);

const DRAFT_KOSONG: ModulAjarDraftState = { programKeahlianId: null, unitGroups: [] };

export function ModulAjarDraftProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModulAjarDraftState>(DRAFT_KOSONG);

  const mulaiDraftBaru = useCallback((programKeahlianId: string) => {
    setState({ programKeahlianId, unitGroups: [] });
  }, []);

  const resetDraft = useCallback(() => setState(DRAFT_KOSONG), []);

  const tambahKeDraft = useCallback((unit: UnitKompetensi, topik: SaranTopik) => {
    setState((prev) => {
      const idx = prev.unitGroups.findIndex((g) => g.unit.id === unit.id);
      if (idx === -1) {
        return { ...prev, unitGroups: [...prev.unitGroups, { unit, topikDiterima: [topik] }] };
      }
      const unitGroups = prev.unitGroups.map((g, i) =>
        i === idx ? { ...g, topikDiterima: [...g.topikDiterima, topik] } : g
      );
      return { ...prev, unitGroups };
    });
  }, []);

  // Tinjau Akhir (halaman /guru/tinjau) — guru bisa mencoret satu kartu yang
  // ternyata tidak jadi dipakai tanpa kembali ke kanvas kerja. Grup unit yang
  // jadi kosong ikut dibuang supaya tidak muncul heading unit tanpa kartu.
  const hapusDariDraft = useCallback((unitId: string, topikId: string) => {
    setState((prev) => ({
      ...prev,
      unitGroups: prev.unitGroups
        .map((g) => (g.unit.id === unitId ? { ...g, topikDiterima: g.topikDiterima.filter((t) => t.id !== topikId) } : g))
        .filter((g) => g.topikDiterima.length > 0),
    }));
  }, []);

  const ubahCatatanPedagogi = useCallback((topikId: string, catatan: string) => {
    setState((prev) => ({
      ...prev,
      unitGroups: prev.unitGroups.map((g) => ({
        ...g,
        topikDiterima: g.topikDiterima.map((t) => (t.id === topikId ? { ...t, catatanPedagogi: catatan } : t)),
      })),
    }));
  }, []);

  const jumlahKartu = useMemo(
    () => state.unitGroups.reduce((n, g) => n + g.topikDiterima.length, 0),
    [state.unitGroups]
  );

  const value = useMemo(
    () => ({ ...state, mulaiDraftBaru, resetDraft, tambahKeDraft, hapusDariDraft, ubahCatatanPedagogi, jumlahKartu }),
    [state, mulaiDraftBaru, resetDraft, tambahKeDraft, hapusDariDraft, ubahCatatanPedagogi, jumlahKartu]
  );

  return <ModulAjarDraftContext.Provider value={value}>{children}</ModulAjarDraftContext.Provider>;
}

export function useModulAjarDraft(): ModulAjarDraftContextValue {
  const ctx = useContext(ModulAjarDraftContext);
  if (!ctx) throw new Error("useModulAjarDraft dipanggil di luar ModulAjarDraftProvider");
  return ctx;
}
