// * Frontend module: karyawan-web/src/pages/admin/Dashboard/Home.tsx
// & Admin dashboard utama — orchestrator tipis, logika fetch di sini.
// % Komponen berat dipecah ke file terpisah di folder ini.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import { useAuthContext } from "../../../context/AuthContext";
import { dashboardService } from "../../../services/dashboard.service";
import type { AttendanceStats } from "../../../types/attendances.types";
import type { AdminDashboardRecentAttendance } from "../../../types/dashboard.types";

import AttendanceMetrics from "./AttendanceMetrics";
import AttendanceRateGauge from "./AttendanceRateGauge";
import DivisiDistributionCard from "./DivisiDistributionCard";
import MonthlyAttendanceChart from "./MonthlyAttendanceChart";
import RecentAttendance from "./RecentAttendance";

const EMPTY_STATS: AttendanceStats = { present: 0, late: 0, absent: 0, leave: 0, total: 0 };

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

  const [stats, setStats] = useState<AttendanceStats>(EMPTY_STATS);
  const [karyawanTotal, setKaryawanTotal] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [divisiStats, setDivisiStats] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<{
    year: number;
    present: number[];
    late: number[];
  } | null>(null);
  const [recentAttendances, setRecentAttendances] = useState<
    AdminDashboardRecentAttendance[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const shouldFetch =
      canReadKaryawan || canReadAbsensi || canReadPengajuan || canReadDivisi;

    if (!shouldFetch) {
      setStats(EMPTY_STATS);
      setKaryawanTotal(0);
      setPendingSubmissions(0);
      setDivisiStats([]);
      setMonthlyAttendance(null);
      setRecentAttendances([]);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);

    dashboardService
      .getAdminOverview({ recentLimit: 10 })
      .then((payload) => {
        if (!isMounted) return;

        setStats(payload.summary.attendance);
        setKaryawanTotal(payload.summary.totalEmployees);
        setPendingSubmissions(payload.summary.pendingSubmissions);
        setDivisiStats(
          payload.divisionDistribution.map((item) => ({
            name: item.name,
            count: item.employeeCount,
          })),
        );
        setMonthlyAttendance(payload.monthlyAttendance);
        setRecentAttendances(payload.recentAttendances);
      })
      .catch(() => {
        if (!isMounted) return;

        setStats(EMPTY_STATS);
        setKaryawanTotal(0);
        setPendingSubmissions(0);
        setDivisiStats([]);
        setMonthlyAttendance(null);
        setRecentAttendances([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [canReadKaryawan, canReadAbsensi, canReadPengajuan, canReadDivisi]);

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
            <p className="text-sm text-gray-400">
              Ringkasan kehadiran karyawan · {todayLabel}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Portal
            </span>
            <select
              defaultValue="admin"
              onChange={(e) =>
                navigate(e.target.value === "karyawan" ? "/karyawan" : "/admin")
              }
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white outline-none focus:border-white"
            >
              {canAccessAdminPortal && (
                <option value="admin" className="text-gray-900">
                  Admin
                </option>
              )}
              <option value="karyawan" className="text-gray-900">
                Karyawan
              </option>
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
                karyawanTotal={canReadKaryawan ? karyawanTotal : 0}
                pendingSubmissions={canReadPengajuan ? pendingSubmissions : 0}
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
              <MonthlyAttendanceChart
                presentData={monthlyAttendance?.present}
                lateData={monthlyAttendance?.late}
              />
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
              <RecentAttendance records={recentAttendances} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
