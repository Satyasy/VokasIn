import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from "docx";
import type { ModulAjarDocument } from "./export-modul-ajar";

// Generator DOCX murni JavaScript (dolanmiu/docx) — tanpa headless browser,
// sesuai CLAUDE.md (anti-overengineering untuk lingkup prototipe). Membaca
// SATU-SATUNYA model dokumen (lib/export-modul-ajar.ts), sama seperti MD.
export async function buildModulAjarDocx(doc: ModulAjarDocument): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({ text: doc.judul, heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: `Peminatan: ${doc.programKeahlian}`, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: `Disusun: ${doc.tanggal}` })], spacing: { after: 200 } }),
  ];

  if (doc.unitList.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Belum ada unit kompetensi yang diterima ke modul ajar ini.", italics: true })],
      })
    );
  }

  doc.unitList.forEach((u, ui) => {
    children.push(
      new Paragraph({ text: `${ui + 1}. ${u.judulUnit}`, heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }),
      new Paragraph({ children: [new TextRun({ text: `Unit Kompetensi: ${u.kodeUnit}`, bold: true, size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: `Rujukan: ${u.dokumenSkkni}`, size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: `Sumber: ${u.sumberHalaman}`, size: 20 })], spacing: { after: 100 } })
    );

    u.topikList.forEach((t, ti) => {
      children.push(
        new Paragraph({ text: `${ui + 1}.${ti + 1} ${t.judul}`, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
        // Kutipan KUK asli — dibedakan visual dari catatan guru lewat border kiri + italic.
        new Paragraph({
          indent: { left: 360 },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: "999999" } },
          children: [new TextRun({ text: t.kukText, italics: true })],
        }),
        new Paragraph({ children: [new TextRun({ text: `Alat yang dibutuhkan: ${t.alatDibutuhkan.join(", ")}`, size: 20 })] }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Tingkat keyakinan pencocokan sistem: ${Math.round(t.skorKeyakinan * 100)}% (bukan jaminan akurasi mutlak, tinjauan guru tetap final)`,
              size: 20,
              italics: true,
            }),
          ],
        }),
        new Paragraph({ children: [new TextRun({ text: "Catatan cara mengajar (guru):", bold: true })], spacing: { before: 120 } }),
        new Paragraph({ children: [new TextRun({ text: t.catatanPedagogi || "(belum diisi)" })] })
      );
    });
  });

  const document = new Document({ sections: [{ children }] });
  return Packer.toBlob(document);
}
