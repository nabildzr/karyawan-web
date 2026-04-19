// * Frontend module: karyawan-web/src/hooks/useAuditLogs.ts
// & This file defines frontend UI or logic for useAuditLogs.ts.
// % File ini mendefinisikan UI atau logika frontend untuk useAuditLogs.ts.

import { useCallback, useRef, useState } from "react";
import { auditLogsService } from "../services/auditLogs.service";
import type {
  AuditLog,
  AuditLogPaginatedMeta,
  GetAuditLogsParams,
} from "../types/auditLogs.types";

const DEFAULT_META: AuditLogPaginatedMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

// * Hook ini mengelola daftar audit log admin.
// * Mendukung paginasi, pencarian, dan refetch.
export function useAuditLogs() {
  // & State for list, pagination, and status.
  // % State untuk daftar, paginasi, dan status.
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<AuditLogPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Keep latest query for refetch.
  // % Simpan query terakhir untuk refetch.
  const queryRef = useRef<GetAuditLogsParams>({ page: 1, limit: 10, search: "" });

  // & Fetch paginated audit logs list.
  // % Ambil daftar audit log dengan paginasi.
  const fetchAll = useCallback(async (params: GetAuditLogsParams) => {
    setLoading(true);
    setError(null);
    queryRef.current = params;
    try {
      const res = await auditLogsService.getAll(params);
      setAuditLogs(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data audit log");
    } finally {
      setLoading(false);
    }
  }, []);

  // & Refetch using current query.
  // % Refetch memakai query saat ini.
  const refetch = useCallback(async () => {
    await fetchAll(queryRef.current);
  }, [fetchAll]);

  // & Handle table query change.
  // % Tangani perubahan query dari tabel.
  const handleQueryChange = useCallback(
    (params: { page: number; limit: number; search: string }) => {
      fetchAll({ ...queryRef.current, ...params });
    },
    [fetchAll],
  );

  return {
    auditLogs,
    meta,
    loading,
    error,
    fetchAll,
    refetch,
    handleQueryChange,
  };
}
