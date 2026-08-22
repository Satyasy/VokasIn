import { FileText, CheckCircle2, Clock, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { getAdminDashboardStats } from "@/lib/data-access-db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";

const TODAY = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" });

export default async function AdminDashboardPage() {
  const session = await getSession();
  const admin = session ? getGuruById(session.guruId) : undefined;
  const stats = await getAdminDashboardStats();

  // Semua kartu memakai token warna yang sama (bg-card netral + aksen
  // slime-lime hanya pada ikon/angka) — CLAUDE.md Bagian B, bukan warna
  // berbeda per kartu.
  const cards = [
    { label: "Total Dokumen SKKNI", value: stats.totalDokumen, icon: FileText },
    { label: "Unit Terverifikasi", value: stats.unitTerverifikasi, icon: CheckCircle2 },
    { label: "Kandidat Menunggu Verifikasi", value: stats.kandidatMenunggu, icon: Clock },
    { label: "Total Pengguna Aktif", value: stats.totalPengguna, icon: Users },
  ];

  return (
    <>
      <AdminTopbar title="Dashboard" context={TODAY.format(new Date())} nama={admin?.nama ?? "Admin"} />
      <main className="flex-1 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
              </div>
              <Icon className="size-5 text-primary" aria-hidden />
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
