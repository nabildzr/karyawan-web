import type { PointLedgerEntry } from "../../../../../types/integrity.types";

export type LeaderboardRecentActivityProps = {
  logsLoading: boolean;
  recentLogs: PointLedgerEntry[];
};