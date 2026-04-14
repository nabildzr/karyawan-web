// * This file defines route module logic for src/pages/Karyawan/routes/home/components/HomeSummaryCardsSection.tsx.

import { toneClass } from "../../../utils/home/metrics";
import type { HomeSummaryCard } from "../../../utils/home/types";

interface HomeSummaryCardsSectionProps {
  summaryCards: HomeSummaryCard[];
}

// & This function component/helper defines HomeSummaryCardsSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku HomeSummaryCardsSection untuk file route ini.
const HomeSummaryCardsSection = ({ summaryCards }: HomeSummaryCardsSectionProps) => {
  // & Process the main execution steps of HomeSummaryCardsSection inside this function body.
  // % Memproses langkah eksekusi utama HomeSummaryCardsSection di dalam body fungsi ini.
  return (
    <section className="mb-4 grid grid-cols-2 gap-3">
      {summaryCards.map((item) => (
        <article
          key={item.label}
          className="rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-xs"
        >
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-800">{item.value}</p>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneClass(
              item.tone,
            )}`}
          >
            {item.hint}
          </span>
        </article>
      ))}
    </section>
  );
};

export default HomeSummaryCardsSection;
