import type { SaranTopik, UnitKompetensi } from "./types";

// Ekspor sebagai Markdown polos: bisa dibuka ulang tanpa akun/aplikasi khusus
// (PRD.md #16 — dokumen tidak boleh disandera platform). File di-generate
// sepenuhnya di browser lewat Blob API, tidak perlu pustaka PDF.
export function buildModulAjarMarkdown(unit: UnitKompetensi, topikDiterima: SaranTopik[]): string {
  const tanggal = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const bagianTopik = topikDiterima
    .map(
      (t, i) => `### ${i + 1}. ${t.judul}

${t.isiEkstraktif}

**Alat yang dibutuhkan:** ${t.alatDibutuhkan.map((a) => a.label).join(", ")}
**Tingkat keyakinan pencocokan sistem:** ${Math.round(t.skorKeyakinan * 100)}% (bukan jaminan akurasi mutlak — tinjauan guru tetap final)
`
    )
    .join("\n");

  return `# Modul Ajar — ${unit.judulUnit}

**Unit Kompetensi:** ${unit.kodeUnit}
**Rujukan:** ${unit.dokumenSkkni}
**Disusun:** ${tanggal}

---

${bagianTopik || "_Belum ada topik yang diterima ke modul ajar ini._"}
`;
}

export function downloadModulAjar(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
