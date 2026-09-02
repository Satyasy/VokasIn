"use client";

import { parseSkkniText, type ParsedSkkniDocument } from "./skkni-text-extractor";

export interface ParseProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  statusText: string;
}

/**
 * Mengekstrak teks dokumen PDF langsung di browser klien menggunakan PDF.js.
 * Mempertahankan posisi koordinat Y untuk baris baru (\n) dan mendeteksi kerning
 * agar kata tidak terpotong (seperti "Hu bungan" -> "Hubungan").
 */
export async function extractPdfTextInBrowser(
  file: File,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParsedSkkniDocument> {
  const pdfjsLib = await import("pdfjs-dist");

  // Arahkan ke worker lokal yang sudah disediakan di /public
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  onProgress?.({
    currentPage: 0,
    totalPages: 100,
    percent: 5,
    statusText: "Membaca berkas ke memori browser...",
  });

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  onProgress?.({
    currentPage: 0,
    totalPages: numPages,
    percent: 10,
    statusText: `Memulai ekstraksi ${numPages} halaman dokumen...`,
  });

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    let pageString = "";
    let lastY: number | null = null;
    let lastX: number | null = null;
    let lastWidth = 0;

    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      const str = item.str;
      if (!str) continue;

      const x = item.transform[4];
      const y = item.transform[5];

      if (lastY === null) {
        pageString += str;
      } else {
        const isNewLine = Math.abs(y - lastY) > 5 || item.hasEOL;
        if (isNewLine) {
          pageString += "\n" + str;
        } else {
          // Pada baris yang sama, cek jarak horizontal
          const spaceDistance = x - (lastX! + lastWidth);
          // Hanya tambahkan spasi jika jarak nyata > 2.5px dan bukan karakter penyambung
          if (spaceDistance > 2.5 && !str.startsWith(" ") && !pageString.endsWith(" ")) {
            pageString += " " + str;
          } else {
            pageString += str;
          }
        }
      }

      lastY = y;
      lastX = x;
      lastWidth = item.width || 0;
    }

    pageTexts.push(pageString);

    const percent = Math.min(95, Math.round(10 + (pageNum / numPages) * 85));
    onProgress?.({
      currentPage: pageNum,
      totalPages: numPages,
      percent,
      statusText: `Mengekstrak Halaman ${pageNum} dari ${numPages}...`,
    });

    // Beri jeda kecil antar beberapa halaman agar UI thread browser tetap responsif
    if (pageNum % 5 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  onProgress?.({
    currentPage: numPages,
    totalPages: numPages,
    percent: 98,
    statusText: "Mengurai Kode Unit, Elemen & KUK Kemnaker...",
  });

  const fullRawText = pageTexts.join("\n\n");
  const parsedDoc = parseSkkniText(fullRawText, numPages);

  onProgress?.({
    currentPage: numPages,
    totalPages: numPages,
    percent: 100,
    statusText: "Selesai",
  });

  return parsedDoc;
}
