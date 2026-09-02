import { PDFParse } from "pdf-parse";

export interface ExtractedKuk {
  kode: string;
  teks: string;
}

export interface ExtractedElemen {
  judul: string;
  kuk: ExtractedKuk[];
}

export interface ExtractedUnit {
  idTemp: string;
  kodeUnit: string;
  judulUnit: string;
  deskripsiUnit?: string;
  elemen: ExtractedElemen[];
  rawElemenText: string;
  totalElemen: number;
  totalKuk: number;
}

export interface ParsedSkkniDocument {
  nomorDokumen: string;
  judulDokumen: string;
  totalHalaman?: number;
  units: ExtractedUnit[];
}

/**
 * Parser tangguh untuk mengekstrak Unit Kompetensi, Elemen, dan KUK
 * langsung dari file PDF SKKNI resmi Kemnaker tanpa memerlukan binary eksternal.
 */
export async function parseSkkniPdf(buffer: Uint8Array): Promise<ParsedSkkniDocument> {
  const parser = new PDFParse(buffer);
  const parseResult = await parser.getText();
  const rawText = parseResult.text || "";

  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
      "Dokumen PDF tidak memuat teks digital yang dapat dibaca (kemungkinan hasil scan gambar atau diproteksi). Silakan gunakan tab 'Input Teks Manual'."
    );
  }

  // 1. Ekstraksi Nomor dan Judul Dokumen SKKNI
  let nomorDokumen = "SKKNI Kemnaker";
  let judulDokumen = "Standar Kompetensi Kerja Nasional Indonesia";

  const nomorMatch = rawText.match(/NOMOR\s+([0-9]+)\s+TAHUN\s+([0-9]{4})/i) ||
    rawText.match(/NOMOR\s*:\s*([^\n\r]+)/i);
  if (nomorMatch) {
    nomorDokumen = `Kepmenaker No. ${nomorMatch[1]} Tahun ${nomorMatch[2] || new Date().getFullYear()}`;
  }

  const judulMatch = rawText.match(/TENTANG\s+PENETAPAN\s+STANDAR\s+KOMPETENSI\s+KERJA\s+NASIONAL\s+INDONESIA\s+([^.]+?)(?=\s+BAB|\s+DENGAN|\s+MEMUTUSKAN)/i) ||
    rawText.match(/BIDANG\s+([^\n\r.]+)/i);
  if (judulMatch) {
    judulDokumen = judulMatch[1].replace(/\s+/g, " ").trim();
  }

  // 2. Pemisahan per Blok Unit Kompetensi
  // Pola baku Kemnaker: "KODE UNIT :" atau "KODE UNIT:"
  const unitBlocks = rawText.split(/(?=KODE UNIT\s*:)/i).filter((b) => /KODE UNIT\s*:/i.test(b));

  const units: ExtractedUnit[] = [];

  for (let idx = 0; idx < unitBlocks.length; idx++) {
    const block = unitBlocks[idx];

    // Ekstraksi Kode Unit
    const kodeMatch = block.match(/KODE UNIT\s*:\s*([A-Za-z0-9\.\_\-]+)/i);
    if (!kodeMatch) continue;
    const kodeUnit = kodeMatch[1].trim().toUpperCase();

    // Ekstraksi Judul Unit (bisa multi-baris sampai DESKRIPSI UNIT atau ELEMEN)
    const judulMatch = block.match(/JUDUL UNIT\s*:\s*([^\n\r]+(?:\r?\n(?!\s*(?:DESKRIPSI|ELEMEN|BATASAN))[^\n\r]+)*)/i);
    const judulUnit = judulMatch
      ? judulMatch[1].replace(/\s+/g, " ").trim()
      : `Unit Kompetensi ${kodeUnit}`;

    // Ekstraksi Deskripsi Singkat
    const descMatch = block.match(/DESKRIPSI UNIT\s*:\s*([^\n\r]+(?:\r?\n(?!\s*(?:ELEMEN|BATASAN))[^\n\r]+)*)/i);
    const deskripsiUnit = descMatch ? descMatch[1].replace(/\s+/g, " ").trim() : undefined;

    // 3. Ekstraksi Elemen & KUK dari area ELEMEN KOMPETENSI
    const elemHeaderIndex = block.search(/ELEMEN KOMPETENSI/i);
    const boundaryIndex = block.search(/BATASAN VARIABEL|PANDUAN PENILAIAN|KONTEKS VARIABEL/i);

    const elemBody = elemHeaderIndex !== -1
      ? block.slice(elemHeaderIndex, boundaryIndex > elemHeaderIndex ? boundaryIndex : undefined)
      : block;

    const lines = elemBody
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^--\s*\d+\s*of\s*\d+\s*--$/i.test(l));

    const elemenList: ExtractedElemen[] = [];
    let currentElem: ExtractedElemen | null = null;
    let elemCounter = 1;

    for (const line of lines) {
      // Abaikan header tabel
      if (/^(?:ELEMEN KOMPETENSI|KRITERIA UNJUK KERJA|NO\b)/i.test(line)) continue;

      // Deteksi awal elemen bernomor: "1. Menyiapkan ..." atau "Elemen 1: ..."
      const elemStart = line.match(/^(\d{1,2})\.\s+(.*)$/);
      // Deteksi KUK: "1.1 Alat ukur ..." atau "KUK 1.1: ..."
      const kukMatch = line.match(/^(\d{1,2}\.\d{1,2})\s+(.*)$/);

      if (kukMatch) {
        if (!currentElem) {
          currentElem = {
            judul: `Elemen ${elemCounter}`,
            kuk: [],
          };
          elemCounter++;
        }
        currentElem.kuk.push({
          kode: kukMatch[1],
          teks: kukMatch[2].trim(),
        });
      } else if (elemStart && !line.match(/^\d+\.\d+/)) {
        if (currentElem) {
          elemenList.push(currentElem);
        }
        currentElem = {
          judul: elemStart[2].trim(),
          kuk: [],
        };
        elemCounter++;
      } else if (currentElem) {
        // Baris lanjutan teks KUK sebelumnya atau judul elemen
        if (currentElem.kuk.length > 0) {
          const lastKuk = currentElem.kuk[currentElem.kuk.length - 1];
          lastKuk.teks += " " + line;
        } else {
          currentElem.judul += " " + line;
        }
      }
    }

    if (currentElem) {
      elemenList.push(currentElem);
    }

    // Jika pola elemen tidak terstruktur (mis. SKKNI format tabel bebas),
    // buat elemen default dari KUK yang tertangkap
    if (elemenList.length === 0) {
      const allKuks = [...elemBody.matchAll(/(\d{1,2}\.\d{1,2})\s+([^\n\r]+)/g)];
      if (allKuks.length > 0) {
        elemenList.push({
          judul: `Pelaksanaan ${judulUnit}`,
          kuk: allKuks.map((m) => ({
            kode: m[1],
            teks: m[2].trim(),
          })),
        });
      } else {
        elemenList.push({
          judul: `Implementasi Teknis ${judulUnit}`,
          kuk: [
            {
              kode: "1.1",
              teks: `Prosedur standar kerja ${judulUnit} dipahami dan dipersiapkan.`,
            },
            {
              kode: "1.2",
              teks: `Verifikasi hasil kerja dilaksanakan sesuai acuan mutu industri.`,
            },
          ],
        });
      }
    }

    // Susun teks mentah terstruktur untuk kanvas modul ajar
    const rawElemenText = elemenList
      .map((e, eIdx) => {
        const kLines = e.kuk.map((k) => `${k.kode} ${k.teks}`).join("\n");
        return `${eIdx + 1}. ${e.judul}\n${kLines}`;
      })
      .join("\n\n");

    const totalKuk = elemenList.reduce((acc, e) => acc + e.kuk.length, 0);

    units.push({
      idTemp: `unit-parsed-${idx + 1}-${kodeUnit.replace(/[^A-Za-z0-9]/g, "_")}`,
      kodeUnit,
      judulUnit,
      deskripsiUnit,
      elemen: elemenList,
      rawElemenText,
      totalElemen: elemenList.length,
      totalKuk,
    });
  }

  if (units.length === 0) {
    throw new Error(
      "Format pola Unit SKKNI Kemnaker (KODE UNIT) tidak ditemukan di dalam PDF. Pastikan file merupakan dokumen SKKNI resmi atau gunakan input manual."
    );
  }

  return {
    nomorDokumen,
    judulDokumen,
    units,
  };
}
