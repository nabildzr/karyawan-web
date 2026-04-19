import { useEffect, useMemo, useState } from "react";
import { useIntegrityLogs, useLeaderboard } from "../../../../../hooks/useIntegrity";
import {
  MAX_VISIBLE_PAGE_BUTTONS,
  RECENT_LOG_LIMIT,
  TABLE_PAGE_SIZE,
  TOP_COUNT,
} from "../utils/constants";
import { buildVisiblePages, getLevelDistribution } from "../utils/utils";

export function useLeaderboardIntegritasPage() {
  const {
    entries: topEntries,
    loading: topLoading,
    error: topError,
    fetchAll: fetchTopLeaderboard,
  } = useLeaderboard();

  const {
    entries: tableEntries,
    meta: tableMeta,
    loading: tableLoading,
    error: tableError,
    fetchAll: fetchTableLeaderboard,
  } = useLeaderboard();

  const {
    logs: recentLogs,
    loading: logsLoading,
    fetchAll: fetchRecentLogs,
  } = useIntegrityLogs();

  const [currentPage, setCurrentPage] = useState(1);

  const safeTopEntries = Array.isArray(topEntries) ? topEntries : [];
  const safeTableEntries = Array.isArray(tableEntries) ? tableEntries : [];

  useEffect(() => {
    fetchTopLeaderboard({ page: 1, limit: TOP_COUNT, skip: 0 });
  }, [fetchTopLeaderboard]);

  useEffect(() => {
    const skip = TOP_COUNT + (currentPage - 1) * TABLE_PAGE_SIZE;
    fetchTableLeaderboard({
      page: currentPage,
      limit: TABLE_PAGE_SIZE,
      skip,
    });
  }, [currentPage, fetchTableLeaderboard]);

  useEffect(() => {
    fetchRecentLogs({ page: 1, limit: RECENT_LOG_LIMIT });
  }, [fetchRecentLogs]);

  const totalParticipants = Number(tableMeta?.total ?? safeTopEntries.length);
  const totalRestParticipants = Math.max(0, totalParticipants - TOP_COUNT);
  const totalPages = Math.max(1, Math.ceil(totalRestParticipants / TABLE_PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
  };

  const top3 = safeTopEntries.slice(0, TOP_COUNT);
  const rest = safeTableEntries;
  const pageError = topError ?? tableError;
  const isTableLoading = tableLoading;

  const visiblePages = buildVisiblePages(
    currentPage,
    totalPages,
    MAX_VISIBLE_PAGE_BUTTONS,
  );

  const levelDistribution = useMemo(
    () => getLevelDistribution([...safeTopEntries, ...safeTableEntries]),
    [safeTopEntries, safeTableEntries],
  );

  return {
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
    topCount: TOP_COUNT,
    tablePageSize: TABLE_PAGE_SIZE,
    handlePageChange,
  };
}