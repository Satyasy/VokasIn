"use client";

import { useActionState } from "react";
import { UserPlus, Copy } from "lucide-react";
import type { ProgramKeahlian } from "@/lib/types";
import { createGuruAction } from "@/app/admin/pengguna/actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreateGuruForm({ programList }: { programList: ProgramKeahlian[] }) {
  const [state, formAction, pending] = useActionState(createGuruAction, undefined);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <UserPlus className="size-5 text-primary" aria-hidden />
        <CardTitle>Buat Akun Baru</CardTitle>
      </div>
      <CardDescription className="mt-1">
        Password acak ditampilkan sekali di bawah (sampaikan sendiri ke guru bersangkutan,
        tidak ada email otomatis).
      </CardDescription>

      <form action={formAction} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Nama" name="nama" required disabled={pending} />
        <Input label="Email" name="email" type="email" required disabled={pending} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="role">
            Peran
          </label>
          <select
            id="role"
            name="role"
            disabled={pending}
            className="h-10 rounded-lg border border-border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="guru_produktif">Guru Produktif</option>
            <option value="kaprogli">Kaprogli</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="programKeahlianId">
            Program keahlian
          </label>
          <select
            id="programKeahlianId"
            name="programKeahlianId"
            disabled={pending}
            className="h-10 rounded-lg border border-border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {programList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit" loading={pending}>
            Buat Akun
          </Button>
        </div>
      </form>

      {state?.error && <p className="mt-3 text-sm text-error">{state.error}</p>}
      {state?.password && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slime-lime-50 px-4 py-3">
          <Copy className="size-4 shrink-0 text-slime-lime-800" aria-hidden />
          <p className="text-sm text-slime-lime-900">
            Akun dibuat. Kata sandi (hanya tampil sekali):{" "}
            <span className="font-mono font-semibold">{state.password}</span>
          </p>
        </div>
      )}
    </Card>
  );
}
