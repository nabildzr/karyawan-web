// * Dashboard widget: distribusi karyawan per divisi (pie/donut).
// * Renamed & rethemed from DemographicCard.tsx.

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface DivisiStat {
  name: string;
  count: number;
}

interface Props {
  divisions: DivisiStat[];
}

const COLORS = ["#465fff", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#f97316"];

export default function DivisiDistributionCard({ divisions }: Props) {
  const labels = divisions.map((d) => d.name);
  const series = divisions.map((d) => d.count);
  const total = series.reduce((a, b) => a + b, 0);

  const options: ApexOptions = {
    chart: { fontFamily: "Outfit, sans-serif", type: "donut" },
    colors: COLORS,
    labels,
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => `${total}`,
              color: "#374151",
              fontSize: "22px",
              fontWeight: 700,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val} karyawan` } },
    stroke: { width: 0 },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Distribusi Divisi</h3>
      <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Jumlah karyawan per divisi</p>

      {total === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-400">Belum ada data divisi.</p>
      ) : (
        <>
          <div className="mt-4">
            <Chart options={options} series={series} type="donut" height={220} />
          </div>
          <div className="mt-4 space-y-2">
            {divisions.slice(0, 5).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-800 dark:text-white/90">{d.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
