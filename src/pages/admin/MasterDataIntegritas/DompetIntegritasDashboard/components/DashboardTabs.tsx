import type { DashboardTabsProps } from "../types";
import { DASHBOARD_TABS } from "../utils/constants";

export function DashboardTabs({ activeTab, onChangeTab }: DashboardTabsProps) {
  return (
    <div className="flex gap-2">
      {DASHBOARD_TABS.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => onChangeTab(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}