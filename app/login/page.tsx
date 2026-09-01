"use client";

import { useActionState, useState, useTransition } from "react";
import { LogIn, Eye, EyeOff, FileCheck, GraduationCap, LayoutDashboard, Sparkles } from "lucide-react";
import { loginAction, demoLoginAction } from "./actions";
import { LandingNavbar } from "@/components/landing/navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoPending, startDemoTransition] = useTransition();

  const handleDemoLogin = (role: "guru" | "kaprogli") => {
    startDemoTransition(async () => {
      await demoLoginAction(role);
    });
  };

  const isBusy = pending || isDemoPending;

  return (
    <>
      <LandingNavbar />
      <main className="flex min-h-svh items-center justify-center bg-neutral-50 px-4 pt-24 pb-12 sm:pt-28">
        <Card className="fade-up grid w-full max-w-4xl grid-cols-1 overflow-hidden p-0 shadow-xl border-neutral-200 lg:grid-cols-[44%_56%]">
          {/* Panel kiri — hanya tampil di layar desktop */}
          <div className="relative hidden flex-col justify-end overflow-hidden bg-neutral-950 p-8 lg:flex">
            {/* Blob 1 — slime-lime-300, kiri-atas */}
            <div
              className="absolute -top-16 -left-16 size-[60%] rounded-full bg-slime-lime-300 blur-[60px]"
              aria-hidden
            />
            {/* Blob 2 — slime-lime-900, tengah */}
            <div
              className="absolute top-1/2 left-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slime-lime-900 blur-[70px]"
              aria-hidden
            />
            {/* Blob 3 — slime-lime-100, kanan-bawah */}
            <div
              className="absolute -right-10 -bottom-10 size-[40%] rounded-full bg-slime-lime-100 blur-[50px]"
              aria-hidden
            />
            {/* Scrim gelap untuk kontras teks */}
            <div
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-neutral-950 to-transparent"
              aria-hidden
            />

            <div className="absolute top-8 left-8 z-10 rounded-lg bg-neutral-950/60 p-2.5 backdrop-blur-sm border border-white/10">
              <FileCheck className="size-7 text-slime-lime-400" aria-hidden />
            </div>

            <div className="relative z-10 mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slime-lime-400">
                Standar Kompetensi Resmi
              </p>
              <p className="mt-2 text-2xl font-extrabold text-neutral-50 leading-snug">
                Susun perangkat ajar SMK langsung dari teks SKKNI asli.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                Kartu saran ditarik langsung dari Elemen dan Kriteria Unjuk Kerja resmi dengan konfirmasi penuh dari guru.
              </p>
            </div>
          </div>

          {/* Panel kanan — formulir dan tombol demo */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
            <span className="text-xs font-bold tracking-wider uppercase text-slime-lime-700">
              VokasIn Platform
            </span>

            <div className="mt-2 flex items-center gap-2">
              <LogIn className="size-5 text-slime-lime-700" aria-hidden />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Masuk Akun</h1>
            </div>
            <p className="mt-1.5 text-sm text-neutral-600">
              Masuk menggunakan akun yang telah didaftarkan sekolah Anda.
            </p>

            {/* Bagian Tombol Coba Demo Cepat */}
            <div className="mt-6 rounded-xl border border-slime-lime-200 bg-slime-lime-50/70 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-slime-lime-800" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-wider text-slime-lime-900">
                  Akses Cepat Mode Demo
                </p>
              </div>
              <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                Coba langsung aplikasi prototipe VokasIn dengan 1 klik tanpa perlu mengetik kata sandi:
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDemoLogin("guru")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slime-lime-300 bg-white px-3 py-2 text-xs font-bold text-neutral-900 shadow-sm transition-all hover:bg-slime-lime-100 hover:border-slime-lime-400 active:scale-95 disabled:opacity-60"
                >
                  <GraduationCap className="size-4 text-slime-lime-800 shrink-0" aria-hidden />
                  <span>Demo Guru</span>
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDemoLogin("kaprogli")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slime-lime-300 bg-white px-3 py-2 text-xs font-bold text-neutral-900 shadow-sm transition-all hover:bg-slime-lime-100 hover:border-slime-lime-400 active:scale-95 disabled:opacity-60"
                >
                  <LayoutDashboard className="size-4 text-slime-lime-800 shrink-0" aria-hidden />
                  <span>Demo Kaprogli</span>
                </button>
              </div>
            </div>

            {/* Pembatas Atau */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-neutral-200" />
              <span className="absolute bg-card px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                atau masuk manual
              </span>
            </div>

            {/* Formulir Login Manual */}
            <form action={formAction} className="flex flex-col gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={isBusy}
              />
              <div className="relative">
                <Input
                  label="Kata sandi"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isBusy}
                  errorText={error}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                </button>
              </div>

              <Button
                type="submit"
                loading={isBusy}
                className="mt-2 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 font-semibold"
              >
                Masuk
              </Button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-neutral-500 text-center">
              Belum memiliki akun atau lupa kata sandi? Hubungi admin sekolah Anda.
            </p>
          </div>
        </Card>
      </main>
    </>
  );
}
