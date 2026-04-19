// * Frontend module: karyawan-web/src/components/PublicRoute.tsx
// & This file defines frontend UI or logic for PublicRoute.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk PublicRoute.tsx.

// & ============================================================
// % PUBLIC ROUTE
// % Kebalikan dari ProtectedRoute —
// % Kalau user SUDAH login → redirect ke dashboard
// % Kalau belum login → render halaman yang diminta (signin, signup, dll)
// & ============================================================

import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../context/AuthContext";

export function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const currentRole = user?.role ?? user?.rbacRoleKey ?? null;

  // % Tunggu dulu sampai selesai cek session ke backend
  // % Biar gak flicker redirect pas pertama load
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // % Kalau sudah login → tendang ke dashboard
  if (isAuthenticated) {
    return <Navigate to={currentRole === "USER" ? "/karyawan" : "/admin"} replace />;
  }

  // % Belum login → render halaman publik (signin/signup)
  return <Outlet />;
}