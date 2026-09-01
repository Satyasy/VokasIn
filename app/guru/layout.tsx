import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureGuruCacheFresh } from "@/lib/data-access-db";
import { getGuruById } from "@/lib/data-access";
import { ModulAjarDraftProvider } from "@/lib/modul-ajar-draft-context";
import { AppNavbar } from "@/components/app-navbar";

export default async function GuruLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  await ensureGuruCacheFresh();
  const guru = getGuruById(session.guruId);

  return (
    <ModulAjarDraftProvider>
      <AppNavbar nama={guru?.nama ?? ""} role={session.role} />
      <div className="pt-24 sm:pt-28 pb-16">{children}</div>
    </ModulAjarDraftProvider>
  );
}
