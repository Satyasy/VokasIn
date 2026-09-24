"use server";

import { redirect } from "next/navigation";
import { getGuruAuthByEmail } from "@/lib/data-access-db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return "Email dan kata sandi wajib diisi.";

  let guru;
  try {
    guru = await getGuruAuthByEmail(email);
  } catch (err) {
    console.error("Gagal mengambil data autentikasi guru dari database:", err);
    return "Terjadi kendala koneksi ke database. Silakan coba lagi atau gunakan Akses Cepat Mode Demo.";
  }

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

  const fallbackId = role === "kaprogli" ? "guru-02" : "guru-01";
  const fallbackRole = role === "kaprogli" ? "kaprogli" : "guru_produktif";

  try {
    const guru = await getGuruAuthByEmail(email);
    if (guru && guru.aktif) {
      await createSession(guru.id, guru.role);
    } else {
      await createSession(fallbackId, fallbackRole);
    }
  } catch (err) {
    console.warn("Koneksi DB gagal saat demo login, menggunakan sesi fallback:", err);
    await createSession(fallbackId, fallbackRole);
  }

  redirect(role === "kaprogli" ? "/kaprogli" : "/guru");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
