import type { ModulAjarDocument } from "./export-modul-ajar";

// Generator Markdown murni string templating — tanpa dependency, sesuai
// CLAUDE.md (anti-overengineering untuk lingkup prototipe). Membaca
// SATU-SATUNYA model dokumen (lib/export-modul-ajar.ts), sama seperti PDF/DOCX.
export function buildModulAjarMarkdown(doc: ModulAjarDocument): string {
  const lines: string[] = [
    `# ${doc.judul}`,
    "",
    `**Peminatan:** ${doc.programKeahlian}`,
    `**Disusun:** ${doc.tanggal}`,
    "",
  ];

  if (doc.unitList.length === 0) {
    lines.push("_Belum ada unit kompetensi yang diterima ke modul ajar ini._");
  }

  doc.unitList.forEach((u, ui) => {
    lines.push(
      `## ${ui + 1}. ${u.judulUnit}`,
      "",
      `**Unit Kompetensi:** ${u.kodeUnit}`,
      `**Rujukan:** ${u.dokumenSkkni}`,
      `**Sumber:** ${u.sumberHalaman}`,
      ""
    );

    u.topikList.forEach((t, ti) => {
      lines.push(
        `### ${ui + 1}.${ti + 1} ${t.judul}`,
        "",
        `> ${t.kukText}`,
        "",
        `**Alat yang dibutuhkan:** ${t.alatDibutuhkan.join(", ")}`,
        "",
        `_Tingkat keyakinan pencocokan sistem: ${Math.round(t.skorKeyakinan * 100)}% (bukan jaminan akurasi mutlak — tinjauan guru tetap final)_`,
        "",
        "**Catatan cara mengajar (guru):**",
        "",
        t.catatanPedagogi || "_(belum diisi)_",
        ""
      );
    });
  });

  return lines.join("\n");
}
