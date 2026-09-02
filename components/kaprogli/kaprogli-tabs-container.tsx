"use client";

import { useState, ReactNode } from "react";
import { Gauge, Users, Wrench, FileCheck2 } from "lucide-react";
import type { Guru, JadwalPembelajaran, UnitKompetensiKandidat, ProgramKeahlian } from "@/lib/types";
import { SegmentedTabs, type TabItem } from "@/components/ui/segmented-tabs";
import { KaprogliSupervisiTab } from "@/components/kaprogli/kaprogli-supervisi-tab";
import { KaprogliSkkniTab } from "@/components/kaprogli/kaprogli-skkni-tab";

interface KaprogliTabsContainerProps {
  guruList: Guru[];
  jadwalList: JadwalPembelajaran[];
  currentKaprogliProgramId: string;
  deltaScoreNode: ReactNode;
  inventarisNode: ReactNode;
  kandidatList: UnitKompetensiKandidat[];
  programList: ProgramKeahlian[];
}

export function KaprogliTabsContainer({
  guruList,
  jadwalList,
  currentKaprogliProgramId,
  deltaScoreNode,
  inventarisNode,
  kandidatList,
  programList,
}: KaprogliTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<string>("delta");

  const tabs: TabItem[] = [
    {
      id: "delta",
      label: "Skill Delta Score",
      icon: <Gauge className="size-4" />,
    },
    {
      id: "supervisi",
      label: "Supervisi JP & Jadwal Guru",
      count: jadwalList.length,
      icon: <Users className="size-4" />,
    },
    {
      id: "inventaris",
      label: "Inventaris Lab & Alat",
      icon: <Wrench className="size-4" />,
    },
    {
      id: "skkni",
      label: "Verifikasi & Upload SKKNI",
      count: kandidatList.length,
      icon: <FileCheck2 className="size-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigasi Segmented */}
      <div className="flex items-center justify-start overflow-x-auto pb-1">
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>

      {/* Konten Tab Aktif */}
      <div>
        {activeTab === "delta" && (
          <div className="animate-in fade-in duration-300">
            {deltaScoreNode}
          </div>
        )}

        {activeTab === "supervisi" && (
          <KaprogliSupervisiTab
            guruList={guruList}
            jadwalList={jadwalList}
            currentKaprogliProgramId={currentKaprogliProgramId}
          />
        )}

        {activeTab === "inventaris" && (
          <div className="animate-in fade-in duration-300">
            {inventarisNode}
          </div>
        )}

        {activeTab === "skkni" && (
          <div className="animate-in fade-in duration-300">
            <KaprogliSkkniTab
              kandidatList={kandidatList}
              currentProgramId={currentKaprogliProgramId}
              programList={programList}
            />
          </div>
        )}
      </div>
    </div>
  );
}
