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
 * Memberikan progres persentase per halaman secara real-time.
 * Menghilangkan waktu tunggu unggah berkas puluhan megabyte ke server.
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
    
    // Gabungkan item string pada halaman
    const pageString = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

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
