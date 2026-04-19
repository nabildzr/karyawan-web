// * Dashboard widget: ringkasan statistik absensi hari ini.
// * Renamed & rethemed from EcommerceMetrics.tsx.

import {
  ArrowUpIcon,
  ArrowDownIcon,
  GroupIcon,
  UserCircleIcon,
  TimeIcon,
  CalenderIcon,
  AlertIcon,
} from "../../../icons";
import Badge from "../../../components/ui/badge/Badge";
import type { AttendanceStats } from "../../../types/attendances.types";
import type { PaginatedMeta } from "../../../types/karyawan.types";

interface Props {
  stats: AttendanceStats;
  karyawanTotal: PaginatedMeta["total"];
  pendingSubmissions: number;
  onViewPending: () => void;
}

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  unit: string;
  badge?: React.ReactNode;
}

function MetricCard({ icon, iconBg, label, value, unit, badge }: MetricCardProps) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 overflow-hidden relative">
      <div className="absolute -right-4 -top-4 size-24 rounded-full opacity-30 group-hover:scale-150 transition-transform duration-500 bg-current" />
      <div className={`relative z-10 flex items-center justify-between`}>
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${iconBg}`}>
          {icon}
        </div>
        {badge}
      </div>
      <div className="relative z-10 mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <div className="mt-1 flex items-baseline gap-1.5">
          <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">{value}</h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function AttendanceMetrics({ stats, karyawanTotal, pendingSubmissions, onViewPending }: Props) {
  const hadirPct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const telatPct = stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <MetricCard
        icon={<GroupIcon className="text-blue-600 dark:text-blue-400 size-5" />}
        iconBg="bg-blue-100 dark:bg-blue-900/40"
        label="Total Karyawan"
        value={karyawanTotal}
        unit="orang"
      />
      <MetricCard
        icon={<UserCircleIcon className="text-green-600 dark:text-green-400 size-5" />}
        iconBg="bg-green-100 dark:bg-green-900/40"
        label="Hadir Hari Ini"
        value={stats.present}
        unit="karyawan"
        badge={
          hadirPct > 0 ? (
            <Badge color="success">
              <ArrowUpIcon className="size-3" />
              {hadirPct}%
            </Badge>
          ) : undefined
        }
      />
      <MetricCard
        icon={<TimeIcon className="text-yellow-600 dark:text-yellow-400 size-5" />}
        iconBg="bg-yellow-100 dark:bg-yellow-900/40"
        label="Terlambat"
        value={stats.late}
        unit="karyawan"
        badge={
          telatPct > 0 ? (
            <Badge color="warning">
              <ArrowDownIcon className="size-3" />
              {telatPct}%
            </Badge>
          ) : undefined
        }
      />
      <MetricCard
        icon={<AlertIcon className="text-red-600 dark:text-red-400 size-5" />}
        iconBg="bg-red-100 dark:bg-red-900/40"
        label="Tidak Hadir (Alpa)"
        value={stats.absent}
        unit="karyawan"
      />
      <MetricCard
        icon={<CalenderIcon className="text-purple-600 dark:text-purple-400 size-5" />}
        iconBg="bg-purple-100 dark:bg-purple-900/40"
        label="Izin / Cuti"
        value={stats.leave}
        unit="karyawan"
      />
      <div
        className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 overflow-hidden relative cursor-pointer hover:border-teal-400 transition-colors"
        onClick={pendingSubmissions > 0 ? onViewPending : undefined}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/40">
            <AlertIcon className="text-teal-600 dark:text-teal-400 size-5" />
          </div>
          {pendingSubmissions > 0 && (
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Lihat Semua →
            </span>
          )}
        </div>
        <div className="relative z-10 mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Pengajuan Pending</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">{pendingSubmissions}</h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">dokumen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
