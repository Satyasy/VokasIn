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
const SESSION_STORAGE_KEY = "vokasin-modul-ajar-draft";

function getInitialState(): ModulAjarDraftState {
  if (typeof window === "undefined") return DRAFT_KOSONG;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return DRAFT_KOSONG;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.unitGroups)) {
      return parsed as ModulAjarDraftState;
    }
  } catch {
    // fallback ke DRAFT_KOSONG jika parse gagal
  }
  return DRAFT_KOSONG;
}

export function ModulAjarDraftProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModulAjarDraftState>(getInitialState);

  const mulaiDraftBaru = useCallback((programKeahlianId: string) => {
    setState((prev) => {
      const next = { programKeahlianId, unitGroups: prev.programKeahlianId === programKeahlianId ? prev.unitGroups : [] };
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const resetDraft = useCallback(() => {
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
    setState(DRAFT_KOSONG);
  }, []);

  const tambahKeDraft = useCallback((unit: UnitKompetensi, topik: SaranTopik) => {
    setState((prev) => {
      const idx = prev.unitGroups.findIndex((g) => g.unit.id === unit.id);
      let unitGroups: DraftUnitGroup[];
      if (idx === -1) {
        unitGroups = [...prev.unitGroups, { unit, topikDiterima: [topik] }];
      } else {
        unitGroups = prev.unitGroups.map((g, i) =>
          i === idx ? { ...g, topikDiterima: [...g.topikDiterima, topik] } : g
        );
      }
      const next = { ...prev, unitGroups };
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Tinjau Akhir (halaman /guru/tinjau) — guru bisa mencoret satu kartu yang
  // ternyata tidak jadi dipakai tanpa kembali ke kanvas kerja. Grup unit yang
  // jadi kosong ikut dibuang supaya tidak muncul heading unit tanpa kartu.
  const hapusDariDraft = useCallback((unitId: string, topikId: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        unitGroups: prev.unitGroups
          .map((g) => (g.unit.id === unitId ? { ...g, topikDiterima: g.topikDiterima.filter((t) => t.id !== topikId) } : g))
          .filter((g) => g.topikDiterima.length > 0),
      };
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const ubahCatatanPedagogi = useCallback((topikId: string, catatan: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        unitGroups: prev.unitGroups.map((g) => ({
          ...g,
          topikDiterima: g.topikDiterima.map((t) => (t.id === topikId ? { ...t, catatanPedagogi: catatan } : t)),
        })),
      };
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
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
