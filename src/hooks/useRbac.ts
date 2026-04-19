// * Frontend module: karyawan-web/src/hooks/useRbac.ts
// & This file defines frontend UI or logic for useRbac.ts.
// % File ini mendefinisikan UI atau logika frontend untuk useRbac.ts.

import { useCallback, useState } from "react";
import {
  rbacService,
  type CreateRoleInput,
  type PermissionUpdateItem,
  type UpdateRoleInput,
} from "../services/rbac.service";
import type {
  PaginatedMeta,
  PermissionResource,
  RbacRole,
  RoleDetail,
} from "../types/rbac.types";

const DEFAULT_META: PaginatedMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

// * Hook ini mengelola role dan permission RBAC.
// * Mendukung list role, detail role, dan update permission.
export function useRbac() {
  // & State for roles, resources, and status.
  // % State untuk role, resource, dan status.
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [resources, setResources] = useState<PermissionResource[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Keep latest table query for refetch.
  // % Simpan query tabel terakhir untuk refetch.
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  // & Fetch paginated role list.
  // % Ambil daftar role dengan paginasi.
  const fetchRoles = useCallback(
    async (params = queryParams) => {
      setLoading(true);
      setError(null);
      try {
        const result = await rbacService.getRoles(params);
        setRoles(result.data);
        setMeta(result.meta);
        setQueryParams(params);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal memuat role.");
      } finally {
        setLoading(false);
      }
    },
    [queryParams],
  );

  // & Fetch permission resources.
  // % Ambil daftar resource permission.
  const fetchResources = useCallback(async (includeInactive = false) => {
    setError(null);
    try {
      const data = await rbacService.getResources(includeInactive);
      setResources(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat resource.");
    }
  }, []);

  // & Fetch role detail by role id.
  // % Ambil detail role berdasarkan id.
  const fetchRoleDetail = useCallback(async (roleId: string): Promise<RoleDetail> => {
    setDetailLoading(true);
    setError(null);
    try {
      return await rbacService.getRoleDetail(roleId);
    } catch (err: unknown) {  
      const message =
        err instanceof Error ? err.message : "Gagal memuat detail role.";
      setError(message);
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // & Handle table query change.
  // % Tangani perubahan query dari tabel.
  const handleQueryChange = useCallback(
    async (params: { page: number; limit: number; search: string }) => {
      await fetchRoles(params);
    },
    [fetchRoles],
  );

  // & Create role then refresh list.
  // % Buat role lalu refresh daftar.
  const createRole = useCallback(
    async (payload: CreateRoleInput) => {
      const created = await rbacService.createRole(payload);
      await fetchRoles({ ...queryParams, page: 1 });
      return created;
    },
    [fetchRoles, queryParams],
  );

  // & Update role then refresh list.
  // % Ubah role lalu refresh daftar.
  const updateRole = useCallback(
    async (roleId: string, payload: UpdateRoleInput) => {
      const updated = await rbacService.updateRole(roleId, payload);
      await fetchRoles(queryParams);
      return updated;
    },
    [fetchRoles, queryParams],
  );

  // & Update role permissions only.
  // % Ubah permission role saja.
  const updateRolePermissions = useCallback(
    async (roleId: string, permissions: PermissionUpdateItem[]) => {
      return rbacService.updateRolePermissions(roleId, permissions);
    },
    [],
  );

  return {
    roles,
    resources,
    meta,
    loading,
    detailLoading,
    error,
    fetchRoles,
    fetchResources,
    fetchRoleDetail,
    handleQueryChange,
    createRole,
    updateRole,
    updateRolePermissions,
  };
}
