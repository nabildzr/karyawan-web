// * Dashboard widget: donut chart distribusi rating kepuasan.
// * Konsisten dengan DivisiDistributionCard.tsx (ApexCharts donut).

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { RatingDistribution } from "../../../../types/helpdesk.types";

interface Props {
  distribution: RatingDistribution[];
  avgRating: number | null;
}

const STAR_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"];
const STAR_LABELS = ["⭐ 1", "⭐ 2", "⭐ 3", "⭐ 4", "⭐ 5"];

export default function RatingDonutChart({ distribution, avgRating }: Props) {
  // Sort score 1..5
  const sorted = [...distribution].sort((a, b) => a.score - b.score);
  const series = sorted.map((r) => r.count);
  const total = series.reduce((a, b) => a + b, 0);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      background: "transparent",
    },
    colors: STAR_COLORS,
    labels: STAR_LABELS,
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: avgRating !== null ? `${avgRating.toFixed(1)} ★` : "Rating",
              formatter: () => `${total} ulasan`,
              color: "#9ca3af",
              fontSize: "14px",
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => `${v} ulasan` },
    },
    stroke: { width: 0 },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Rating Kepuasan
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Distribusi skor kepuasan tiket tertutup
      </p>

      {total === 0 ? (
        <p className="mt-8 py-8 text-center text-sm text-gray-400">
          Belum ada rating.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <Chart options={options} series={series} type="donut" height={220} />
          </div>
          <div className="mt-4 space-y-2">
            {sorted.map((r, i) => (
              <div key={r.score} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ background: STAR_COLORS[i % 5] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {r.score} Bintang
                  </span>
                </div>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
