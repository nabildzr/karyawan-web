// * Frontend module: karyawan-web/src/pages/admin/Dashboard/Home.tsx
// & Admin dashboard utama — orchestrator tipis, logika fetch di sini.
// % Komponen berat dipecah ke file terpisah di folder ini.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import { useAuthContext } from "../../../context/AuthContext";
import { useAttendances } from "../../../hooks/useAttendances";
import { useKaryawan } from "../../../hooks/useKaryawan";
import { useSubmissions } from "../../../hooks/useSubmissions";
import { karyawanService } from "../../../services/karyawan.service";
import type { AttendanceStats } from "../../../types/attendances.types";
import type { Employee } from "../../../types/karyawan.types";

import AttendanceMetrics from "./AttendanceMetrics";
import AttendanceRateGauge from "./AttendanceRateGauge";
import DivisiDistributionCard from "./DivisiDistributionCard";
import MonthlyAttendanceChart from "./MonthlyAttendanceChart";
import RecentAttendance from "./RecentAttendance";

const EMPTY_STATS: AttendanceStats = { present: 0, late: 0, absent: 0, leave: 0, total: 0 };

/** Group employee[] ke { name, count }[] berdasarkan divisi. */
function toDivisiStats(employees: Employee[]) {
  const map = new Map<string, number>();
  for (const emp of employees) {
    const divName = emp.position?.division?.name ?? "Lainnya";
    map.set(divName, (map.get(divName) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function Home() {
  const navigate = useNavigate();
  const { hasRoutePermission, canAccessAdminPortal } = useAuthContext();

  // --- RBAC checks ---
  const canReadKaryawan  = hasRoutePermission("/admin/karyawan",          "READ");
  const canReadAbsensi   = hasRoutePermission("/admin/daftar-absensi",    "READ");
  const canReadPengajuan = hasRoutePermission("/admin/daftar-pengajuan",  "READ");
  const canReadDivisi    = hasRoutePermission("/admin/divisi",            "READ");

  const todayLabel = useMemo(() =>
    new Date().toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta",
    }), []);

  // --- hooks ---
  const { meta: karyawanMeta, fetchAll: fetchKaryawan } = useKaryawan();
  const { stats, attendances, fetchStats, fetchAll: fetchAttendances } = useAttendances();
  const { meta: subMeta, fetchAdmin: fetchSubmissions } = useSubmissions("admin");

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // --- load data ---
  useEffect(() => {
    const jobs: Promise<unknown>[] = [];
    if (canReadKaryawan)  jobs.push(fetchKaryawan({ page: 1, limit: 1 }));
    if (canReadAbsensi)   jobs.push(fetchStats(), fetchAttendances({ page: 1, limit: 10 }));
    if (canReadPengajuan) jobs.push(fetchSubmissions({ status: "PENDING", page: 1, limit: 1 }));
    if (canReadDivisi)    jobs.push(karyawanService.getAll({ limit: 999 }).then((r) => setAllEmployees(r.data)).catch(() => {}));

    Promise.allSettled(jobs).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReadKaryawan, canReadAbsensi, canReadPengajuan, canReadDivisi]);

  // --- derived ---
  const divisiStats = useMemo(() => toDivisiStats(allEmployees), [allEmployees]);

  return (
    <>
      <PageMeta
        title="Dashboard Admin | Absensi Karyawan"
        description="Dashboard utama admin untuk mengelola kehadiran dan karyawan."
      />

      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard Admin</h1>
            <p className="text-sm text-gray-400">Ringkasan kehadiran karyawan · {todayLabel}</p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Portal</span>
            <select
              defaultValue="admin"
              onChange={(e) => navigate(e.target.value === "karyawan" ? "/karyawan" : "/admin")}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white outline-none focus:border-white"
            >
              {canAccessAdminPortal && <option value="admin" className="text-gray-900">Admin</option>}
              <option value="karyawan" className="text-gray-900">Karyawan</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-6">

          {/* Metrics row */}
          {(canReadAbsensi || canReadKaryawan) && (
            <div className="col-span-12 xl:col-span-7">
              <AttendanceMetrics
                stats={canReadAbsensi ? stats : EMPTY_STATS}
                karyawanTotal={canReadKaryawan ? karyawanMeta.total : 0}
                pendingSubmissions={canReadPengajuan ? subMeta.total : 0}
                onViewPending={() => navigate("/admin/daftar-pengajuan")}
              />
            </div>
          )}

          {/* Radial gauge */}
          {canReadAbsensi && (
            <div className="col-span-12 xl:col-span-5">
              <AttendanceRateGauge stats={stats} />
            </div>
          )}

          {/* Bar chart */}
          {canReadAbsensi && (
            <div className="col-span-12 xl:col-span-7">
              <MonthlyAttendanceChart />
            </div>
          )}

          {/* Divisi donut */}
          {canReadDivisi && (
            <div className="col-span-12 xl:col-span-5">
              <DivisiDistributionCard divisions={divisiStats} />
            </div>
          )}

          {/* Recent attendance table */}
          {canReadAbsensi && (
            <div className="col-span-12">
              <RecentAttendance records={attendances} />
            </div>
          )}

        </div>
      )}
    </>
  );
}
