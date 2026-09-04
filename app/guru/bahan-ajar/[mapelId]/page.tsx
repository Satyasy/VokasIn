import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getMataPelajaranById } from "@/lib/data-access-db";
import { BahanAjarCanvas } from "@/components/guru/bahan-ajar-canvas";

export default async function GuruBahanAjarDetailPage({
  params,
}: {
  params: Promise<{ mapelId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedParams = await params;
  const mapel = await getMataPelajaranById(resolvedParams.mapelId);

  if (!mapel) {
    notFound();
  }

  return (
    <BahanAjarCanvas
      mapel={mapel}
      initialBahanAjar={mapel.bahanAjar}
      guruId={session.guruId}
    />
  );
}
