"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadSkkniAction } from "@/app/admin/skkni/actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UploadSkkniForm() {
  const [error, formAction, pending] = useActionState(uploadSkkniAction, undefined);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <UploadCloud className="size-5 text-primary" aria-hidden />
        <CardTitle>Unggah Dokumen SKKNI</CardTitle>
      </div>
      <CardDescription className="mt-1">
        Hasil parsing masuk sebagai kandidat, belum terlihat oleh guru sampai admin mengonfirmasi
        di Tinjau Kandidat.
      </CardDescription>
      <form action={formAction} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <Input
          label="Nomor dokumen (Kepmenaker/Kepmenperin)"
          name="nomor"
          placeholder="mis. Kepmenaker No. 45 Tahun 2026"
          required
          disabled={pending}
          className="flex-1"
        />
        <Input label="File PDF" name="file" type="file" accept="application/pdf" required disabled={pending} />
        <Button type="submit" loading={pending}>
          Unggah &amp; Parsing
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
    </Card>
  );
}
