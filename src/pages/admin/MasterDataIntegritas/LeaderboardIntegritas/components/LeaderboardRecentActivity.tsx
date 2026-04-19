import type { LeaderboardRecentActivityProps } from "../types";

export function LeaderboardRecentActivity({ logsLoading, recentLogs }: LeaderboardRecentActivityProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Aktivitas Terkini</h3>
      <div className="space-y-4">
        {logsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`log-skel-${index}`}
              className="h-9 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            />
          ))
        ) : recentLogs.length > 0 ? (
          recentLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <div
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  log.amount >= 0 ? "bg-success-500" : "bg-error-500"
                }`}
              />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(log.createdAt).toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{log.user?.name ?? "Pengguna"}</span>{" "}
                  <span>{log.description ?? "melakukan transaksi poin"}</span>{" "}
                  <span
                    className={`font-bold ${
                      log.amount >= 0 ? "text-success-600" : "text-error-600"
                    }`}
                  >
                    {log.amount >= 0 ? "+" : ""}
                    {log.amount.toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">Belum ada aktivitas terbaru.</p>
        )}
      </div>
    </div>
  );
}