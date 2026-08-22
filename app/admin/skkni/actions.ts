"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { uploadDokumenSkkni } from "@/lib/data-access-db";

export async function uploadSkkniAction(_prevState: string | undefined, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const file = formData.get("file");
  const nomor = String(formData.get("nomor") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) return "Pilih file PDF SKKNI dulu.";
  if (!file.name.toLowerCase().endsWith(".pdf")) return "File harus berformat PDF.";
  if (!nomor) return "Nomor Kepmenaker/dokumen wajib diisi.";

  const { kandidatBaru } = await uploadDokumenSkkni(file, nomor, session.guruId);
  revalidatePath("/admin/skkni");
  revalidatePath("/admin/skkni/kandidat");
  revalidatePath("/admin");

  if (kandidatBaru === 0) {
    return "File terunggah, tapi parser tidak menemukan unit di dalamnya. Cek format dokumen.";
  }
  redirect(`/admin/skkni?diunggah=${kandidatBaru}`);
}
