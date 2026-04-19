import { Award, Coins, Package, Zap } from "lucide-react";
import type { DashboardSummaryCardsProps } from "../types";

export function DashboardSummaryCards({
  totalPoints,
  activeRules,
  totalItems,
  tokenCirculation,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10">
            <Coins className="h-5 w-5 text-brand-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Poin Beredar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalPoints.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-success-50 p-3 dark:bg-success-500/10">
            <Zap className="h-5 w-5 text-success-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aturan Aktif</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeRules}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-warning-50 p-3 dark:bg-warning-500/10">
            <Package className="h-5 w-5 text-warning-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Item Marketplace</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-500/10">
            <Award className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Token Beredar Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tokenCirculation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}