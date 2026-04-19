import { useCallback, useEffect, useState } from "react";
import {
  useFlexibilityItems,
  useLeaderboard,
  usePointRules,
} from "../../../../../hooks/useIntegrity";
import type { DashboardTabKey } from "../types";
import {
  ITEMS_PAGE_SIZE,
  LEADERBOARD_PAGE_SIZE,
  RULES_PAGE_SIZE,
} from "../utils/constants";

type TableQuery = {
  page: number;
  limit: number;
  search: string;
};

const TABLE_LIMIT_OPTIONS = [5, 10, 25, 50, 100] as const;

const normalizeLimit = (limit: number): number => {
  const numericLimit = Math.max(1, Math.trunc(limit));
  return TABLE_LIMIT_OPTIONS.includes(numericLimit as (typeof TABLE_LIMIT_OPTIONS)[number])
    ? numericLimit
    : 10;
};

const createDefaultQuery = (limit: number): TableQuery => ({
  page: 1,
  limit: normalizeLimit(limit),
  search: "",
});

const normalizeQuery = (params: TableQuery): TableQuery => ({
  page: Math.max(1, params.page),
  limit: normalizeLimit(params.limit),
  search: params.search ?? "",
});

export function useDompetIntegritasDashboardPage() {
  const {
    rules,
    meta: rulesMeta,
    loading: rulesLoading,
    fetchAll: fetchRules,
  } = usePointRules();

  const {
    items,
    meta: itemsMeta,
    loading: itemsLoading,
    fetchAll: fetchItems,
  } = useFlexibilityItems();

  const {
    entries: leaderboard,
    meta: leaderboardMeta,
    loading: leaderboardLoading,
    fetchAll: fetchLeaderboard,
  } = useLeaderboard();

  const [rulesQuery, setRulesQuery] = useState<TableQuery>(
    createDefaultQuery(RULES_PAGE_SIZE),
  );
  const [itemsQuery, setItemsQuery] = useState<TableQuery>(
    createDefaultQuery(ITEMS_PAGE_SIZE),
  );
  const [leaderboardQuery, setLeaderboardQuery] = useState<TableQuery>(
    createDefaultQuery(LEADERBOARD_PAGE_SIZE),
  );
  const [activeTab, setActiveTab] = useState<DashboardTabKey>("rules");

  const safeRules = Array.isArray(rules) ? rules : [];
  const safeItems = Array.isArray(items) ? items : [];
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];

  useEffect(() => {
    fetchRules(rulesQuery);
  }, [fetchRules, rulesQuery]);

  useEffect(() => {
    fetchItems(itemsQuery);
  }, [fetchItems, itemsQuery]);

  useEffect(() => {
    fetchLeaderboard(leaderboardQuery);
  }, [fetchLeaderboard, leaderboardQuery]);

  const handleRulesQueryChange = useCallback((params: TableQuery) => {
    setRulesQuery(normalizeQuery(params));
  }, []);

  const handleItemsQueryChange = useCallback((params: TableQuery) => {
    setItemsQuery(normalizeQuery(params));
  }, []);

  const handleLeaderboardQueryChange = useCallback((params: TableQuery) => {
    setLeaderboardQuery(normalizeQuery(params));
  }, []);

  const totalPoints = safeLeaderboard.reduce(
    (sum, entry) => sum + entry.balance,
    0,
  );

  const activeRules = safeRules.filter((rule) => rule.isActive).length;

  return {
    rulesMeta,
    rulesLoading,
    itemsMeta,
    itemsLoading,
    leaderboardMeta,
    leaderboardLoading,
    rulesQuery,
    itemsQuery,
    leaderboardQuery,
    handleRulesQueryChange,
    handleItemsQueryChange,
    handleLeaderboardQueryChange,
    activeTab,
    setActiveTab,
    safeRules,
    safeItems,
    safeLeaderboard,
    totalPoints,
    activeRules,
  };
}