"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "./actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <Card>
        <div className="flex items-center gap-2">
          <LogIn className="size-5 text-primary" aria-hidden />
          <CardTitle>Masuk ke VokasIn</CardTitle>
        </div>
        <CardDescription className="mt-1">
          Untuk guru produktif dan kaprogli yang akunnya sudah didaftarkan sekolah.
        </CardDescription>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            required
            disabled={pending}
          />
          <Input
            label="Kata sandi"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            errorText={error}
          />
          <Button type="submit" loading={pending} className="mt-2">
            Masuk
          </Button>
        </form>
      </Card>
    </main>
  );
}
