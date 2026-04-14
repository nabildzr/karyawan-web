// * This file defines route module logic for src/pages/Karyawan/routes/jadwal/components/HeaderSection.tsx.

import { CalendarCheck2 } from "lucide-react";
import type { HeaderSectionProps } from "../types/JadwalTypes";

// & This function component/helper defines HeaderSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku HeaderSection untuk file route ini.
const HeaderSection = ({ title, description }: HeaderSectionProps) => {
  // & Process the main execution steps of HeaderSection inside this function body.
  // % Memproses langkah eksekusi utama HeaderSection di dalam body fungsi ini.
  return (
    <header className="rounded-3xl border border-blue-100 bg-blue-50/80 p-5">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-white">
        <CalendarCheck2 size={18} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
      <p className="mt-2 max-w-[280px] text-sm text-gray-600">{description}</p>
    </header>
  );
};

export default HeaderSection;
