import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getGuruById } from "@/lib/data-access";
import { SkkniExtractionPageClient } from "@/components/skkni/skkni-extraction-page-client";

export default async function GuruUnggahSkkniPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const guru = getGuruById(session.guruId);
  const defaultProgramId = guru?.programKeahlianId || "pk-tkj";

  return <SkkniExtractionPageClient role="guru" defaultProgramId={defaultProgramId} />;
}
