import { Crown } from "lucide-react";
import type { LeaderboardChampionSectionProps } from "../types";
import { getInitials } from "../utils/utils";

export function LeaderboardChampionSection({ top3 }: LeaderboardChampionSectionProps) {
  if (!top3.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
        <Crown className="mr-2 inline h-5 w-5 text-yellow-500" />
        Champion Bulanan
      </h2>

      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-end">
        {top3[1] && (
          <div className="order-1 flex flex-col items-center sm:order-none">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 text-xl font-bold text-gray-600 dark:from-gray-600 dark:to-gray-700 dark:text-gray-300">
                {getInitials(top3[1].name)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white shadow-lg">
                2
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{top3[1].name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{top3[1].position ?? "-"}</p>
            <p className="mt-1 text-lg font-bold text-brand-600 dark:text-brand-400">
              {top3[1].balance.toLocaleString("id-ID")} pts
            </p>
          </div>
        )}

        {top3[0] && (
          <div className="order-0 flex flex-col items-center sm:order-none">
            <div className="relative">
              <Crown className="absolute -top-6 left-1/2 h-8 w-8 -translate-x-1/2 text-yellow-400" />
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 text-2xl font-bold text-yellow-700 shadow-xl shadow-yellow-400/20 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-400">
                {getInitials(top3[0].name)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-white shadow-lg">
                1
              </div>
            </div>
            <p className="mt-4 text-base font-bold text-gray-900 dark:text-white">{top3[0].name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{top3[0].position ?? "-"}</p>
            <div className="mt-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-1.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
              {top3[0].balance.toLocaleString("id-ID")} pts
            </div>
          </div>
        )}

        {top3[2] && (
          <div className="order-2 flex flex-col items-center sm:order-none">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 text-xl font-bold text-amber-700 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-400">
                {getInitials(top3[2].name)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white shadow-lg">
                3
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{top3[2].name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{top3[2].position ?? "-"}</p>
            <p className="mt-1 text-lg font-bold text-warning-600 dark:text-warning-400">
              {top3[2].balance.toLocaleString("id-ID")} pts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}