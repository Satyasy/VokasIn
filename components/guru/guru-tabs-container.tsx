"use client";

import { useState, useEffect, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutDashboard, CalendarDays, FileText } from "lucide-react";
import type { JadwalPembelajaran, JpSummary, UnitKompetensi } from "@/lib/types";
import { SegmentedTabs, type TabItem } from "@/components/ui/segmented-tabs";
import { GuruOverviewTab } from "@/components/guru/guru-overview-tab";
import { GuruJadwalTab } from "@/components/guru/guru-jadwal-tab";

interface GuruTabsContainerProps {
  jadwalList: JadwalPembelajaran[];
  jpSummary: JpSummary;
  availableUnits: UnitKompetensi[];
  programKeahlianId: string;
  modulAjarNode: ReactNode;
  initialTab?: string;
}

export function GuruTabsContainer({
  jadwalList,
  jpSummary,
  availableUnits,
  programKeahlianId,
  modulAjarNode,
  initialTab,
}: GuruTabsContainerProps) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    urlTab || initialTab || "overview"
  );

  useEffect(() => {
    if (urlTab && ["overview", "jadwal", "modul"].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Ringkasan & Hari Ini",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      id: "jadwal",
      label: "Jadwal & Alokasi JP",
      count: jadwalList.length,
      icon: <CalendarDays className="size-4" />,
    },
    {
      id: "modul",
      label: "Penyusunan Modul Ajar",
      count: availableUnits.length,
      icon: <FileText className="size-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Segmented Tab Navigation Bar */}
      <div className="flex items-center justify-start overflow-x-auto pb-1">
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>

      {/* Konten Tab */}
      <div>
        {activeTab === "overview" && (
          <GuruOverviewTab
            jadwalList={jadwalList}
            jpSummary={jpSummary}
            onNavigateToJadwal={() => setActiveTab("jadwal")}
            onNavigateToModul={() => setActiveTab("modul")}
          />
        )}

        {activeTab === "jadwal" && (
          <GuruJadwalTab
            jadwalList={jadwalList}
            jpSummary={jpSummary}
            availableUnits={availableUnits}
            programKeahlianId={programKeahlianId}
          />
        )}

        {activeTab === "modul" && (
          <div className="animate-in fade-in duration-300">
            {modulAjarNode}
          </div>
        )}
      </div>
    </div>
  );
}
