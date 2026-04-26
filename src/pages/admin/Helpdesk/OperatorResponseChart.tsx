// * Dashboard widget: bar chart avg response time per operator.
// * Menggunakan react-apexcharts konsisten dengan chart lain di project.

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { OperatorMetric } from "../../../types/helpdesk.types";

interface Props {
  metrics: OperatorMetric[];
}

function fmtMins(m: number | null) {
  if (m === null) return "-";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}j ${m % 60}m`;
}

export default function OperatorResponseChart({ metrics }: Props) {
  const top = metrics.slice(0, 8); // Ambil top 8 operator

  const categories = top.map((op) => op.operatorName);
  const responseSeries = top.map((op) => op.avgResponseMinutes ?? 0);
  const resolutionSeries = top.map((op) => op.avgResolutionMinutes ?? 0);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
    },
    colors: ["#465fff", "#22c55e"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#9ca3af", fontSize: "12px" },
        rotate: -30,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontSize: "12px" },
        formatter: (v) => fmtMins(v),
      },
    },
    legend: {
      position: "top",
      labels: { colors: "#9ca3af" },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => fmtMins(v) },
    },
  };

  const series = [
    { name: "Avg Response Time", data: responseSeries },
    { name: "Avg Resolution Time", data: resolutionSeries },
  ];

  if (top.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Performa Operator
        </h3>
        <p className="mt-8 text-center text-sm text-gray-400 py-8">
          Belum ada data operator.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Performa Operator
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Rata-rata response & resolution time per operator (menit)
      </p>
      <div className="mt-4">
        <Chart options={options} series={series} type="bar" height={260} />
      </div>
    </div>
  );
}
