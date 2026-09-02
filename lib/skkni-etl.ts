import crypto from "crypto";
import type { UnitKompetensi, ElemenKompetensi, SaranTopik, KategoriAlat } from "./types";
import { pool } from "./db";
import { registerCustomUnit } from "./data-access";

export interface SkkniUploadInput {
  nomorDokumen: string;
  kodeUnit: string;
  judulUnit: string;
  programKeahlianId: string;
  sumberRef?: string;
  elemenRawText: string;
  uploaderId: string;
  uploaderRole: string;
}

export interface EtlResult {
  unitId: string;
  kandidatId: string;
  kodeUnit: string;
  judulUnit: string;
  totalElemen: number;
  totalTopik: number;
}

export async function processSkkniMandiri(input: SkkniUploadInput): Promise<EtlResult> {
  const unitId = `uk-custom-${crypto.randomUUID().slice(0, 8)}`;
  const dokumenId = `doc-${crypto.randomUUID().slice(0, 8)}`;
  const kandidatId = `kd-${crypto.randomUUID().slice(0, 8)}`;

  // 1. Parse Elemen & Kriteria Unjuk Kerja dari raw text
  const lines = input.elemenRawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const elemenList: ElemenKompetensi[] = [];
  let currentElemen: ElemenKompetensi | null = null;
  let elemCounter = 1;

  for (const line of lines) {
    // Pola Elemen: "1. Menyiapkan ..." atau "Elemen 1: ..."
    const elemMatch = line.match(/^(?:elemen\s*)?(\d+)[\.\:]\s*(.+)$/i);
    // Pola KUK: "1.1 Alat ukur ..." atau "KUK 1.1: ..."
    const kukMatch = line.match(/^(\d+\.\d+)[\.\:]\s*(.+)$/);

    if (kukMatch && currentElemen) {
      currentElemen.kriteriaUnjukKerja.push({
        id: `kuk-${crypto.randomUUID().slice(0, 8)}`,
        kode: kukMatch[1],
        teks: kukMatch[2].trim(),
      });
    } else if (elemMatch && !line.match(/^\d+\.\d+/)) {
      if (currentElemen) {
        elemenList.push(currentElemen);
      }
      currentElemen = {
        id: `ek-${crypto.randomUUID().slice(0, 8)}`,
        judul: elemMatch[2].trim(),
        kriteriaUnjukKerja: [],
      };
    } else if (currentElemen) {
      // Baris lanjutan teks KUK atau penjelasan elemen
      const kIndex = currentElemen.kriteriaUnjukKerja.length + 1;
      currentElemen.kriteriaUnjukKerja.push({
        id: `kuk-${crypto.randomUUID().slice(0, 8)}`,
        kode: `${elemCounter}.${kIndex}`,
        teks: line,
      });
    } else {
      // Elemen default awal jika belum ada header bernomor
      currentElemen = {
        id: `ek-${crypto.randomUUID().slice(0, 8)}`,
        judul: line,
        kriteriaUnjukKerja: [],
      };
      elemCounter++;
    }
  }

  if (currentElemen) {
    elemenList.push(currentElemen);
  }

  // Jika parser tidak menemukan elemen eksplisit, buat 1 elemen default dari judul
  if (elemenList.length === 0) {
    elemenList.push({
      id: `ek-${crypto.randomUUID().slice(0, 8)}`,
      judul: `Implementasi Teknis ${input.judulUnit}`,
      kriteriaUnjukKerja: [
        {
          id: `kuk-${crypto.randomUUID().slice(0, 8)}`,
          kode: "1.1",
          teks: `Prosedur operasional ${input.judulUnit} dipelajari dan dipersiapkan.`,
        },
        {
          id: `kuk-${crypto.randomUUID().slice(0, 8)}`,
          kode: "1.2",
          teks: `Pengujian dan verifikasi hasil kerja dilakukan sesuai standar teknis industri.`,
        },
      ],
    });
  }

  // 2. Susun objek UnitKompetensi
  const customUnit: UnitKompetensi = {
    id: unitId,
    kodeUnit: input.kodeUnit.trim().toUpperCase(),
    judulUnit: input.judulUnit.trim(),
    dokumenSkkni: input.nomorDokumen.trim(),
    sumber: `${input.nomorDokumen} (Diunggah Mandiri oleh Guru)`,
    programKeahlianId: input.programKeahlianId,
    elemenKompetensi: elemenList,
  };

  // 3. Sintesis SaranTopik Praktikum untuk modul ajar
  const saranList: SaranTopik[] = elemenList.map((elem, idx) => {
    // Inferensi alat lab dasar berdasarkan jurusan
    const kategori: KategoriAlat =
      input.programKeahlianId === "pk-tkj"
        ? "perangkat-jaringan"
        : input.programKeahlianId === "pk-rpl"
        ? "perangkat-lunak"
        : "komputer-kerja";

    const labelAlat =
      input.programKeahlianId === "pk-tkj"
        ? "Router & Switch Jaringan"
        : input.programKeahlianId === "pk-rpl"
        ? "IDE Pemrograman & Git CLI"
        : "Komputer PC Standar";

    return {
      id: `saran-${crypto.randomUUID().slice(0, 8)}`,
      unitKompetensiId: unitId,
      elemenKompetensiId: elem.id,
      judul: `Praktikum: ${elem.judul}`,
      isiEkstraktif:
        elem.kriteriaUnjukKerja.map((k) => `${k.kode} ${k.teks}`).join("; ") ||
        `Praktikum mandiri dan verifikasi kecakapan ${elem.judul}`,
      alatDibutuhkan: [{ kategori, label: labelAlat }],
      skorKeyakinan: 0.95,
      catatanPedagogi: "",
    };
  });

  // 4. Daftarkan langsung ke in-memory untuk penggunaan seketika oleh Guru (Instant Personal Use)
  registerCustomUnit(customUnit, saranList);

  // 5. Semantic Classification: Gabungkan teks untuk embedding
  const corpusText = [
    input.judulUnit,
    ...elemenList.flatMap(e => [e.judul, ...e.kriteriaUnjukKerja.map(k => k.teks)])
  ].join(" ");
  
  // Karena next.js edge func dan ts-node runtime bisa beda, jalankan dinamis.
  let vectorLiteral = "null";
  let maxSimilarity = 0;
  let saranProgramKeahlianId = null;

  try {
    const { embedPassage, toVectorLiteral } = await import("./embedding");
    const vector = await embedPassage(corpusText);
    vectorLiteral = toVectorLiteral(vector);

    const anchorRes = await pool.query(
      `
      SELECT 
        program_keahlian_id, 
        1 - (embedding <=> $1::vector) as similarity
      FROM jurusan_anchor_text
      ORDER BY similarity DESC
      LIMIT 1
      `,
      [vectorLiteral]
    );

    if (anchorRes.rows.length > 0) {
      maxSimilarity = anchorRes.rows[0].similarity;
      // Gunakan threshold 0.75
      if (maxSimilarity >= 0.75) {
        saranProgramKeahlianId = anchorRes.rows[0].program_keahlian_id;
      }
    }
  } catch (err) {
    console.error("Gagal melakukan semantic classification:", err);
  }

  // 6. Simpan ke database Postgres sebagai Kandidat Menunggu Verifikasi Kaprogli/Admin
  try {
    await pool.query(
      `INSERT INTO dokumen_skkni (id, nomor, nama_file, diupload_pada, diupload_oleh)
       VALUES ($1, $2, $3, now(), $4)
       ON CONFLICT (id) DO NOTHING`,
      [dokumenId, input.nomorDokumen, `${input.kodeUnit}.pdf`, input.uploaderId]
    );

    const kandidatElemen = elemenList.map((e) => ({
      judul: e.judul,
      kriteriaUnjukKerja: e.kriteriaUnjukKerja.map((k) => ({ kode: k.kode, teks: k.teks })),
    }));

    await pool.query(
      `INSERT INTO unit_kompetensi_kandidat
         (id, dokumen_skkni_id, kode_unit, judul_unit, sumber, program_keahlian_id, teks_mentah, elemen_kompetensi, parsing_uncertain, catatan, status, embedding, skor_ai, saran_program_keahlian_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'menunggu', $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        kandidatId,
        dokumenId,
        customUnit.kodeUnit,
        customUnit.judulUnit,
        customUnit.sumber,
        customUnit.programKeahlianId,
        input.elemenRawText,
        JSON.stringify(kandidatElemen),
        false,
        `Diunggah mandiri oleh ${input.uploaderRole} (${input.uploaderId}) untuk modul ajar spesifik`,
        vectorLiteral !== "null" ? vectorLiteral : null,
        maxSimilarity,
        saranProgramKeahlianId
      ]
    );
  } catch (err) {
    console.error("Gagal mencatat kandidat ke Postgres (fallback in-memory tetap aktif):", err);
  }

  return {
    unitId,
    kandidatId,
    kodeUnit: customUnit.kodeUnit,
    judulUnit: customUnit.judulUnit,
    totalElemen: elemenList.length,
    totalTopik: saranList.length,
  };
}
