"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { createJadwal, updateJadwalStatus } from "@/lib/data-access-db";
import type { StatusJadwal } from "@/lib/types";

export async function updateStatusJadwalAction(
  id: string,
  status: StatusJadwal,
  catatanRefleksi?: string
) {
  const session = await getSession();
  if (!session) {
    throw new Error("Sesi login berakhir. Silakan login kembali.");
  }

  await updateJadwalStatus(id, status, catatanRefleksi);
  revalidatePath("/guru");
  revalidatePath("/kaprogli");
  revalidatePath("/admin");
  return { success: true };
}

export async function createJadwalAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await getSession();
  if (!session) {
    return { error: "Sesi login berakhir. Silakan login kembali." };
  }

  const judulMateri = String(formData.get("judulMateri") ?? "").trim();
  const kelas = String(formData.get("kelas") ?? "").trim();
  const mingguKe = Number(formData.get("mingguKe") ?? 1);
  const tanggal = String(formData.get("tanggal") ?? "").trim();
  const jamMulai = String(formData.get("jamMulai") ?? "").trim();
  const jamSelesai = String(formData.get("jamSelesai") ?? "").trim();
  const alokasiJp = Number(formData.get("alokasiJp") ?? 4);
  const unitKompetensiId = String(formData.get("unitKompetensiId") ?? "").trim();
  const catatanRefleksi = String(formData.get("catatanRefleksi") ?? "").trim();
  const formProgram = formData.get("programKeahlianId");
  const guru = getGuruById(session.guruId);
  const programKeahlianId = formProgram ? String(formProgram) : (guru?.programKeahlianId || "pk-tkj");

  if (!judulMateri || !kelas || !tanggal || !jamMulai || !jamSelesai || !alokasiJp) {
    return { error: "Semua kolom bertanda bintang (*) wajib diisi." };
  }

  try {
    await createJadwal({
      guruId: session.guruId,
      programKeahlianId,
      unitKompetensiId: unitKompetensiId || undefined,
      judulMateri,
      kelas,
      mingguKe,
      tanggal,
      jamMulai,
      jamSelesai,
      alokasiJp,
      status: "terjadwal",
      catatanRefleksi: catatanRefleksi || undefined,
    });

    revalidatePath("/guru");
    revalidatePath("/kaprogli");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Gagal menyimpan jadwal pembelajaran." };
  }
}
