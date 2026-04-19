import { Gift, Trophy } from "lucide-react";
import { Link } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import type { PaginationMeta } from "../../../components/tables/DataTables/DataTableOnline";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import {
  DASHBOARD_RULES_SEARCH_PLACEHOLDER,
  DASHBOARD_RULES_TABLE_COLUMNS,
} from "./AturanPoin/utils/constants";
import {
  DashboardSummaryCards,
  DashboardTabs,
} from "./DompetIntegritasDashboard/components";
import { useDompetIntegritasDashboardPage } from "./DompetIntegritasDashboard/hooks";
import { getInitials } from "./DompetIntegritasDashboard/utils";
import {
  DASHBOARD_MARKETPLACE_SEARCH_PLACEHOLDER,
  DASHBOARD_MARKETPLACE_TABLE_COLUMNS,
} from "./ItemMarketplace/utils/constants";
import {
  DASHBOARD_LEADERBOARD_SEARCH_PLACEHOLDER,
  DASHBOARD_LEADERBOARD_TABLE_COLUMNS,
} from "./LeaderboardIntegritas/utils/constants";

export default function DompetIntegritasDashboard() {
  const {
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
  } = useDompetIntegritasDashboardPage();

  const rulesTableMeta: PaginationMeta = {
    total: rulesMeta?.total ?? 0,
    page: rulesMeta?.page ?? rulesQuery.page,
    limit: rulesMeta?.limit ?? rulesQuery.limit,
    totalPages: rulesMeta?.totalPages ?? 1,
  };

  const itemsTableMeta: PaginationMeta = {
    total: itemsMeta?.total ?? 0,
    page: itemsMeta?.page ?? itemsQuery.page,
    limit: itemsMeta?.limit ?? itemsQuery.limit,
    totalPages: itemsMeta?.totalPages ?? 1,
  };

  const leaderboardTableMeta: PaginationMeta = {
    total: leaderboardMeta?.total ?? 0,
    page: leaderboardMeta?.page ?? leaderboardQuery.page,
    limit: leaderboardMeta?.limit ?? leaderboardQuery.limit,
    totalPages: leaderboardMeta?.totalPages ?? 1,
  };

  return (
    <>
      <PageMeta
        title="Dompet Integritas"
        description="Overview manajemen dompet integritas"
      />
      <PageBreadcrumb pageTitle="Dompet Integritas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Dompet Integritas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview aturan poin, marketplace, dan leaderboard integritas
          </p>
        </div>

        <DashboardSummaryCards
          totalPoints={totalPoints}
          activeRules={activeRules}
          totalItems={itemsMeta?.total ?? 0}
          tokenCirculation={leaderboardMeta?.total ?? safeLeaderboard.length}
        />

        <DashboardTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {activeTab === "rules" && (
              <div className="space-y-3">
                <h3 className="px-1 text-base font-semibold text-gray-900 dark:text-white">
                  Daftar Aturan Poin
                </h3>
                <DataTableOnline
                  columns={DASHBOARD_RULES_TABLE_COLUMNS}
                  data={safeRules}
                  meta={rulesTableMeta}
                  loading={rulesLoading}
                  onQueryChange={handleRulesQueryChange}
                  searchPlaceholder={DASHBOARD_RULES_SEARCH_PLACEHOLDER}
                  showIndex={false}
                />
                <div className="px-1">
                  <Link
                    to="/admin/aturan-poin"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                  >
                    Lihat semua aturan →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "marketplace" && (
              <div className="space-y-3">
                <h3 className="px-1 text-base font-semibold text-gray-900 dark:text-white">
                  Katalog Item Marketplace
                </h3>
                <DataTableOnline
                  columns={DASHBOARD_MARKETPLACE_TABLE_COLUMNS}
                  data={safeItems}
                  meta={itemsTableMeta}
                  loading={itemsLoading}
                  onQueryChange={handleItemsQueryChange}
                  searchPlaceholder={DASHBOARD_MARKETPLACE_SEARCH_PLACEHOLDER}
                  showIndex={false}
                />
                <div className="px-1">
                  <Link
                    to="/admin/item-marketplace"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                  >
                    Lihat marketplace lengkap →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="space-y-3">
                <h3 className="px-1 font-semibold text-gray-900 dark:text-white">
                  <Trophy className="mr-2 inline h-5 w-5 text-yellow-500" />
                  Top Performers
                </h3>
                <DataTableOnline
                  columns={DASHBOARD_LEADERBOARD_TABLE_COLUMNS}
                  data={safeLeaderboard}
                  meta={leaderboardTableMeta}
                  loading={leaderboardLoading}
                  onQueryChange={handleLeaderboardQueryChange}
                  searchPlaceholder={DASHBOARD_LEADERBOARD_SEARCH_PLACEHOLDER}
                  showIndex={false}
                />
                <div className="px-1">
                  <Link
                    to="/admin/leaderboard-integritas"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                  >
                    Lihat Leaderboard Lengkap →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Marketplace Baru
                </h4>
                <Link
                  to="/admin/item-marketplace"
                  className="text-xs text-brand-500 hover:text-brand-600"
                >
                  Lihat Semua
                </Link>
              </div>
              <div className="space-y-3">
                {safeItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {item.itemName}
                      </p>
                      <p className="text-xs font-bold text-brand-500">
                        {item.pointCost} POIN
                      </p>
                    </div>
                  </div>
                ))}
                {safeItems.length === 0 && !itemsLoading && (
                  <p className="py-4 text-center text-sm text-gray-400">Belum ada item</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Top 5 Poin Tertinggi
                </h4>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                {safeLeaderboard.slice(0, 5).map((entry, index) => (
                  <div key={entry.userId} className="flex items-center gap-3">
                    <span className="w-5 text-center text-sm font-semibold text-gray-400">
                      {index + 1}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {getInitials(entry.name)}
                    </div>
                    <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                      {entry.name}
                    </p>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {entry.balance.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                {safeLeaderboard.length === 0 && !leaderboardLoading && (
                  <p className="py-4 text-center text-sm text-gray-400">Belum ada data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
