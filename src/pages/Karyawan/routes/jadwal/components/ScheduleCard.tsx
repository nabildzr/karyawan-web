// * This file defines route module logic for src/pages/Karyawan/routes/jadwal/components/ScheduleCard.tsx.

import { AlertOctagon } from "lucide-react";
import { STATUS_STYLE } from "../../../utils/jadwal/constants";
import type { ScheduleCardProps } from "../types/JadwalTypes";

// & This function component/helper defines ScheduleCard behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku ScheduleCard untuk file route ini.
const ScheduleCard = ({ item }: ScheduleCardProps) => {
  // & Process the main execution steps of ScheduleCard inside this function body.
  // % Memproses langkah eksekusi utama ScheduleCard di dalam body fungsi ini.
  const statusStyle = STATUS_STYLE[item.status];

  return (
    <article className={`rounded-2xl border p-4 transition ${statusStyle.container}`}>
      <div className="flex items-start gap-4">
        <div className="min-w-[64px] border-r border-gray-200 pr-4 text-center">
          <p className={`text-xs font-semibold tracking-wider ${statusStyle.dayText}`}>{item.dayShort}</p>
          <p className={`text-4xl font-bold leading-none ${statusStyle.dayText}`}>{item.dayNumber}</p>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className={`text-lg font-semibold ${statusStyle.titleText}`}>{item.shiftName}</h3>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle.badge}`}>
                {statusStyle.badgeText}
              </span>
              {statusStyle.showAlertIcon && (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-red-700">
                  <AlertOctagon size={16} />
                </span>
              )}
            </div>
          </div>

          <p className={`text-base ${statusStyle.bodyText}`}>{item.shiftTime}</p>
          <p className={`mt-1 text-xs ${statusStyle.bodyText}`}>{item.dateLabel}</p>
          <p className={`mt-2 text-sm ${statusStyle.bodyText}`}>{item.description}</p>
        </div>
      </div>
    </article>
  );
};

export default ScheduleCard;
