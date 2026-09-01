import type { ReactNode } from "react";
import { LandingNavbar } from "@/components/landing/navbar";

export default function RoadmapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LandingNavbar />
      {/* ponytail: pt-14 offsets the fixed navbar height (~56px) */}
      <div className="pt-14">{children}</div>
    </>
  );
}
