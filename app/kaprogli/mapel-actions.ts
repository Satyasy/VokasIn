"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  syncMapelWithUnits,
  createMataPelajaran,
  saveBahanAjarMapel,
  searchUnitKompetensiHybrid,
  type SearchHit,
  type MataPelajaranWithDetails,
} from "@/lib/data-access-db";
import type { TingkatKelas, BahanAjarMapel } from "@/lib/types";

export async function getSuggestedUnitsRrfAction(query: string, limit = 5): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  try {
    return await searchUnitKompetensiHybrid(trimmed, limit);
  } catch (err) {
    console.error("Gagal mendapatkan saran unit RRF:", err);
    return [];
  }
}

export async function syncMapelAction(mapelId: string, unitIds: string[]) {
  const session = await getSession();
  if (!session || (session.role !== "kaprogli" && session.role !== "admin")) {
    return { success: false, error: "Akses ditolak. Hanya Kaprogli/Admin yang dapat menyinkronkan SKKNI." };
  }

  try {
    const res = await syncMapelWithUnits(mapelId, unitIds);
    revalidatePath("/kaprogli");
    revalidatePath("/guru/bahan-ajar");
    return { success: true, count: res.syncedCount };
  } catch (err) {
    console.error("Gagal sinkronisasi mapel:", err);
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan database." };
  }
}

export async function createMapelAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "kaprogli" && session.role !== "admin")) {
    return { success: false, error: "Akses ditolak. Hanya Kaprogli/Admin yang dapat membuat mata pelajaran." };
  }

  const programKeahlianId = (formData.get("programKeahlianId") as string) || "pk-rpl";
  const namaMapel = (formData.get("namaMapel") as string)?.trim();
  const kodeMapel = (formData.get("kodeMapel") as string)?.trim();
  const tingkatKelas = (formData.get("tingkatKelas") as TingkatKelas) || "X";
  const semester = Number(formData.get("semester") || 1);
  const alokasiJpMingguan = Number(formData.get("alokasiJpMingguan") || 4);
  const passingGradeMinimum = Number(formData.get("passingGradeMinimum") || 80.0);
  const rujukanWsos = (formData.get("rujukanWsos") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim();

  if (!namaMapel) {
    return { success: false, error: "Nama mata pelajaran wajib diisi." };
  }

  try {
    const mapel = await createMataPelajaran({
      programKeahlianId,
      namaMapel,
      kodeMapel: kodeMapel || undefined,
      tingkatKelas,
      semester,
      alokasiJpMingguan,
      passingGradeMinimum,
      bobotTeori: 20,
      bobotPraktikMingguan: 40,
      bobotPraktikKelompok: 40,
      deskripsi: deskripsi || undefined,
      rujukanWsos: rujukanWsos || undefined,
    });

    revalidatePath("/kaprogli");
    revalidatePath("/guru/bahan-ajar");
    return { success: true, mapel };
  } catch (err) {
    console.error("Gagal membuat mata pelajaran:", err);
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan basis data." };
  }
}

export async function saveBahanAjarAction(data: Omit<BahanAjarMapel, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }

  try {
    const saved = await saveBahanAjarMapel(data);
    revalidatePath("/guru/bahan-ajar");
    revalidatePath(`/guru/bahan-ajar/${data.mataPelajaranId}`);
    return { success: true, bahanAjar: saved };
  } catch (err) {
    console.error("Gagal menyimpan bahan ajar:", err);
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan basis data." };
  }
}
