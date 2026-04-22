// * This file defines route module logic for src/pages/Karyawan/routes/jadwal/components/ScheduleList.tsx.

import { useState } from "react";
import { Modal } from "../../../../../components/ui/modal";
import { STATUS_STYLE } from "../../../utils/jadwal/constants";
import type { ScheduleListProps } from "../types/JadwalTypes";
import ScheduleCard from "./ScheduleCard";

// & This function component/helper defines ScheduleList behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku ScheduleList untuk file route ini.
const ScheduleList = ({ title, weekData }: ScheduleListProps) => {
  // & Process the main execution steps of ScheduleList inside this function body.
  // % Memproses langkah eksekusi utama ScheduleList di dalam body fungsi ini.
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem =
    weekData.items.find((item) => item.id === selectedItemId) ?? null;
  const selectedStatusStyle = selectedItem
    ? STATUS_STYLE[selectedItem.status]
    : null;
  const totalWorkMinutes = weekData.items.reduce(
    (sum, item) => sum + (item.workDurationMinutes ?? 0),
    0,
  );
  const totalWorkHoursLabel =
    totalWorkMinutes > 0
      ? `${Math.floor(totalWorkMinutes / 60)} jam ${totalWorkMinutes % 60} menit`
      : null;

  return (
    <>
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3 border-b border-gray-300 pb-3">
          <h2 className="text-lg font-semibold tracking-wide text-blue-800">
            {title}
          </h2>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-700">
              {weekData.rangeLabel}
            </p>
            {totalWorkHoursLabel && (
              <p className="mt-1 text-xs font-semibold text-gray-500">
                Total estimasi kerja: {totalWorkHoursLabel}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {weekData.items.map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              onOpenDetail={(currentItem) => setSelectedItemId(currentItem.id)}
            />
          ))}
        </div>
      </section>

      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItemId(null)}
        className="max-w-md p-0 overflow-hidden"
      >
        {selectedItem && selectedStatusStyle && (
          <div className="bg-white dark:bg-gray-900">
            <div
              className={`border-b px-5 py-4 ${selectedStatusStyle.container}`}
            >
              <p
                className={`text-xs font-semibold tracking-wider ${selectedStatusStyle.dayText}`}
              >
                {selectedItem.dayShort} {selectedItem.dayNumber}
              </p>
              <h3
                className={`mt-1 text-lg font-bold ${selectedStatusStyle.titleText}`}
              >
                Detail Jadwal
              </h3>
            </div>

            <div className="space-y-3 px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Shift
                </p>
                <p className="mt-1 font-semibold">{selectedItem.shiftName}</p>
                <p className="text-gray-500">{selectedItem.shiftTime}</p>
              </div>

              {selectedItem.workDurationLabel && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Analitika
                  </p>
                  <p className="mt-1">
                    Estimasi jam kerja: {selectedItem.workDurationLabel}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Tanggal
                </p>
                <p className="mt-1">{selectedItem.dateLabel}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selectedStatusStyle.badge}`}
                >
                  {selectedStatusStyle.badgeText}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Catatan
                </p>
                <p className="mt-1">{selectedItem.description}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedItemId(null)}
                className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ScheduleList;
