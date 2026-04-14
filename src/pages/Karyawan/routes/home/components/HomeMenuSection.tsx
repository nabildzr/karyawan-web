// * This file defines route module logic for src/pages/Karyawan/routes/home/components/HomeMenuSection.tsx.

import { MENU_CARDS } from "../../../utils/home/constants";

interface HomeMenuSectionProps {
  onMenuClick: (title: string) => void;
}

// & This function component/helper defines HomeMenuSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku HomeMenuSection untuk file route ini.
const HomeMenuSection = ({ onMenuClick }: HomeMenuSectionProps) => {
  // & Process the main execution steps of HomeMenuSection inside this function body.
  // % Memproses langkah eksekusi utama HomeMenuSection di dalam body fungsi ini.
  return (
    <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Menu Karyawan</h2>
        <span className="text-xs text-gray-500">Cepat</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MENU_CARDS.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onMenuClick(item.title)}
            className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50"
          >
            <p className="text-xs font-semibold text-gray-800">{item.title}</p>
            <p className="mt-1 text-[11px] leading-4 text-gray-500">{item.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default HomeMenuSection;
