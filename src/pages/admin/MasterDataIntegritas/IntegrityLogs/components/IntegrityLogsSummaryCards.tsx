import { Minus, Plus, TrendingUp, Users } from "lucide-react";

type IntegrityLogsSummaryCardsProps = {
  totalLogs: number;
  totalIssued: number;
  totalDeducted: number;
  uniqueUsers: number;
};

export function IntegrityLogsSummaryCards({
  totalLogs,
  totalIssued,
  totalDeducted,
  uniqueUsers,
}: IntegrityLogsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10">
            <TrendingUp className="h-5 w-5 text-brand-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">TOTAL LOGS</p>
              <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/10">
                +12.4%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalLogs.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-success-50 p-3 dark:bg-success-500/10">
            <Plus className="h-5 w-5 text-success-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">POINTS ISSUED</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalIssued > 1000
                ? `${(totalIssued / 1000).toFixed(1)}k`
                : totalIssued.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-error-50 p-3 dark:bg-error-500/10">
            <Minus className="h-5 w-5 text-error-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">POINTS DEDUCTED</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalDeducted.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-700">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">ACTIVE USERS</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {uniqueUsers.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}