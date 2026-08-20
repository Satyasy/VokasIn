"use server";

import { revalidatePath } from "next/cache";
import { addLabItem, updateLabItem, deleteLabItem } from "@/lib/data-access-db";
import type { KategoriAlat } from "@/lib/types";

export async function addLabItemAction(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "") as KategoriAlat;
  const jumlah = Number(formData.get("jumlah") ?? 0);
  const programKeahlianId = String(formData.get("programKeahlianId") ?? "");
  if (!nama || !kategori || !programKeahlianId || jumlah < 0) return;

  await addLabItem({ nama, kategori, jumlah, programKeahlianId });
  revalidatePath("/", "layout");
}

export async function updateLabItemAction(id: string, formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "") as KategoriAlat;
  const jumlah = Number(formData.get("jumlah") ?? 0);
  if (!nama || !kategori || jumlah < 0) return;

  await updateLabItem(id, { nama, kategori, jumlah });
  revalidatePath("/", "layout");
}

export async function deleteLabItemAction(id: string) {
  await deleteLabItem(id);
  revalidatePath("/", "layout");
}
