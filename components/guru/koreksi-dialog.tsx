"use client";

import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface KoreksiDialogProps {
  open: boolean;
  judulTopik: string;
  onClose: () => void;
  onSubmit: (tindakan: "tolak" | "modifikasi", catatan: string) => void;
}

export function KoreksiDialog({ open, judulTopik, onClose, onSubmit }: KoreksiDialogProps) {
  const [tindakan, setTindakan] = useState<"tolak" | "modifikasi">("tolak");
  const [catatan, setCatatan] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(tindakan, catatan);
    setCatatan("");
  }

  return (
    <Dialog open={open} onClose={onClose} title="Tolak atau modifikasi kartu" description={judulTopik}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset className="flex gap-4">
          <legend className="sr-only">Tindakan</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="tindakan"
              checked={tindakan === "tolak"}
              onChange={() => setTindakan("tolak")}
              className="accent-primary"
            />
            Tolak sepenuhnya
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="tindakan"
              checked={tindakan === "modifikasi"}
              onChange={() => setTindakan("modifikasi")}
              className="accent-primary"
            />
            Terima dengan modifikasi
          </label>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Catatan (opsional)
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            placeholder="Mis. alat yang disebut tidak sesuai kondisi lab kami"
            className="rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="destructive">
            Simpan koreksi
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
