import { Zap } from "lucide-react";

type AturanPoinSummaryCardsProps = {
  totalRules: number;
  totalActive: number;
  totalDistributed: number;
};

export function AturanPoinSummaryCards({
  totalRules,
  totalActive,
  totalDistributed,
}: AturanPoinSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
            <Zap className="h-6 w-6 text-brand-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">TOTAL ATURAN</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRules}</p>
              {totalActive > 0 && (
                <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/10 dark:text-success-400">
                  {totalActive} aktif
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10">
            <svg
              className="h-6 w-6 text-success-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">TARGET TERAKTIF</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Karyawan</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 dark:bg-warning-500/10">
            <svg
              className="h-6 w-6 text-warning-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">POIN TERDISTRIBUSI</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalDistributed.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}