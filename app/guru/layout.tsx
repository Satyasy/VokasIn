import type { ReactNode } from "react";
import { ModulAjarDraftProvider } from "@/lib/modul-ajar-draft-context";

// Provider di sini (bukan di tiap page) supaya draft modul ajar selamat dari
// navigasi client-side antara /guru (pilih unit) dan /guru/susun/[unitId] —
// keduanya tetap di bawah layout yang sama sehingga tidak di-unmount.
export default function GuruLayout({ children }: { children: ReactNode }) {
  return <ModulAjarDraftProvider>{children}</ModulAjarDraftProvider>;
}
