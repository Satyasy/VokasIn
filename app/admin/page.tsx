import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { getAdminAnalyticsData } from "@/lib/data-access-db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminAnalytics } from "@/components/admin/admin-analytics";

const TODAY = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" });

export default async function AdminDashboardPage() {
  const session = await getSession();
  const admin = session ? getGuruById(session.guruId) : undefined;
  const analytics = await getAdminAnalyticsData();

  return (
    <>
      <AdminTopbar
        title="Dashboard Administrasi"
        context={`Audit Kurikulum & Beban Mengajar Sekolah • ${TODAY.format(new Date())}`}
        nama={admin?.nama ?? "Admin"}
      />
      <main className="flex-1 px-4 py-6 sm:px-8">
        <AdminAnalytics analytics={analytics} />
      </main>
    </>
  );
}
