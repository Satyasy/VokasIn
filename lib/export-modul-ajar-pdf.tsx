import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { ModulAjarDocument } from "./export-modul-ajar";

// Generator PDF berbasis komponen React (@react-pdf/renderer) — tanpa
// Chromium/headless browser, sesuai CLAUDE.md (anti-overengineering untuk
// lingkup prototipe). Membaca SATU-SATUNYA model dokumen
// (lib/export-modul-ajar.ts), sama seperti MD/DOCX. Font/styling dasar saja
// — ini dokumen kerja guru, bukan materi pemasaran.
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  meta: { fontSize: 10, marginBottom: 2 },
  unitBlock: { marginTop: 18 },
  unitHeading: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  topikBlock: { marginTop: 10 },
  heading: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  // Kutipan KUK asli — dibedakan visual dari catatan guru lewat border kiri + italic.
  quote: { borderLeftWidth: 2, borderLeftColor: "#999999", paddingLeft: 8, marginBottom: 6, fontStyle: "italic" },
  label: { fontWeight: 700, marginTop: 6 },
  body: { marginBottom: 2 },
});

// Font standar PDF (Helvetica, tidak di-embed) tidak mendukung karakter
// tipografi non-Latin1 seperti en/em dash atau kutip pintar — hasilnya jadi
// glyph rusak. Normalisasi ke ASCII di sini saja (MD/DOCX sudah UTF-8 penuh,
// tidak perlu disentuh) — lebih murah daripada meng-embed font kustom.
function pdfSafeText(text: string): string {
  return text
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...");
}

function ModulAjarPdfDocument({ doc }: { doc: ModulAjarDocument }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{pdfSafeText(doc.judul)}</Text>
        <Text style={styles.meta}>Peminatan: {pdfSafeText(doc.programKeahlian)}</Text>
        <Text style={styles.meta}>Disusun: {doc.tanggal}</Text>

        {doc.unitList.length === 0 && (
          <Text style={[styles.body, { marginTop: 12 }]}>Belum ada unit kompetensi yang diterima ke modul ajar ini.</Text>
        )}

        {doc.unitList.map((u, ui) => (
          <View key={ui} style={styles.unitBlock}>
            <Text style={styles.unitHeading}>
              {ui + 1}. {pdfSafeText(u.judulUnit)}
            </Text>
            <Text style={styles.meta}>Unit Kompetensi: {pdfSafeText(u.kodeUnit)}</Text>
            <Text style={styles.meta}>Rujukan: {pdfSafeText(u.dokumenSkkni)}</Text>
            <Text style={styles.meta}>Sumber: {pdfSafeText(u.sumberHalaman)}</Text>

            {u.topikList.map((t, ti) => (
              <View key={ti} wrap={false} style={styles.topikBlock}>
                <Text style={styles.heading}>
                  {ui + 1}.{ti + 1} {pdfSafeText(t.judul)}
                </Text>
                <Text style={styles.quote}>{pdfSafeText(t.kukText)}</Text>
                <Text style={styles.body}>Alat yang dibutuhkan: {pdfSafeText(t.alatDibutuhkan.join(", "))}</Text>
                <Text style={styles.body}>
                  Tingkat keyakinan pencocokan sistem: {Math.round(t.skorKeyakinan * 100)}% (bukan jaminan akurasi mutlak - tinjauan guru tetap final)
                </Text>
                <Text style={styles.label}>Catatan cara mengajar (guru):</Text>
                <Text style={styles.body}>{pdfSafeText(t.catatanPedagogi || "(belum diisi)")}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function buildModulAjarPdfBlob(doc: ModulAjarDocument): Promise<Blob> {
  return pdf(<ModulAjarPdfDocument doc={doc} />).toBlob();
}
