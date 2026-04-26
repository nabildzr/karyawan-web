// * Page: Admin Helpdesk Dashboard
// * Orchestrator tipis — semua logika di hook, sub-komponen terpisah.
// * RBAC: hanya ADMIN (hasPermission "helpdesk_dashboard" READ).

import PageMeta from "../../../components/common/PageMeta";
import { useAuthContext } from "../../../context/AuthContext";
import { useHelpdeskDashboard } from "../../../hooks/useHelpdeskDashboard";
import HelpdeskStatCards from "./HelpdeskStatCards";
import OperatorResponseChart from "./OperatorResponseChart";
import RatingDonutChart from "./RatingDonutChart";
import TopOperatorTable from "./TopOperatorTable";

const EMPTY_STATS = { total: 0, open: 0, inProgress: 0, closed: 0 };

export default function HelpdeskDashboardPage() {
  const { hasPermission } = useAuthContext();

  // Guard RBAC — hanya role dengan permission helpdesk_dashboard:READ
  const canView = hasPermission("helpdesk_dashboard", "READ");

  const { data, isLoading } = useHelpdeskDashboard();

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3">
        <svg className="size-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Akses ditolak — butuh permission <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">helpdesk_dashboard:READ</code>
        </p>
      </div>
    );
  }

  const stats = data?.stats ?? EMPTY_STATS;
  const operatorMetrics = data?.operatorMetrics ?? [];
  const ratingDistribution = data?.ratingDistribution ?? [];
  const avgRating = data?.avgRatingOverall ?? null;

  return (
    <>
      <PageMeta
        title="Helpdesk Dashboard | Admin"
        description="Dashboard statistik helpdesk — tiket, performa operator, dan rating kepuasan."
      />

      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-5 text-white shadow-lg">
        <h1 className="text-xl font-bold">Dashboard Helpdesk</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Statistik tiket · performa operator · rating kepuasan
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Stat cards — full width */}
          <div className="col-span-12">
            <HelpdeskStatCards stats={stats} />
          </div>

          {/* Bar chart response time — 7/12 */}
          <div className="col-span-12 xl:col-span-7">
            <OperatorResponseChart metrics={operatorMetrics} />
          </div>

          {/* Donut rating — 5/12 */}
          <div className="col-span-12 xl:col-span-5">
            <RatingDonutChart
              distribution={ratingDistribution}
              avgRating={avgRating}
            />
          </div>

          {/* Top operator table — full width */}
          <div className="col-span-12">
            <TopOperatorTable metrics={operatorMetrics} />
          </div>
        </div>
      )}
    </>
  );
}
