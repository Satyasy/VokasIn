"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { processSkkniMandiri } from "@/lib/skkni-etl";
import { parseSkkniPdf, type ExtractedUnit, type ParsedSkkniDocument } from "@/lib/skkni-pdf-parser";

export interface UploadSkkniMandiriResponse {
  success: boolean;
  error?: string;
  unitId?: string;
  kodeUnit?: string;
  judulUnit?: string;
  totalElemen?: number;
}

export interface ParsePdfResponse {
  success: boolean;
  error?: string;
  document?: ParsedSkkniDocument;
}

export interface ImportBatchResponse {
  success: boolean;
  error?: string;
  importedCount?: number;
  units?: { id: string; kodeUnit: string; judulUnit: string }[];
}

/**
 * Server Action: Ekstraksi otomatis seluruh Unit Kompetensi dari file PDF SKKNI Kemnaker.
 */
export async function parseSkkniPdfAction(formData: FormData): Promise<ParsePdfResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const file = formData.get("pdfFile") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Pilih atau letakkan file PDF SKKNI terlebih dahulu." };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { success: false, error: "File harus berformat PDF (.pdf)." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parsed = await parseSkkniPdf(new Uint8Array(arrayBuffer));

    return {
      success: true,
      document: parsed,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengekstrak struktur PDF SKKNI.",
    };
  }
}

/**
 * Server Action: Mengimpor unit-unit pilihan guru/kaprogli hasil ekstraksi PDF.
 */
export async function importSelectedSkkniUnitsAction(payload: {
  nomorDokumen: string;
  programKeahlianId: string;
  selectedUnits: {
    kodeUnit: string;
    judulUnit: string;
    rawElemenText: string;
  }[];
}): Promise<ImportBatchResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }

  if (!payload.nomorDokumen.trim()) {
    return { success: false, error: "Nomor SKKNI rujukan wajib terisi." };
  }

  if (!payload.selectedUnits || payload.selectedUnits.length === 0) {
    return { success: false, error: "Pilih setidaknya 1 unit kompetensi untuk diimpor." };
  }

  try {
    const importedUnits: { id: string; kodeUnit: string; judulUnit: string }[] = [];

    for (const unit of payload.selectedUnits) {
      const res = await processSkkniMandiri({
        nomorDokumen: payload.nomorDokumen.trim(),
        kodeUnit: unit.kodeUnit.trim(),
        judulUnit: unit.judulUnit.trim(),
        programKeahlianId: payload.programKeahlianId,
        elemenRawText: unit.rawElemenText,
        uploaderId: session.guruId,
        uploaderRole: session.role,
      });

      importedUnits.push({
        id: res.unitId,
        kodeUnit: res.kodeUnit,
        judulUnit: res.judulUnit,
      });
    }

    revalidatePath("/guru");
    revalidatePath("/kaprogli");
    revalidatePath("/admin/skkni/kandidat");
    revalidatePath("/admin");

    return {
      success: true,
      importedCount: importedUnits.length,
      units: importedUnits,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memproses pendaftaran unit kompetensi.",
    };
  }
}

/**
 * Server Action: Input manual potongan teks SKKNI (Cadangan).
 */
export async function uploadSkkniMandiriAction(
  _prevState: UploadSkkniMandiriResponse | null,
  formData: FormData
): Promise<UploadSkkniMandiriResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sesi tidak sah. Silakan login kembali." };
  }

  const nomorDokumen = String(formData.get("nomorDokumen") ?? "").trim();
  const kodeUnit = String(formData.get("kodeUnit") ?? "").trim();
  const judulUnit = String(formData.get("judulUnit") ?? "").trim();
  const programKeahlianId = String(formData.get("programKeahlianId") ?? "").trim();
  const elemenRawText = String(formData.get("elemenRawText") ?? "").trim();

  if (!nomorDokumen) return { success: false, error: "Nomor SKKNI atau rujukan kurikulum wajib diisi." };
  if (!kodeUnit) return { success: false, error: "Kode Unit SKKNI wajib diisi (mis. J.620100.010.02)." };
  if (!judulUnit) return { success: false, error: "Judul Unit Kompetensi wajib diisi." };
  if (!programKeahlianId) return { success: false, error: "Pilih Program Keahlian terlebih dahulu." };
  if (!elemenRawText) return { success: false, error: "Tempelkan teks Elemen Kompetensi dan KUK." };

  try {
    const result = await processSkkniMandiri({
      nomorDokumen,
      kodeUnit,
      judulUnit,
      programKeahlianId,
      elemenRawText,
      uploaderId: session.guruId,
      uploaderRole: session.role,
    });

    revalidatePath("/guru");
    revalidatePath("/kaprogli");
    revalidatePath("/admin/skkni/kandidat");
    revalidatePath("/admin");

    return {
      success: true,
      unitId: result.unitId,
      kodeUnit: result.kodeUnit,
      judulUnit: result.judulUnit,
      totalElemen: result.totalElemen,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat memproses ekstraksi ETL SKKNI.",
    };
  }
}
