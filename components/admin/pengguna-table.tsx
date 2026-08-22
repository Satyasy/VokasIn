"use client";

import { useTransition } from "react";
import { Ban, RotateCcw } from "lucide-react";
import type { Guru, ProgramKeahlian, Role } from "@/lib/types";
import { setGuruAktifAction, updateGuruRoleAction } from "@/app/admin/pengguna/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ROLE_LABEL: Record<Role, string> = {
  guru_produktif: "Guru Produktif",
  kaprogli: "Kaprogli",
  admin: "Admin",
};

export function PenggunaTable({
  guruList,
  programList,
  currentUserId,
}: {
  guruList: Guru[];
  programList: ProgramKeahlian[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const programNama = new Map(programList.map((p) => [p.id, p.singkatan]));

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Nama</th>
            <th className="px-4 py-2.5 font-medium">Email</th>
            <th className="px-4 py-2.5 font-medium">Peran</th>
            <th className="px-4 py-2.5 font-medium">Program Keahlian</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {guruList.map((g, i) => (
            <tr key={g.id} className={i % 2 === 1 ? "bg-neutral-50" : undefined}>
              <td className="px-4 py-2.5 text-foreground">{g.nama}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{g.email}</td>
              <td className="px-4 py-2.5">
                <select
                  defaultValue={g.role}
                  disabled={pending || g.id === currentUserId}
                  onChange={(e) => startTransition(() => updateGuruRoleAction(g.id, e.target.value as Role))}
                  className="h-8 rounded-md border border-border bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {Object.entries(ROLE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {programNama.get(g.programKeahlianId) ?? "-"}
              </td>
              <td className="px-4 py-2.5">
                <Badge variant={g.aktif ? "success" : "default"}>{g.aktif ? "Aktif" : "Nonaktif"}</Badge>
              </td>
              <td className="px-4 py-2.5 text-right">
                {g.id === currentUserId ? (
                  <span className="text-xs text-muted-foreground">Akun Anda</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => startTransition(() => setGuruAktifAction(g.id, !g.aktif))}
                    aria-label={g.aktif ? "Nonaktifkan akun" : "Aktifkan kembali akun"}
                  >
                    {g.aktif ? <Ban className="size-4" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
