"use client";

import { useActionState, useState } from "react";
import { LogIn, Eye, EyeOff, FileCheck } from "lucide-react";
import { loginAction } from "./actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-svh items-center justify-center bg-neutral-50 px-4 py-12">
      <Card className="fade-up grid w-full max-w-4xl grid-cols-1 overflow-hidden p-0 lg:grid-cols-[45%_55%]">
        {/* Panel kiri — hanya tampil ≥1024px, disembunyikan total (bukan ditumpuk) di mobile.
            Blob 1 (top-left) & blob 3 (bottom-right) gagal kontras AA untuk teks putih di
            intinya (lihat scripts/contrast-check.mjs: ~1.1:1) — teks HARUS diletakkan di zona
            blob 2/base yang gelap (kiri-bawah), bukan di tengah panel, dan scrim gradasi
            gelap ditambahkan sebagai jaring pengaman kedua di belakang teks (Bagian E). */}
        <div className="relative hidden flex-col justify-end overflow-hidden bg-neutral-950 p-8 lg:flex">
          {/* Blob 1 — slime-lime-300, kiri-atas */}
          <div
            className="absolute -top-16 -left-16 size-[60%] rounded-full bg-slime-lime-300 blur-[60px]"
            aria-hidden
          />
          {/* Blob 2 — slime-lime-900, tengah, mendominasi */}
          <div
            className="absolute top-1/2 left-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slime-lime-900 blur-[70px]"
            aria-hidden
          />
          {/* Blob 3 — slime-lime-100, kanan-bawah */}
          <div
            className="absolute -right-10 -bottom-10 size-[40%] rounded-full bg-slime-lime-100 blur-[50px]"
            aria-hidden
          />
          {/* Scrim: jaring pengaman kontras kedua di belakang teks, terlepas dari posisi blob */}
          <div
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-neutral-950 to-transparent"
            aria-hidden
          />

          {/* Wrapper gelap: blob 1 duduk tepat di sudut ini, intinya gagal kontras untuk
              ikon putih (lihat contrast-check.mjs) — chip neutral-950/60 jadi jaring
              pengaman lokal, sama seperti scrim di bawah teks. */}
          <div className="absolute top-8 left-8 z-10 rounded-lg bg-neutral-950/60 p-2">
            <FileCheck className="size-8 text-neutral-50" aria-hidden />
          </div>
          <div className="relative z-10 mt-8">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-50/70">
              Trusted by vocational teachers
            </p>
            <p className="mt-2 text-2xl font-bold text-neutral-50">
              Build lesson plans straight from official competency standards.
            </p>
            <p className="mt-2 text-sm text-neutral-300">
              Suggestion cards are pulled directly from real SKKNI competency units — never made up by AI.
            </p>
          </div>
        </div>

        {/* Panel kanan — formulir, satu-satunya yang tampil di mobile */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
          <span className="text-sm font-semibold tracking-tight text-foreground">VokasIn</span>

          <div className="mt-6 flex items-center gap-2">
            <LogIn className="size-5 text-primary" aria-hidden />
            <h1 className="text-lg font-semibold text-foreground">Masuk</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk menggunakan akun yang diberikan sekolah Anda.
          </p>

          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="username"
              required
              disabled={pending}
            />
            <div className="relative">
              <Input
                label="Kata sandi"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={pending}
                errorText={error}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
            <Button
              type="submit"
              loading={pending}
              className="mt-2 bg-cta-primary text-cta-primary-foreground hover:bg-neutral-800 active:bg-neutral-800"
            >
              Masuk
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Belum punya akun atau lupa kata sandi? Hubungi admin sekolah Anda.
          </p>
        </div>
      </Card>
    </main>
  );
}
