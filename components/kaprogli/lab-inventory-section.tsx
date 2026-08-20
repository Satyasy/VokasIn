"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, X, Package } from "lucide-react";
import type { SumberDayaLab, KategoriAlat } from "@/lib/types";
import { addLabItemAction, updateLabItemAction, deleteLabItemAction } from "@/app/kaprogli/lab/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

const KATEGORI_LABEL: Record<KategoriAlat, string> = {
  "perangkat-jaringan": "Perangkat jaringan",
  "komputer-kerja": "Komputer kerja",
  "alat-ukur": "Alat ukur",
  "perangkat-lunak": "Perangkat lunak",
  "alat-tangan": "Alat tangan",
  server: "Server",
};

function KategoriSelect({ id, name, defaultValue }: { id: string; name: string; defaultValue?: KategoriAlat }) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue ?? "komputer-kerja"}
      required
      className="h-10 rounded-lg border border-border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {Object.entries(KATEGORI_LABEL).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function EditRow({ item, onDone }: { item: SumberDayaLab; onDone: () => void }) {
  return (
    <form
      action={async (formData) => {
        await updateLabItemAction(item.id, formData);
        onDone();
      }}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-muted p-3"
    >
      <Input name="nama" defaultValue={item.nama} label="Nama alat" required className="min-w-40 flex-1" />
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Kategori
        <KategoriSelect id={`kategori-${item.id}`} name="kategori" defaultValue={item.kategori} />
      </label>
      <Input name="jumlah" type="number" min={0} defaultValue={item.jumlah} label="Jumlah" required className="w-24" />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Simpan
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          <X className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  );
}

export function LabInventorySection({
  programKeahlianId,
  items,
}: {
  programKeahlianId: string;
  items: SumberDayaLab[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && !showAdd ? (
        <EmptyState
          icon={<Package className="size-8" />}
          title="Belum ada alat di lab ini"
          description="Tambahkan item pertama untuk mengaktifkan Resource Feasibility Checker."
          action={
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="size-4" aria-hidden />
              Tambah alat
            </Button>
          }
        />
      ) : (
        <>
          {items.map((item) =>
            editingId === item.id ? (
              <EditRow key={item.id} item={item} onDone={() => setEditingId(null)} />
            ) : (
              <Card key={item.id} className="flex items-center gap-3 p-3">
                <Package className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {KATEGORI_LABEL[item.kategori]} &middot; &times;{item.jumlah}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(item.id)} aria-label={`Edit ${item.nama}`}>
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <form action={deleteLabItemAction.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="ghost" aria-label={`Hapus ${item.nama}`}>
                    <Trash2 className="size-4 text-error" aria-hidden />
                  </Button>
                </form>
              </Card>
            )
          )}

          {showAdd ? (
            <form
              action={async (formData) => {
                await addLabItemAction(formData);
                setShowAdd(false);
              }}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3"
            >
              <input type="hidden" name="programKeahlianId" value={programKeahlianId} />
              <Input name="nama" label="Nama alat" required className="min-w-40 flex-1" />
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Kategori
                <KategoriSelect id={`kategori-baru-${programKeahlianId}`} name="kategori" />
              </label>
              <Input name="jumlah" type="number" min={0} defaultValue={1} label="Jumlah" required className="w-24" />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Simpan
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </form>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)} className="self-start">
              <Plus className="size-4" aria-hidden />
              Tambah alat
            </Button>
          )}
        </>
      )}
    </div>
  );
}
