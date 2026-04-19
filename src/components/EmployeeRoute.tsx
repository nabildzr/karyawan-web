// * Frontend module: karyawan-web/src/components/EmployeeRoute.tsx
// & This file defines frontend UI or logic for EmployeeRoute.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk EmployeeRoute.tsx.

// & ============================================================
// % EMPLOYEE ROUTE
// % Guard komponen untuk portal karyawan
// % Hanya cek apakah user sudah login (tanpa role restriction)
// % Semua authenticated user bisa akses portal karyawan
// & ============================================================

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthContext } from "../context/AuthContext";

export function EmployeeRoute() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // % Tampilkan loading spinner saat masih cek session ke backend
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // % Kalau belum login → redirect ke /karyawan/signin
  // % Simpan URL tujuan di state biar setelah login bisa redirect balik
  if (!isAuthenticated) {
    return <Navigate to="/karyawan/signin" state={{ from: location }} replace />;
  }

  // % Semua authenticated user boleh akses portal karyawan
  return <Outlet />;
}
