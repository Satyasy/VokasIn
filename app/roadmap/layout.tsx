import type { ReactNode } from "react";
import { LandingNavbar } from "@/components/landing/navbar";

export default function RoadmapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <div className="pt-24 sm:pt-28 pb-16">{children}</div>
    </>
  );
}
