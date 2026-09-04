"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface SegmentedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function SegmentedTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Navigasi Menu"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-2xl border border-neutral-200 bg-neutral-100/90 p-1.5 shadow-inner",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-200 outline-none sm:text-sm",
              isActive
                ? "bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-200/80"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
            )}
          >
            {tab.icon && <span className="size-4 shrink-0 text-current">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold",
                  isActive
                    ? "bg-slime-lime-100 text-slime-lime-900"
                    : "bg-neutral-200 text-neutral-700"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
