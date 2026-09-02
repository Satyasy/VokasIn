import type { ReactNode } from "react";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";

export default function RoadmapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdaptiveNavbar />
      <div className="pt-24 sm:pt-28 pb-16">{children}</div>
    </>
  );
}
