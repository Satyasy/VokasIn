import type { ReactNode } from "react";
import { AdaptiveNavbar } from "@/components/adaptive-navbar";

export default function RoadmapLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <AdaptiveNavbar />
      {children}
    </div>
  );
}
