import { Link } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  LeaderboardChampionSection,
  LeaderboardRecentActivity,
} from "./LeaderboardIntegritas/components";
import { useLeaderboardIntegritasPage } from "./LeaderboardIntegritas/hooks";
import { getConsistency, getInitials } from "./LeaderboardIntegritas/utils";

export default function LeaderboardIntegritas() {
  const {
    topLoading,
    logsLoading,
    recentLogs,
    currentPage,
    totalPages,
    totalRestParticipants,
    top3,
    rest,
    pageError,
    isTableLoading,
    visiblePages,
    levelDistribution,
    topCount,
    tablePageSize,
    handlePageChange,
  } = useLeaderboardIntegritasPage();

  return (
    <>
      <PageMeta
        title="Leaderboard Integritas"
        description="Peringkat poin integritas karyawan"
      />
      <PageBreadcrumb pageTitle="Leaderboard Integritas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leaderboard Integritas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Peforma integritas tertinggi periode bulan ini
          </p>
        </div>

        {pageError && (
          <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {pageError}
          </div>
        )}

        {!topLoading && <LeaderboardChampionSection top3={top3} />}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Dibawah peringkat 3
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                        Karyawan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                        Konsistensi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                        Poin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {isTableLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={`skel-${index}`}>
                          {Array.from({ length: 4 }).map((__, innerIndex) => (
                            <td key={innerIndex} className="px-6 py-4">
                              <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : rest.length > 0 ? (
                      rest.map((entry, index) => {
                        const rank =
                          Number(entry.rank) ||
                          topCount + (currentPage - 1) * tablePageSize + index + 1;
                        const consistency = getConsistency(entry.balance);
                        const isNegative = entry.balance < 0;

                        return (
                          <tr
                            key={entry.userId}
                            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-400">
                              {String(rank).padStart(2, "0")}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                  {getInitials(entry.name)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {entry.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {entry.division ?? entry.position ?? "-"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      isNegative
                                        ? "bg-error-500"
                                        : consistency === 0
                                          ? "bg-gray-400"
                                          : "bg-brand-500"
                                    }`}
                                    style={{ width: `${consistency}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`text-sm font-bold ${
                                  isNegative
                                    ? "text-error-600 dark:text-error-400"
                                    : entry.balance === 0
                                      ? "text-gray-400 dark:text-gray-500"
                                      : "text-brand-600 dark:text-brand-400"
                                }`}
                              >
                                {entry.balance.toLocaleString("id-ID")}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          {top3.length > 0
                            ? "Hanya ada 3 entry atau kurang"
                            : "Belum ada data leaderboard"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalRestParticipants > 0 && totalPages > 1 && (
                <div className="flex justify-center border-t border-gray-100 px-6 py-4 dark:border-gray-700">
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                      ‹
                    </button>
                    {visiblePages.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                          currentPage === pageNumber
                            ? "bg-brand-500 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                      ›
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Distribusi Skor
              </h3>
              <div className="space-y-4">
                {levelDistribution
                  .filter((level) => level.count > 0 || level.key === "BRONZE")
                  .slice(0, 4)
                  .map((level) => (
                    <div key={level.key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{ color: level.color }}
                        >
                          {level.label} ({level.minPoints}+)
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {level.percent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${level.percent}%`,
                            backgroundColor: level.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <LeaderboardRecentActivity
              logsLoading={logsLoading}
              recentLogs={recentLogs}
            />

            <Link
              to="/admin/integrity-logs"
              className="block w-full rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
            >
              Lihat Log Lengkap
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
