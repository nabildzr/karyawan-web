// * Dashboard widget: grafik batang absensi bulanan per-bulan.
// * Renamed & rethemed from MonthlySalesChart.tsx.

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

interface Props {
  /** Jumlah hadir per-bulan (12 angka). Kosong = placeholder nol. */
  presentData?: number[];
  lateData?: number[];
}

export default function MonthlyAttendanceChart({ presentData, lateData }: Props) {
  const series = [
    { name: "Hadir", data: presentData ?? Array(12).fill(0) },
    { name: "Terlambat", data: lateData ?? Array(12).fill(0) },
  ];

  const options: ApexOptions = {
    colors: ["#22c55e", "#f59e0b"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
      stacked: false,
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "42%", borderRadius: 4, borderRadiusApplication: "end" },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 3, colors: ["transparent"] },
    xaxis: {
      categories: MONTHS,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: true, position: "top", horizontalAlign: "left", fontFamily: "Outfit" },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val} orang` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        Absensi Bulanan
      </h3>
      <p className="mb-3 text-theme-sm text-gray-500 dark:text-gray-400">
        Rekap hadir dan terlambat per bulan tahun ini
      </p>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
