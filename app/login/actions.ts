"use server";

import { redirect } from "next/navigation";
import { getGuruAuthByEmail } from "@/lib/data-access-db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return "Email dan kata sandi wajib diisi.";

  const guru = await getGuruAuthByEmail(email);
  if (!guru || !verifyPassword(password, guru.passwordHash)) {
    return "Email atau kata sandi salah.";
  }
  if (!guru.aktif) {
    return "Akun ini sudah dinonaktifkan.";
  }

  await createSession(guru.id, guru.role);
  redirect(guru.role === "kaprogli" ? "/kaprogli" : guru.role === "admin" ? "/admin" : "/guru");
}

export async function demoLoginAction(role: "guru" | "kaprogli") {
  const email =
    role === "kaprogli"
      ? "bambang.wijaya@smk.belajar.id"
      : "siti.rahmawati@smk.belajar.id";

  const guru = await getGuruAuthByEmail(email);
  if (guru && guru.aktif) {
    await createSession(guru.id, guru.role);
  } else {
    // Fallback ID & role default
    const fallbackId = role === "kaprogli" ? "guru-02" : "guru-01";
    const fallbackRole = role === "kaprogli" ? "kaprogli" : "guru_produktif";
    await createSession(fallbackId, fallbackRole);
  }

  redirect(role === "kaprogli" ? "/kaprogli" : "/guru");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
