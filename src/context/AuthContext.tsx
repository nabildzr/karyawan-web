// & ============================================================
// % AUTH CONTEXT
// % Wrapper tipis di atas useCurrentUser()
// % Tujuannya: biar komponen mana aja bisa akses data user
// % tanpa harus import hook TanStack Query langsung
// & ============================================================

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useCurrentUser } from "../hooks/useAuth";
import type {
  AuthPermission,
  AuthUser,
  PermissionAction,
  UserRole,
} from "../types/auth.types";

// & Normalize route path for RBAC permission matching.
// % Normalisasi route path untuk matching izin RBAC.
function normalizeRoutePath(path: string): string {
  const trimmed = path.trim().toLowerCase();
  if (!trimmed) return "/";

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const collapsed = withLeadingSlash.replace(/\/+/g, "/");

  if (collapsed.length > 1 && collapsed.endsWith("/")) {
    return collapsed.slice(0, -1);
  }

  return collapsed;
}

function routePathMatches(targetPath: string, allowedPath: string): boolean {
  const normalizedTarget = normalizeRoutePath(targetPath);
  const normalizedAllowed = normalizeRoutePath(allowedPath);

  if (normalizedTarget === normalizedAllowed) {
    return true;
  }

  // Jangan jadikan /admin sebagai wildcard ke semua route.
  const allowedDepth = normalizedAllowed.split("/").filter(Boolean).length;
  if (allowedDepth <= 1) {
    return false;
  }

  return normalizedTarget.startsWith(`${normalizedAllowed}/`);
}

const KNOWN_RBAC_ROUTE_PATHS = [
  "/admin",
  "/admin/divisi",
  "/admin/jabatan",
  "/admin/karyawan",
  "/admin/manajemen-wajah",
  "/admin/jadwal-kerja",
  "/admin/manajemen-libur",
  "/admin/daftar-absensi",
  "/admin/koreksi-absensi",
  "/admin/absensi-manual",
  "/admin/geofences",
  "/admin/daftar-pengajuan",
  "/admin/input-penilaian",
  "/admin/penilaian-per-divisi",
  "/admin/manajemen-kategori",
  "/admin/laporan-penilaian",
  "/admin/audit-logs",
  "/admin/rbac",
  "/karyawan",
  "/karyawan/absensi",
  "/karyawan/pengajuan",
  "/karyawan/review",
  "/karyawan/jadwal",
  "/karyawan/akun",
];

function isKnownRbacRoutePath(routePath: string): boolean {
  const normalizedTarget = normalizeRoutePath(routePath);

  return KNOWN_RBAC_ROUTE_PATHS.some((knownRoutePath) =>
    routePathMatches(normalizedTarget, knownRoutePath),
  );
}

// ============================================================
// Shape dari context value
// ============================================================
interface AuthContextValue {
  // Data user yang sedang login (null kalau belum login / loading)
  user: AuthUser | null;

  // Status loading saat pertama kali cek session (GET /auth/me)
  isLoading: boolean;

  // True kalau user sudah login (ada data user)
  isAuthenticated: boolean;

  // Helper: cek apakah role user ada di list yang diizinkan
  // Contoh: hasRole(["ADMIN", "HR"]) → true kalau user adalah ADMIN atau HR
  hasRole: (allowedRoles: UserRole[]) => boolean;

  // Daftar permission allowed dari RBAC matrix role user.
  permissions: AuthPermission[];

  // Helper: cek izin by resource key + action.
  hasPermission: (resourceKey: string, action: PermissionAction) => boolean;

  // Helper: cek izin by routePath modul + action.
  hasRoutePermission: (routePath: string, action?: PermissionAction) => boolean;

  // Flag ringkas untuk akses portal admin.
  canAccessAdminPortal: boolean;

  // Helper: akses cepat ke profile karyawan
  employeeProfile: AuthUser["employees"];
}

// ============================================================
// Buat context dengan default value
// ============================================================
const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================
// AuthProvider — taruh ini di root app (wraps semua route)
// ============================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  const isAuthenticated = !!user;
  const currentRole = user?.role ?? user?.rbacRoleKey ?? null;
  const isSuperAdmin = currentRole === "SUPER_ADMIN";

  const permissions = useMemo(
    () => user?.permissions ?? [],
    [user?.permissions],
  );

  const canAccessAdminPortal = useMemo(() => {
    if (isSuperAdmin) return true;

    if (user?.rbacRole?.canAccessAdmin) {
      return true;
    }

    return permissions.some((permission) => {
      if (!permission.resourceRoutePath) return false;
      return normalizeRoutePath(permission.resourceRoutePath).startsWith(
        "/admin",
      );
    });
  }, [isSuperAdmin, permissions, user?.rbacRole?.canAccessAdmin]);

  // Cek apakah role user ada di list yang diizinkan
  function hasRole(allowedRoles: UserRole[]): boolean {
    if (!currentRole) return false;
    if (isSuperAdmin) return true;
    return allowedRoles.includes(currentRole as UserRole);
  }

  function hasPermission(
    resourceKey: string,
    action: PermissionAction,
  ): boolean {
    if (!resourceKey) return false;
    if (isSuperAdmin) return true;

    return permissions.some(
      (permission) =>
        permission.resourceKey === resourceKey && permission.action === action,
    );
  }

  function hasRoutePermission(
    routePath: string,
    action: PermissionAction = "READ",
  ): boolean {
    const normalizedRoutePath = normalizeRoutePath(routePath);
    if (!normalizedRoutePath) return false;
    if (isSuperAdmin) return true;

    const routePermissions = permissions.filter((permission) => {
      if (!permission.resourceRoutePath) return false;
      return routePathMatches(
        normalizedRoutePath,
        permission.resourceRoutePath,
      );
    });

    if (routePermissions.some((permission) => permission.action === action)) {
      return true;
    }

    if (routePermissions.length > 0) {
      return false;
    }

    if (isKnownRbacRoutePath(normalizedRoutePath)) {
      return false;
    }

    if (normalizedRoutePath.startsWith("/admin")) {
      return canAccessAdminPortal;
    }

    return isAuthenticated;
  }

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    permissions,
    hasRole,
    hasPermission,
    hasRoutePermission,
    canAccessAdminPortal,
    employeeProfile: user?.employees ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// useAuthContext — hook buat ambil auth state dari context
// Throw error kalau dipakai di luar AuthProvider
// ============================================================
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext harus dipakai di dalam <AuthProvider>");
  }

  return context;
}
