import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useIntegrityLogs } from "../../../../../hooks/useIntegrity";
import type { IntegrityQueryParams } from "../../../../../services/integrity.service";
import type { TimeFilterKey, TransactionTypeFilter } from "../types";
import { INTEGRITY_LOGS_PAGE_LIMIT } from "../utils/constants";
import { buildCsvFromLogs, buildPageNumbers } from "../utils/utils";

export function useIntegrityLogsPage() {
  const { logs, meta, loading, error, fetchAll } = useIntegrityLogs();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterKey>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<TransactionTypeFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const safeLogs = Array.isArray(logs) ? logs : [];

  const timeRange = useMemo<{
    startDate?: string;
    endDate?: string;
  }>(() => {
    if (activeTimeFilter === "all") return {};

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  }, [activeTimeFilter]);

  const buildQuery = (page: number): IntegrityQueryParams => {
    const query: IntegrityQueryParams = {
      page,
      limit: INTEGRITY_LOGS_PAGE_LIMIT,
    };

    if (transactionTypeFilter !== "ALL") {
      query.transactionType = transactionTypeFilter;
    }

    if (searchKeyword.trim()) {
      query.search = searchKeyword.trim();
    }

    if (timeRange.startDate) {
      query.startDate = timeRange.startDate;
    }

    if (timeRange.endDate) {
      query.endDate = timeRange.endDate;
    }

    return query;
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchAll(buildQuery(1));
  }, [
    fetchAll,
    searchKeyword,
    transactionTypeFilter,
    timeRange.startDate,
    timeRange.endDate,
  ]);

  useEffect(() => {
    if (meta?.page && meta.page !== currentPage) {
      setCurrentPage(meta.page);
    }
  }, [meta?.page, currentPage]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, page);
    setCurrentPage(nextPage);
    fetchAll(buildQuery(nextPage));
  };

  const handleApplySearch = () => {
    setSearchKeyword(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchKeyword("");
    setTransactionTypeFilter("ALL");
    setActiveTimeFilter("all");
  };

  const handleRefresh = () => {
    fetchAll(buildQuery(currentPage));
  };

  const handleExportCsv = () => {
    if (!safeLogs.length) {
      toast.info("Tidak ada data untuk diekspor.");
      return;
    }

    const csv = buildCsvFromLogs(safeLogs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `integrity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV berhasil diunduh.");
  };

  const totalIssued = safeLogs
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalDeducted = safeLogs
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

  const uniqueUsers = new Set(safeLogs.map((entry) => entry.userId)).size;

  const totalLogs = meta?.total ?? safeLogs.length;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(totalLogs / INTEGRITY_LOGS_PAGE_LIMIT));
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return {
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
    limit: INTEGRITY_LOGS_PAGE_LIMIT,
    handlePageChange,
    handleApplySearch,
    handleResetFilters,
    handleRefresh,
    handleExportCsv,
  };
}