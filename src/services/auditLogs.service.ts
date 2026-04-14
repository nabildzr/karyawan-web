// * Service ini menangani API audit log.
// * Dipakai untuk daftar log dengan paginasi.

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoint";
import type {
    AuditLog,
    AuditLogPaginatedMeta,
    GetAuditLogsParams,
} from "../types/auditLogs.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: AuditLogPaginatedMeta | null;
}

export const auditLogsService = {
  // & Get paginated audit logs.
  // % Ambil audit log dengan paginasi.
  getAll: async (
    params: GetAuditLogsParams = {},
  ): Promise<{ data: AuditLog[]; meta: AuditLogPaginatedMeta }> => {
    // & Remove empty values from query params.
    // % Hapus nilai kosong dari query params.
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined),
    );
    // & Call API to get audit logs.
    // % Panggil API untuk mendapatkan audit log.
    const res = await apiClient.get<ApiResponse<AuditLog[]>>(
      API_ENDPOINTS.AUDIT_LOGS.BASE,
      { params: cleaned },
    );

    const fallbackLimit = params.limit ?? 10;
    const fallbackPage = params.page ?? 1;
    const fallbackTotal = res.data.data.length;
    const fallbackMeta: AuditLogPaginatedMeta = {
      total: fallbackTotal,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages: Math.max(1, Math.ceil(fallbackTotal / fallbackLimit)),
    };

    return {
      data: res.data.data,
      meta: res.data.meta ?? fallbackMeta,
    };
  },
};
