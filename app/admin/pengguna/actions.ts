"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, generateRandomPassword } from "@/lib/auth";
import { createGuru, setGuruAktif, updateGuruRole } from "@/lib/data-access-db";
import type { Role } from "@/lib/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
}

// Password acak ditampilkan SEKALI ke admin lewat return value ini — tidak
// ada email otomatis (CLAUDE.md Bagian E: belum ada infrastruktur email).
export async function createGuruAction(
  _prevState: { error?: string; password?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as Role;
  const programKeahlianId = String(formData.get("programKeahlianId") ?? "");
  if (!nama || !email || !role || !programKeahlianId) {
    return { error: "Semua field wajib diisi." };
  }

  const password = generateRandomPassword();
  await createGuru({ nama, email, role, programKeahlianId, password });
  revalidatePath("/admin/pengguna");
  revalidatePath("/admin");
  return { password };
}

export async function updateGuruRoleAction(id: string, role: Role) {
  await requireAdmin();
  await updateGuruRole(id, role);
  revalidatePath("/admin/pengguna");
}

export async function setGuruAktifAction(id: string, aktif: boolean) {
  await requireAdmin();
  await setGuruAktif(id, aktif);
  revalidatePath("/admin/pengguna");
  revalidatePath("/admin");
}
