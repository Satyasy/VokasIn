"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { confirmKandidat, editKandidat, rejectKandidat } from "@/lib/data-access-db";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
}

function revalidateAll() {
  revalidatePath("/admin/skkni/kandidat");
  revalidatePath("/guru");
  revalidatePath("/admin");
}

export async function confirmKandidatAction(id: string) {
  await requireAdmin();
  await confirmKandidat(id);
  revalidateAll();
}

export async function editThenConfirmKandidatAction(id: string, formData: FormData) {
  await requireAdmin();
  await editKandidat(id, {
    kodeUnit: String(formData.get("kodeUnit") ?? ""),
    judulUnit: String(formData.get("judulUnit") ?? ""),
    sumber: String(formData.get("sumber") ?? ""),
    programKeahlianId: String(formData.get("programKeahlianId") ?? ""),
  });
  await confirmKandidat(id);
  revalidateAll();
}

export async function rejectKandidatAction(id: string) {
  await requireAdmin();
  await rejectKandidat(id);
  revalidateAll();
}

export async function bulkConfirmKandidatAction(mapped: Record<string, string>) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "kaprogli")) {
    redirect("/login");
  }
  const { bulkConfirmKandidat } = await import("@/lib/data-access-db");
  await bulkConfirmKandidat(mapped);
  revalidateAll();
}
