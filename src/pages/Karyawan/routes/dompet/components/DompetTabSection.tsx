// * This file defines route module logic for src/pages/Karyawan/routes/dompet/components/DompetTabSection.tsx.

import { History, ShoppingCart, Wallet, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { DOMPET_TABS } from "../../../utils/dompet/constants";
import type { DompetTabKey } from "../../../utils/dompet/types";

interface DompetTabSectionProps {
  activeTab: DompetTabKey;
  onChangeTab: (nextTab: DompetTabKey) => void;
}

const TAB_ICONS: Record<DompetTabKey, ReactNode> = {
  wallet: <Wallet size={16} />,
  ledger: <History size={16} />,
  marketplace: <ShoppingCart size={16} />,
  inventory: <Zap size={16} />,
};

// & This function component/helper defines DompetTabSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku DompetTabSection untuk file route ini.
const DompetTabSection = ({
  activeTab,
  onChangeTab,
}: DompetTabSectionProps) => {
  // & Process the main execution steps of DompetTabSection inside this function body.
  // % Memproses langkah eksekusi utama DompetTabSection di dalam body fungsi ini.
  return (
    <section className="mb-6 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
      {DOMPET_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChangeTab(tab.key)}
          className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === tab.key
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          {TAB_ICONS[tab.key]}
          {tab.label}
        </button>
      ))}
    </section>
  );
};

export default DompetTabSection;
