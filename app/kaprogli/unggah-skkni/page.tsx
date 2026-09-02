import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { SkkniExtractionPageClient } from "@/components/skkni/skkni-extraction-page-client";

export default async function KaprogliUnggahSkkniPage() {
  const session = await getSession();
  if (!session || (session.role !== "kaprogli" && session.role !== "admin")) {
    redirect("/login");
  }

  const guru = getGuruById(session.guruId);
  const defaultProgramId = guru?.programKeahlianId || "pk-tkj";

  return <SkkniExtractionPageClient role="kaprogli" defaultProgramId={defaultProgramId} />;
}
