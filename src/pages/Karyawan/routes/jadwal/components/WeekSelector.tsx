// * This file defines route module logic for src/pages/Karyawan/routes/jadwal/components/WeekSelector.tsx.

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WeekSelectorProps } from "../types/JadwalTypes";

// & This function component/helper defines WeekSelector behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku WeekSelector untuk file route ini.
const WeekSelector = ({
  selectedMonth,
  monthOptions,
  selectedWeek,
  weeks,
  disabled,
  onMonthChange,
  onWeekChange,
}: WeekSelectorProps) => {
  // & Process the main execution steps of WeekSelector inside this function body.
  // % Memproses langkah eksekusi utama WeekSelector di dalam body fungsi ini.
  const maxWeek = weeks.length;

  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-xs">
      <div className="flex items-center gap-3">
        <label htmlFor="month-selector" className="sr-only">
          Pilih bulan jadwal
        </label>
        <select
          id="month-selector"
          value={selectedMonth}
          onChange={(event) => onMonthChange(event.target.value)}
          disabled={disabled}
          className="h-11 rounded-2xl border border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => onWeekChange(Math.max(1, selectedWeek - 1))}
            disabled={disabled || selectedWeek <= 1}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600 transition enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onWeekChange(Math.min(maxWeek, selectedWeek + 1))}
            disabled={disabled || selectedWeek >= maxWeek}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600 transition enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-3 max-h-16 overflow-x-auto overflow-y-hidden no-scrollbar">
        <div className="flex min-w-max items-center gap-2 pr-1">
          {weeks.map((week) => {
            const isActive = selectedWeek === week.weekNumber;

            return (
              <button
                key={week.weekNumber}
                type="button"
                onClick={() => onWeekChange(week.weekNumber)}
                disabled={disabled}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? "border-blue-800 bg-blue-800 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                Minggu {week.weekNumber}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeekSelector;
