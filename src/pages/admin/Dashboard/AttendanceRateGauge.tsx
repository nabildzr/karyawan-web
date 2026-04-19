// * Dashboard widget: radial gauge tingkat kehadiran bulan ini.
// * Renamed & rethemed from MonthlyTarget.tsx.

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { AttendanceStats } from "../../../types/attendances.types";

interface Props {
  stats: AttendanceStats;
}

export default function AttendanceRateGauge({ stats }: Props) {
  const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const lateRate = stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0;
  const absentRate = stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0;

  const color = rate >= 80 ? "#22c55e" : rate >= 60 ? "#f59e0b" : "#ef4444";

  const options: ApexOptions = {
    colors: [color],
    chart: { fontFamily: "Outfit, sans-serif", type: "radialBar", height: 300, sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: [color] },
    stroke: { lineCap: "round" },
    labels: ["Tingkat Hadir"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-8 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Tingkat Kehadiran</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Persentase hadir dari total karyawan hari ini</p>
        </div>
        <div className="relative max-h-[300px]" id="chartDarkStyle">
          <Chart options={options} series={[rate]} type="radialBar" height={300} />
        </div>
        <p className="mx-auto mt-4 w-full max-w-[340px] text-center text-sm text-gray-500">
          {rate >= 80
            ? "Kehadiran sangat baik hari ini! Pertahankan."
            : rate >= 60
            ? "Kehadiran cukup, masih ada yang perlu ditingkatkan."
            : "Kehadiran rendah hari ini, perlu perhatian."}
        </p>
      </div>
      <div className="flex items-center justify-center gap-8 px-6 py-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Terlambat</p>
          <p className="text-base font-semibold text-yellow-500">{lateRate}%</p>
        </div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800" />
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Hadir</p>
          <p className="text-base font-semibold text-green-500">{rate}%</p>
        </div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800" />
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Alpa</p>
          <p className="text-base font-semibold text-red-500">{absentRate}%</p>
        </div>
      </div>
    </div>
  );
}
