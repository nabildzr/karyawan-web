import { Download, Filter, RefreshCw, Search } from "lucide-react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { IntegrityLogsSummaryCards } from "./IntegrityLogs/components";
import {
  TIME_FILTER_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  TYPE_CONFIG,
} from "./IntegrityLogs/constants";
import { useIntegrityLogsPage } from "./IntegrityLogs/hooks";
import { formatDateTime, getUserInitials } from "./IntegrityLogs/utils";

export default function IntegrityLogs() {
  const {
    safeLogs,
    loading,
    error,
    currentPage,
    activeTimeFilter,
    setActiveTimeFilter,
    showFilters,
    setShowFilters,
    transactionTypeFilter,
    setTransactionTypeFilter,
    searchInput,
    setSearchInput,
    totalLogs,
    totalPages,
    pageNumbers,
    totalIssued,
    totalDeducted,
    uniqueUsers,
    limit,
    handlePageChange,
    handleApplySearch,
    handleResetFilters,
    handleRefresh,
    handleExportCsv,
  } = useIntegrityLogsPage();

  return (
    <>
      <PageMeta
        title="Integrity Logs"
        description="Audit trail transaksi poin integritas"
      />
      <PageBreadcrumb pageTitle="Integrity Logs" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Integrity Logs
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Audit trail of all behavioral point adjustments and marketplace
              transactions across the integrity system.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              {TIME_FILTER_OPTIONS.map((timeFilter) => (
                <button
                  key={timeFilter.key}
                  onClick={() => setActiveTimeFilter(timeFilter.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTimeFilter === timeFilter.key
                      ? "bg-error-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  {timeFilter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
          >
            <Filter size={16} />
            {showFilters ? "Sembunyikan Filter" : "Advanced Filters"}
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-error-200 bg-white px-4 py-2.5 text-sm font-medium text-error-600 transition-colors hover:bg-error-50 dark:border-error-500/30 dark:bg-gray-800 dark:text-error-400"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Keyword
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleApplySearch();
                        }
                      }}
                      placeholder="Cari nama, deskripsi, reference..."
                      className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-brand-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                    />
                  </div>

                  <button
                    onClick={handleApplySearch}
                    className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tipe Transaksi
                </label>
                <select
                  value={transactionTypeFilter}
                  onChange={(event) =>
                    setTransactionTypeFilter(
                      event.target.value as typeof transactionTypeFilter,
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                >
                  {TRANSACTION_TYPE_OPTIONS.map((transactionTypeOption) => (
                    <option
                      key={transactionTypeOption.value}
                      value={transactionTypeOption.value}
                    >
                      {transactionTypeOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        )}

        <IntegrityLogsSummaryCards
          totalLogs={totalLogs}
          totalIssued={totalIssued}
          totalDeducted={totalDeducted}
          uniqueUsers={uniqueUsers}
        />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Transaction History
            </h3>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Timestamp
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    User Entity
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Action & Category
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Reference ID
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Points Change
                  </th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skel-${index}`}>
                      {Array.from({ length: 6 }).map((__, innerIndex) => (
                        <td key={innerIndex} className="px-6 py-4">
                          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : safeLogs.length > 0 ? (
                  safeLogs.map((entry) => {
                    const typeCfg = TYPE_CONFIG[entry.transactionType] ?? TYPE_CONFIG.EARN;
                    return (
                      <tr
                        key={entry.id}
                        className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {formatDateTime(entry.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-500/20">
                              {getUserInitials(entry)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {entry.user?.name ?? entry.userId.substring(0, 8)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {entry.user?.email ?? "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {entry.description ?? "Point Transaction"}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeCfg.cls}`}
                          >
                            {typeCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                            {(entry.referenceId ?? entry.id).substring(0, 16)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-sm font-bold ${
                              entry.amount > 0
                                ? "text-success-600 dark:text-success-400"
                                : "text-error-600 dark:text-error-400"
                            }`}
                          >
                            {entry.amount > 0 ? "+" : ""}
                            {entry.amount.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600 dark:bg-success-500/10 dark:text-success-400">
                            SUCCESS
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      Tidak ada log transaksi ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {totalLogs ? (currentPage - 1) * limit + 1 : 0}
              </span>
              {" to "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {Math.min(currentPage * limit, totalLogs)}
              </span>
              {" of "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {totalLogs.toLocaleString("id-ID")}
              </span>
              {" entries"}
            </p>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {pageNumbers.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`d-${index}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-brand-500 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
