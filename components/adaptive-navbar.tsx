import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { AppNavbar } from "@/components/app-navbar";
import { LandingNavbar } from "@/components/landing/navbar";

export async function AdaptiveNavbar() {
  const session = await getSession();

  if (session) {
    const guru = getGuruById(session.guruId);
    return <AppNavbar nama={guru?.nama ?? "Pengguna"} role={session.role} />;
  }

  return <LandingNavbar />;
}
