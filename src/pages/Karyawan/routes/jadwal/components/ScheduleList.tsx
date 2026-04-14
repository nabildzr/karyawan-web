// * This file defines route module logic for src/pages/Karyawan/routes/jadwal/components/ScheduleList.tsx.

import type { ScheduleListProps } from "../types/JadwalTypes";
import ScheduleCard from "./ScheduleCard";

// & This function component/helper defines ScheduleList behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku ScheduleList untuk file route ini.
const ScheduleList = ({ title, weekData }: ScheduleListProps) => {
  // & Process the main execution steps of ScheduleList inside this function body.
  // % Memproses langkah eksekusi utama ScheduleList di dalam body fungsi ini.
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-gray-300 pb-3">
        <h2 className="text-lg font-semibold tracking-wide text-blue-800">{title}</h2>
        <p className="text-xs font-medium text-gray-700">{weekData.rangeLabel}</p>
      </div>

      <div className="space-y-3">
        {weekData.items.map((item) => (
          <ScheduleCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default ScheduleList;
