// * Dashboard widget: tabel top operator berdasarkan response time tercepat.
// * Konsisten dengan RecentAttendance.tsx — Table components.

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { OperatorMetric } from "../../../../types/helpdesk.types";

interface Props {
  metrics: OperatorMetric[];
}

function fmtMins(m: number | null) {
  if (m === null) return <span className="text-gray-400">—</span>;
  if (m < 60) return `${m} menit`;
  return `${Math.floor(m / 60)}j ${m % 60}m`;
}

function RankBadge({ rank }: { rank: number }) {
  const colors = [
    "bg-amber-400/20 text-amber-500",
    "bg-gray-400/20 text-gray-400",
    "bg-orange-400/20 text-orange-400",
  ];
  return (
    <span
      className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold ${colors[rank] ?? "bg-gray-100/10 text-gray-500 dark:text-gray-400"}`}
    >
      {rank + 1}
    </span>
  );
}

export default function TopOperatorTable({ metrics }: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Operator
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Diurutkan berdasarkan response time tercepat
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/helpdesk")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Lihat Semua Tiket
        </button>
      </div>

      {metrics.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Belum ada data operator.
        </p>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                {["#", "Operator", "NIP", "Tiket Ditangani", "Avg Response", "Avg Resolution"].map((h) => (
                  <TableCell
                    key={h}
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {metrics.slice(0, 10).map((op, i) => (
                <TableRow key={op.operatorId}>
                  <TableCell className="py-3">
                    <RankBadge rank={i} />
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {op.operatorName}
                    </p>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {op.nip}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-400">
                      {op.totalHandled} tiket
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300 font-medium">
                    {fmtMins(op.avgResponseMinutes)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {fmtMins(op.avgResolutionMinutes)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
