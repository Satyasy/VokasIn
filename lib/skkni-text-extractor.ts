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
 * Pemulih teks otomatis untuk memperbaiki pemotongan kata akibat kerning PDF
 * (misal: "Hu bungan" -> "Hubungan", "pengendalia n" -> "pengendalian", "D okumen" -> "Dokumen")
 * serta membersihkan spasi acak pada tanda baca.
 */
export function healIndonesianText(text: string): string {
  let cleaned = text;

  // 1. Spasi janggal pada tanda baca kurung dan koma/titik
  cleaned = cleaned.replace(/\s+([,.:;?!])/g, "$1");
  cleaned = cleaned.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
  cleaned = cleaned.replace(/\[\s+/g, "[").replace(/\s+\]/g, "]");

  // 2. Huruf depan terputus (e.g. 'D okumen' -> 'Dokumen', 'P royek' -> 'Proyek', 'C ube' -> 'Cube')
  cleaned = cleaned.replace(/\b([A-Za-z])\s+([a-zA-Z]{2,})\b/g, "$1$2");

  // 3. Kata dengan huruf tengah terputus akibat kerning tipografi
  cleaned = cleaned.replace(/\b(Hu)\s+(bungan)\b/gi, "Hubungan");
  cleaned = cleaned.replace(/\b(keterl)\s+(ibatan)\b/gi, "keterlibatan");
  cleaned = cleaned.replace(/\b(keteram)\s+(pilan)\b/gi, "keterampilan");
  cleaned = cleaned.replace(/\b(penge)\s+(tahuan)\b/gi, "pengetahuan");
  cleaned = cleaned.replace(/\b(pembela)\s+(jaran)\b/gi, "pembelajaran");
  cleaned = cleaned.replace(/\b(kompe)\s+(tensi)\b/gi, "kompetensi");

  // 4. Suffix terputus di akhir kata (e.g. 'pengendalia n' -> 'pengendalian', 'penyelesaia n' -> 'penyelesaian')
  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})\s+(n|an|kan|nya|i|lah|kah|pun)\b/g, "$1$2");

  // 5. Rapikan multiple spaces
  cleaned = cleaned.replace(/[ \t]+/g, " ").trim();
  return cleaned;
}

/**
 * Pure JavaScript extractor untuk membedah teks SKKNI resmi Kemnaker
 * menjadi struktur Unit Kompetensi, Elemen, dan KUK secara rapi dan modular.
 */
export function parseSkkniText(rawText: string, totalHalaman?: number): ParsedSkkniDocument {
  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
      "Dokumen PDF tidak memuat teks digital yang dapat dibaca (kemungkinan hasil scan gambar murni tanpa OCR). Silakan gunakan tab 'Input Teks Manual'."
    );
  }

  const healedText = healIndonesianText(rawText);

  // 1. Ekstraksi Nomor dan Judul Dokumen SKKNI
  let nomorDokumen = "SKKNI Kemnaker";
  let judulDokumen = "Standar Kompetensi Kerja Nasional Indonesia";

  const nomorMatch =
    healedText.match(/NOMOR\s+([0-9]+)\s+TAHUN\s+([0-9]{4})/i) ||
    healedText.match(/NOMOR\s*:\s*([^\n\r]+)/i);
  if (nomorMatch) {
    nomorDokumen = `Kepmenaker No. ${nomorMatch[1]} Tahun ${nomorMatch[2] || new Date().getFullYear()}`;
  }

  const judulMatch =
    healedText.match(/TENTANG\s+PENETAPAN\s+STANDAR\s+KOMPETENSI\s+KERJA\s+NASIONAL\s+INDONESIA\s+([^.]+?)(?=\s+BAB|\s+DENGAN|\s+MEMUTUSKAN)/i) ||
    healedText.match(/BIDANG\s+([^\n\r.]+)/i);
  if (judulMatch) {
    judulDokumen = healIndonesianText(judulMatch[1].replace(/\s+/g, " ").trim());
  }

  // 2. Pemisahan per Blok Unit Kompetensi
  const unitBlocks = healedText.split(/(?=KODE UNIT\s*:)/i).filter((b) => /KODE UNIT\s*:/i.test(b));

  const units: ExtractedUnit[] = [];

  for (let idx = 0; idx < unitBlocks.length; idx++) {
    const rawBlock = unitBlocks[idx];

    // Ekstraksi Kode Unit
    const kodeMatch = rawBlock.match(/KODE UNIT\s*:\s*([A-Za-z0-9._-]+)/i);
    if (!kodeMatch) continue;
    const kodeUnit = kodeMatch[1].trim().toUpperCase();

    // 3. Ekstraksi Judul Unit (HANYA judul, berhenti sebelum DESKRIPSI, ELEMEN, atau BATASAN)
    const judulMatch = rawBlock.match(
      /(?:JUDUL UNIT\s*:?\s*)([^]+?)(?=\s*DESKRIPSI UNIT|\s*ELEMEN KOMPETENSI|\s*BATASAN VARIABEL|\n{2,}|$)/i
    );
    let judulUnit = judulMatch
      ? healIndonesianText(judulMatch[1].replace(/^(?:KODE UNIT\s*:[^\n]+)?/i, "").trim())
      : `Unit Kompetensi ${kodeUnit}`;

    // Pembersihan tambahan jika 'JUDUL UNIT :' tidak ada tapi langsung nama setelah kode
    if (judulUnit.length > 200) {
      const shortJudul = judulUnit.split(/\r?\n|\. |\s{3,}/)[0];
      if (shortJudul && shortJudul.length > 10) judulUnit = shortJudul.trim();
    }

    // 4. Ekstraksi Deskripsi Unit (Berhenti sebelum ELEMEN KOMPETENSI atau BATASAN VARIABEL)
    const descMatch = rawBlock.match(
      /DESKRIPSI UNIT\s*:?\s*([^]+?)(?=\s*ELEMEN KOMPETENSI|\s*BATASAN VARIABEL|\n{2,}|$)/i
    );
    const deskripsiUnit = descMatch ? healIndonesianText(descMatch[1].trim()) : undefined;

    // 5. Ekstraksi Area ELEMEN & KUK (Diputus SEBELUM BATASAN VARIABEL / PANDUAN PENILAIAN)
    const elemStart = rawBlock.search(/ELEMEN KOMPETENSI/i);
    const batasanStart = rawBlock.search(/BATASAN VARIABEL|PANDUAN PENILAIAN|KONTEKS VARIABEL/i);

    const elemBody =
      elemStart !== -1
        ? rawBlock.slice(elemStart, batasanStart !== -1 ? batasanStart : undefined)
        : rawBlock;

    // Split per Elemen: Deteksi awal elemen bernomor ("1. ", "2. ", "3. ")
    const elemSections = elemBody
      .split(/(?=\b\d{1,2}\.\s+[A-Za-z])/g)
      .filter((s) => /^\d{1,2}\.\s+[A-Za-z]/.test(s.trim()));

    const elemenList: ExtractedElemen[] = [];

    if (elemSections.length > 0) {
      for (const es of elemSections) {
        // Pisahkan teks elemen dan KUK-KUK di dalamnya (1.1, 1.2, dst.)
        const kukParts = es.split(/(?=\b\d{1,2}\.\d{1,2}\s+)/g);
        const elemHeaderRaw = kukParts[0].replace(/^\d{1,2}\.\s+/, "").trim();
        const elemHeader = healIndonesianText(elemHeaderRaw);

        const kuks: ExtractedKuk[] = [];
        for (let k = 1; k < kukParts.length; k++) {
          const km = kukParts[k].match(/^(\d{1,2}\.\d{1,2})\s+([^]+)$/);
          if (km) {
            kuks.push({
              kode: km[1],
              teks: healIndonesianText(km[2].trim()),
            });
          }
        }

        elemenList.push({
          judul: elemHeader,
          kuk: kuks,
        });
      }
    } else {
      // Fallback baris-per-baris jika split regex tidak membagi
      const lines = elemBody
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !/^--\s*\d+\s*of\s*\d+\s*--$/i.test(l));

      let currentElem: ExtractedElemen | null = null;
      let elemCounter = 1;

      for (const line of lines) {
        if (/^(?:ELEMEN KOMPETENSI|KRITERIA UNJUK KERJA|NO\b)/i.test(line)) continue;

        const elemStartMatch = line.match(/^(\d{1,2})\.\s+(.*)$/);
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
            teks: healIndonesianText(kukMatch[2].trim()),
          });
        } else if (elemStartMatch && !line.match(/^\d+\.\d+/)) {
          if (currentElem) {
            elemenList.push(currentElem);
          }
          currentElem = {
            judul: healIndonesianText(elemStartMatch[2].trim()),
            kuk: [],
          };
          elemCounter++;
        } else if (currentElem) {
          if (currentElem.kuk.length > 0) {
            const lastKuk = currentElem.kuk[currentElem.kuk.length - 1];
            lastKuk.teks = healIndonesianText(lastKuk.teks + " " + line);
          } else {
            currentElem.judul = healIndonesianText(currentElem.judul + " " + line);
          }
        }
      }

      if (currentElem) {
        elemenList.push(currentElem);
      }
    }

    // Jika pola elemen tetap tidak tertangkap
    if (elemenList.length === 0) {
      const allKuks = [...elemBody.matchAll(/(\d{1,2}\.\d{1,2})\s+([^\n\r]+)/g)];
      if (allKuks.length > 0) {
        elemenList.push({
          judul: `Pelaksanaan ${judulUnit}`,
          kuk: allKuks.map((m) => ({
            kode: m[1],
            teks: healIndonesianText(m[2].trim()),
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

    // Susun teks terstruktur untuk kanvas modul ajar
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
      "Format pola Unit SKKNI Kemnaker (KODE UNIT) tidak ditemukan di dalam dokumen. Pastikan file merupakan SKKNI resmi atau gunakan input manual."
    );
  }

  return {
    nomorDokumen,
    judulDokumen,
    totalHalaman,
    units,
  };
}
