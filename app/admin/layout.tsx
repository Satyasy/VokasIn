import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureGuruCacheFresh } from "@/lib/data-access-db";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// proxy.ts sudah menolak non-admin di /admin/*, ini pengecekan kedua di
// server component — pola sama seperti app/guru/layout.tsx & app/kaprogli/layout.tsx.
// ensureGuruCacheFresh() di sini membuat cache guru segar untuk seluruh
// subtree /admin/*, termasuk AdminTopbar yang tiap page render sendiri.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  await ensureGuruCacheFresh();

  return (
    <div className="flex min-h-svh bg-neutral-950">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0 bg-linear-to-b from-slime-lime-50/40 via-neutral-50 to-neutral-100/50">
        {children}
      </div>
    </div>
  );
}
