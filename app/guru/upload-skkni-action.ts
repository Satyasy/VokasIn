"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { processSkkniMandiri } from "@/lib/skkni-etl";

export interface UploadSkkniMandiriResponse {
  success: boolean;
  error?: string;
  unitId?: string;
  kodeUnit?: string;
  judulUnit?: string;
  totalElemen?: number;
}

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
