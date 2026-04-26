// * Frontend module: karyawan-web/src/App.tsx
// & This file defines frontend UI or logic for App.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk App.tsx.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";
import { Toaster } from "sonner";

import { ScrollToTop } from "./components/common/ScrollToTop";
import { EmployeeRoute } from "./components/EmployeeRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import AppLayout from "./layout/AppLayout";

// Admin Pages
import { AuthProvider } from "./context/AuthContext";
import AbsensiManual from "./pages/admin/Absensi/AbsensiManual";
import DaftarAbsensi from "./pages/admin/Absensi/DaftarAbsensi";
import KoreksiAbsensi from "./pages/admin/Absensi/KoreksiAbsensi";
import Blank from "./pages/admin/Blank";
import Calendar from "./pages/admin/Calendar";
import Home from "./pages/admin/Dashboard/Home";
import Geofences from "./pages/admin/MasterDataAbsensi/Geofences";
import Divisi from "./pages/admin/MasterDataHierarki/Divisi";
import Jabatan from "./pages/admin/MasterDataHierarki/Jabatan";
import AturanPoin from "./pages/admin/MasterDataIntegritas/AturanPoin";
import DompetIntegritasDashboard from "./pages/admin/MasterDataIntegritas/DompetIntegritasDashboard";
import IntegrityLogs from "./pages/admin/MasterDataIntegritas/IntegrityLogs";
import ItemMarketplace from "./pages/admin/MasterDataIntegritas/ItemMarketplace";
import LeaderboardIntegritas from "./pages/admin/MasterDataIntegritas/LeaderboardIntegritas";
import JadwalKerja from "./pages/admin/MasterDataJadwalKerja/JadwalKerja";
import ManajemenLibur from "./pages/admin/MasterDataJadwalKerja/ManajemenLibur";
import Rbac from "./pages/admin/MasterDataKeamanan/Rbac";
import RbacRoleDetail from "./pages/admin/MasterDataKeamanan/RbacRoleDetail";
import AuditLogs from "./pages/admin/MasterDataLogs/AuditLogs";
import DaftarPengajuan from "./pages/admin/MasterDataPengajuan/DaftarPengajuan";
import Karyawan from "./pages/admin/MasterDataPengguna/Karyawan";
import ManajemenWajah from "./pages/admin/MasterDataPengguna/ManajemenWajah";
import NotFound from "./pages/admin/OtherPage/NotFound";
import DashboardPenilaianPerDivisi from "./pages/admin/Penilaian/DashboardPenilaianPerDivisi";
import LaporanIndividu from "./pages/admin/Penilaian/LaporanIndividu";
import LaporanPenilaian from "./pages/admin/Penilaian/LaporanPenilaian";
import PenilaianKaryawan from "./pages/admin/Penilaian/PenilaianKaryawan";
import PenilaianKategori from "./pages/admin/Penilaian/PenilaianKategori";
import PenilaianPerDivisi from "./pages/admin/Penilaian/PenilaianPerDivisi";
import UserProfiles from "./pages/admin/UserProfiles";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import BarChart from "./pages/Charts/BarChart";
import LineChart from "./pages/Charts/LineChart";
import KaryawanAbsensi from "./pages/Karyawan/routes/absensi";
import KaryawanAbsensiDetail from "./pages/Karyawan/routes/absensi/detail";
import KaryawanAkun from "./pages/Karyawan/routes/akun";
import KaryawanProfileDetail from "./pages/Karyawan/routes/akun/profile";
import AttendanceCapturePage from "./pages/Karyawan/routes/attendanceFlow/CapturePage";
import AttendanceProcessingPage from "./pages/Karyawan/routes/attendanceFlow/ProcessingPage";
import AttendanceResultPage from "./pages/Karyawan/routes/attendanceFlow/ResultPage";
import KaryawanDompet from "./pages/Karyawan/routes/dompet";
import KaryawanHome from "./pages/Karyawan/routes/home";
import KaryawanJadwal from "./pages/Karyawan/routes/jadwal";
import KaryawanLayout from "./pages/Karyawan/routes/layout";
import KaryawanLeaderboard from "./pages/Karyawan/routes/leaderboard";
import NotifikasiKaryawan from "./pages/Karyawan/routes/notifikasi";
import KaryawanPengajuan from "./pages/Karyawan/routes/pengajuan";
import KaryawanReview from "./pages/Karyawan/routes/review";
import LandingPage from "./pages/LandingPage/LandingPage";
import CreateTicketPage from "./pages/Helpdesk/CreateTicketPage";
import UserTicketListPage from "./pages/Helpdesk/UserTicketListPage";
import UserTicketDetailPage from "./pages/Helpdesk/UserTicketDetailPage";
import OperatorTicketListPage from "./pages/Helpdesk/OperatorTicketListPage";
import OperatorTicketDetailPage from "./pages/Helpdesk/OperatorTicketDetailPage";
import HelpdeskDashboardPage from "./pages/admin/Helpdesk/HelpdeskDashboardPage";

// ============================================================
// Setup QueryClient
// ============================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Jangan retry kalau 401/403 — langsung redirect aja
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // data fresh selama 5 menit
    },
  },
});

export default function App() {
  return (
    // 1. QueryClientProvider — paling luar, semua hook TanStack Query butuh ini
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />

        {/* 2. AuthProvider — di dalam Router karena AuthContext pakai useNavigate */}
        <AuthProvider>
          <Routes>
            {/* Protected routes admin — prefix /admin/** */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route element={<ProtectedRoute requiredRoutePath="/admin" />}>
                  <Route index element={<Home />} />
                </Route>
                <Route path="profile" element={<UserProfiles />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="blank" element={<Blank />} />
                {/* <Route path="form-elements" element={<FormElements />} /> */}
                {/* <Route path="basic-tables" element={<BasicTables />} /> */}

                <Route path="line-chart" element={<LineChart />} />
                <Route path="bar-chart" element={<BarChart />} />

                {/* ── Master Data Hierarki ── */}
                <Route
                  element={<ProtectedRoute requiredRoutePath="/admin/divisi" />}
                >
                  <Route path="divisi" element={<Divisi />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/jabatan" />
                  }
                >
                  <Route path="jabatan" element={<Jabatan />} />
                </Route>

                {/* ── Master Data Pengguna ── */}
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/karyawan" />
                  }
                >
                  <Route path="karyawan" element={<Karyawan />} />
                </Route>
                <Route path="user" element={<Blank />} />
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/manajemen-wajah" />
                  }
                >
                  <Route path="manajemen-wajah" element={<ManajemenWajah />} />
                </Route>

                {/* ── Master Data Jadwal Kerja ── */}
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/jadwal-kerja" />
                  }
                >
                  <Route path="jadwal-kerja" element={<JadwalKerja />} />
                </Route>
                {/* <Route path="shift" element={<Blank />} /> */}
                {/* <Route path="jadwal-hari" element={<Blank />} /> */}
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/manajemen-libur" />
                  }
                >
                  <Route path="manajemen-libur" element={<ManajemenLibur />} />
                </Route>

                {/* ── Master Data Absensi ── */}
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/daftar-absensi" />
                  }
                >
                  <Route path="daftar-absensi" element={<DaftarAbsensi />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/koreksi-absensi" />
                  }
                >
                  <Route path="koreksi-absensi" element={<KoreksiAbsensi />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/absensi-manual" />
                  }
                >
                  <Route path="absensi-manual" element={<AbsensiManual />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/geofences" />
                  }
                >
                  <Route path="geofences" element={<Geofences />} />
                </Route>

                {/* <Route path="statistik-absensi" element={<Blank />} /> */}
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/daftar-pengajuan" />
                  }
                >
                  <Route
                    path="daftar-pengajuan"
                    element={<DaftarPengajuan />}
                  />
                </Route>

                {/* ── Master Data Penilaian ── */}
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/input-penilaian" />
                  }
                >
                  <Route
                    path="input-penilaian"
                    element={<PenilaianKaryawan />}
                  />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/penilaian-per-divisi" />
                  }
                >
                  <Route
                    path="penilaian-per-divisi"
                    element={<PenilaianPerDivisi />}
                  />
                  <Route
                    path="penilaian-per-divisi/:divisionId/dashboard"
                    element={<DashboardPenilaianPerDivisi />}
                  />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/manajemen-kategori" />
                  }
                >
                  <Route
                    path="manajemen-kategori"
                    element={<PenilaianKategori />}
                  />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/laporan-penilaian" />
                  }
                >
                  <Route
                    path="laporan-penilaian"
                    element={<LaporanPenilaian />}
                  />
                  <Route
                    path="laporan-individu/:assessmentId"
                    element={<LaporanIndividu />}
                  />
                </Route>

                <Route path="laporan-per-divisi" element={<Blank />} />
                <Route path="laporan-seluruh-karyawan" element={<Blank />} />
                <Route path="laporan-absensi" element={<Blank />} />
                <Route path="laporan-pengajuan" element={<Blank />} />

                {/* ── Logs ── */}
                <Route
                  element={
                    <ProtectedRoute requiredRoutePath="/admin/audit-logs" />
                  }
                >
                  <Route path="audit-logs" element={<AuditLogs />} />
                </Route>
                <Route
                  element={<ProtectedRoute requiredRoutePath="/admin/rbac" />}
                >
                  <Route path="rbac" element={<Rbac />} />
                  <Route path="rbac/:roleId" element={<RbacRoleDetail />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="points_dashboard"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route
                    path="dompet-integritas"
                    element={<DompetIntegritasDashboard />}
                  />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="points_rules"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route path="aturan-poin" element={<AturanPoin />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="points_marketplace"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route
                    path="item-marketplace"
                    element={<ItemMarketplace />}
                  />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="points_logs"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route path="integrity-logs" element={<IntegrityLogs />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="points_leaderboard"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route
                    path="leaderboard-integritas"
                    element={<LeaderboardIntegritas />}
                  />
                </Route>

                {/* ── Helpdesk (OPERATOR/ADMIN) ── */}                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="helpdesk_operator"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route path="helpdesk" element={<OperatorTicketListPage />} />
                  <Route
                    path="helpdesk/:id"
                    element={<OperatorTicketDetailPage />}
                  />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="helpdesk_dashboard"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route
                    path="helpdesk/dashboard"
                    element={<HelpdeskDashboardPage />}
                  />
                </Route>
              </Route>
            </Route>

            {/* ── KARYAWAN PORTAL ── */}
            <Route element={<EmployeeRoute />}>
              <Route path="/karyawan" element={<KaryawanLayout />}>
                <Route index element={<KaryawanHome />} />
                <Route path="absensi" element={<KaryawanAbsensi />} />
                <Route
                  path="absensi/detail/:attendanceId"
                  element={<KaryawanAbsensiDetail />}
                />
                <Route
                  path="absensi/check-in"
                  element={<Navigate to="/karyawan/absensi" replace />}
                />
                <Route
                  path="absensi/check-out"
                  element={<Navigate to="/karyawan/absensi" replace />}
                />
                <Route
                  path="absensi/capture"
                  element={<AttendanceCapturePage />}
                />
                <Route
                  path="absensi/processing"
                  element={<AttendanceProcessingPage />}
                />
                <Route
                  path="absensi/result"
                  element={<AttendanceResultPage />}
                />
                <Route path="pengajuan" element={<KaryawanPengajuan />} />
                <Route path="jadwal" element={<KaryawanJadwal />} />
                <Route path="review" element={<KaryawanReview />} />
                <Route path="dompet" element={<KaryawanDompet />} />
                <Route path="leaderboard" element={<KaryawanLeaderboard />} />
                <Route path="akun" element={<KaryawanAkun />} />
                <Route
                  path="akun/profile"
                  element={<KaryawanProfileDetail />}
                />
                <Route path="notifikasi" element={<NotifikasiKaryawan />} />

                {/* ── Helpdesk (USER) ── */}
                {/* tambahkan rou */}                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="employee_helpdesk"
                      requiredAction="READ"
                    />
                  }
                >
                  <Route path="helpdesk" element={<UserTicketListPage />} />
                  <Route path="helpdesk/:id" element={<UserTicketDetailPage />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredPermissionKey="employee_helpdesk"
                      requiredAction="CREATE"
                    />
                  }
                >
                  <Route path="helpdesk/create" element={<CreateTicketPage />} />
                </Route>
              </Route>

              <Route
                path="/attendance/capture"
                element={<Navigate to="/karyawan/absensi/capture" replace />}
              />
              <Route
                path="/attendance/processing"
                element={<Navigate to="/karyawan/absensi/processing" replace />}
              />
              <Route
                path="/attendance/result"
                element={<Navigate to="/karyawan/absensi/result" replace />}
              />
            </Route>

            {/* Public routes — kalau sudah login langsung redirect ke dashboard */}
            <Route element={<PublicRoute />}>
              <Route path="/admin/signin" element={<SignIn />} />
              <Route path="/admin/signup" element={<SignUp />} />
              <Route
                path="/admin/forgot-password"
                element={<ForgotPassword />}
              />
              <Route path="/admin/reset-password" element={<ResetPassword />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route
                path="/signin"
                element={<Navigate to="/admin/signin" replace />}
              />
              <Route
                path="/signup"
                element={<Navigate to="/admin/signup" replace />}
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/karyawan/signin" element={<SignIn />} />
            </Route>

            {/* Landing page — accessible to all */}
            <Route path="/landing" element={<LandingPage />} />

            {/* Legacy alias */}
            <Route
              path="/karyawan-app/*"
              element={<Navigate to="/karyawan" replace />}
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>

      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />

      {/* TanStack Query Devtools — otomatis hilang di production build */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}






