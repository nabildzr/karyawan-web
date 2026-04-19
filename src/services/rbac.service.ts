// * Frontend module: karyawan-web/src/services/rbac.service.ts
// & This file defines frontend UI or logic for rbac.service.ts.
// % File ini mendefinisikan UI atau logika frontend untuk rbac.service.ts.

import { apiClient } from "../api/apiClient";
import type {
    PaginatedMeta,
    PermissionAction,
    PermissionResource,
    RbacRole,
    RoleDetail,
} from "../types/rbac.types";

  // * Service ini menangani API RBAC.
  // * Mencakup role, resource, dan permission.

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta: PaginatedMeta;
}

export interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRoleInput {
  name: string;
  key?: string;
  isActive?: boolean;
  canAccessAdmin?: boolean;
}

export interface UpdateRoleInput {
  name?: string;
  isActive?: boolean;
  canAccessAdmin?: boolean;
}

export interface PermissionUpdateItem {
  resourceKey: string;
  action: PermissionAction;
  isAllowed: boolean;
}

export const rbacService = {
  // & Get paginated roles.
  // % Ambil role dengan paginasi.
  async getRoles(
    params: GetRolesParams = {},
  ): Promise<{ data: RbacRole[]; meta: PaginatedMeta }> {
    const res = await apiClient.get<ApiPaginatedResponse<RbacRole[]>>(
      "/rbac/roles",
      { params },
    );

    return {
      data: res.data.data,
      meta: res.data.meta,
    };
  },

  // & Get permission resources.
  // % Ambil resource permission.
  async getResources(includeInactive = false): Promise<PermissionResource[]> {
    const res = await apiClient.get<ApiResponse<PermissionResource[]>>(
      "/rbac/resources",
      { params: { includeInactive } },
    );

    return res.data.data;
  },

  // & Get role detail by id.
  // % Ambil detail role berdasarkan id.
  async getRoleDetail(roleId: string): Promise<RoleDetail> {
    const res = await apiClient.get<ApiResponse<RoleDetail>>(`/rbac/roles/${roleId}`);
    return res.data.data;
  },

  // & Create new role.
  // % Buat role baru.
  async createRole(input: CreateRoleInput): Promise<RbacRole> {
    const res = await apiClient.post<ApiResponse<RbacRole>>("/rbac/roles", input);
    return res.data.data;
  },

  // & Update role by id.
  // % Ubah role berdasarkan id.
  async updateRole(roleId: string, input: UpdateRoleInput): Promise<RbacRole> {
    const res = await apiClient.put<ApiResponse<RbacRole>>(
      `/rbac/roles/${roleId}`,
      input,
    );

    return res.data.data;
  },

  // & Update role permission matrix.
  // % Ubah matriks permission role.
  async updateRolePermissions(
    roleId: string,
    permissions: PermissionUpdateItem[],
  ): Promise<RoleDetail> {
    const res = await apiClient.put<ApiResponse<RoleDetail>>(
      `/rbac/roles/${roleId}/permissions`,
      { permissions },
    );

    return res.data.data;
  },

  // & Assign role to specific user.
  // % Assign role ke user tertentu.
  async assignUserRole(userId: string, roleId: string) {
    const res = await apiClient.patch<ApiResponse<unknown>>(
      `/rbac/users/${userId}/role`,
      { roleId },
    );

    return res.data.data;
  },
};
