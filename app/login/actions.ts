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

  await createSession(guru.id, guru.role);
  redirect(guru.role === "kaprogli" ? "/kaprogli" : "/guru");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
