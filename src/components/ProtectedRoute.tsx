// * Frontend module: karyawan-web/src/components/ProtectedRoute.tsx
// & This file defines frontend UI or logic for ProtectedRoute.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk ProtectedRoute.tsx.

// & ============================================================
// % PROTECTED ROUTE
// % Guard komponen buat protect halaman berdasarkan:
// % 1. Apakah user sudah login?
// % 2. Apakah role user punya akses ke halaman itu?
// & ============================================================

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import type { PermissionAction, UserRole } from "../types/auth.types";

interface ProtectedRouteProps {
  // % Kalau diisi, hanya role yang ada di list ini yang boleh masuk
  // % Kalau kosong/undefined, semua user yang sudah login boleh akses
  allowedRoles?: UserRole[];

  // % Kalau diisi, user wajib punya permission action pada routePath ini.
  requiredRoutePath?: string;

  // % Aksi permission yang dicek untuk routePath (default: READ).
  requiredAction?: PermissionAction;

  // % Kalau diisi, user wajib punya izin berdasarkan resource key RBAC.
  requiredPermissionKey?: string;
}

export function ProtectedRoute({
  allowedRoles,
  requiredRoutePath,
  requiredAction = "READ",
  requiredPermissionKey,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    hasRole,
    hasRoutePermission,
    hasPermission,
  } = useAuthContext();
  const location = useLocation();

  // % Tampilkan loading spinner saat masih cek session ke backend
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // % Kalau belum login → redirect ke /login
  // % Simpan URL tujuan di state biar setelah login bisa redirect balik
  if (!isAuthenticated) {
    return <Navigate to="/admin/signin" state={{ from: location }} replace />;
  }

  // % Kalau ada role restriction dan user gak punya role yang diizinkan → redirect 403
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  // % Kalau ada rule permission key dan user tidak punya izin yang dibutuhkan → 403
  if (
    requiredPermissionKey &&
    !hasPermission(requiredPermissionKey, requiredAction)
  ) {
    return <Navigate to="/403" replace />;
  }

  // % Kalau ada rule route permission dan user tidak punya izin yang dibutuhkan → 403
  if (
    requiredRoutePath &&
    !hasRoutePermission(requiredRoutePath, requiredAction)
  ) {
    return <Navigate to="/403" replace />;
  }

  // % Kalau semua check passed → render halaman yang diminta
  return <Outlet />;
}
