import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureGuruCacheFresh } from "@/lib/data-access-db";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminThemeProvider } from "@/components/admin/admin-theme-context";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  await ensureGuruCacheFresh();

  return (
    <AdminThemeProvider>
      <div className="relative flex min-h-screen overflow-x-hidden">
        {/* Ambient Radial Blobs Harmonis dengan Hero LP (Aktif saat Dark Mode) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 size-[480px] rounded-full bg-slime-lime-300 opacity-10 blur-[95px] dark:block hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 right-0 size-[520px] rounded-full bg-slime-lime-600 opacity-10 blur-[110px] dark:block hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/4 size-[360px] rounded-full bg-slime-lime-900 opacity-30 blur-[80px] dark:block hidden"
        />

        <AdminSidebar />
        <div className="relative z-10 flex flex-1 flex-col min-w-0">
          {children}
        </div>
      </div>
    </AdminThemeProvider>
  );
}
