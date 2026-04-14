import { useCallback, useRef, useState } from "react";
import { attendancesService } from "../services/attendances.service";
import type {
  AttendancePaginatedMeta,
  AttendanceRecord,
  AttendanceStats,
  CorrectAttendanceInput,
  GetAdminAttendancesParams,
  GetStatsParams,
  ManualAttendanceInput,
} from "../types/attendances.types";

const DEFAULT_META: AttendancePaginatedMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const DEFAULT_STATS: AttendanceStats = {
  present: 0,
  late: 0,
  absent: 0,
  leave: 0,
  total: 0,
};

// * Hook ini mengelola data absensi admin.
// * Termasuk list, statistik, dan aksi koreksi.
export function useAttendances() {
  // & State for list, pagination, stats, and status.
  // % State untuk daftar, paginasi, statistik, dan status.
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [meta, setMeta] = useState<AttendancePaginatedMeta>(DEFAULT_META);
  const [stats, setStats] = useState<AttendanceStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Keep latest query for refetch.
  // % Simpan query terakhir untuk refetch.
  const queryRef = useRef<GetAdminAttendancesParams>({ page: 1, limit: 10, search: "" });

  // & Fetch paginated attendances list.
  // % Ambil daftar absensi dengan paginasi.
  const fetchAll = useCallback(async (params: GetAdminAttendancesParams) => {
    setLoading(true);
    setError(null);
    queryRef.current = params;
    try {
      const res = await attendancesService.getAll(params);
      setAttendances(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data absensi");
    } finally {
      setLoading(false);
    }
  }, []);

  // & Fetch attendance stats separately.
  // % Ambil statistik absensi secara terpisah.
  const fetchStats = useCallback(async (params?: GetStatsParams) => {
    setStatsLoading(true);
    try {
      const s = await attendancesService.getStats(params);
      setStats(s);
    } catch {
      // & Keep UI running when stats fail.
      // % Biarkan UI tetap jalan saat stats gagal.
    } finally {
      setStatsLoading(false);
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

  // & Create manual attendance then refresh.
  // % Buat absensi manual lalu refresh.
  const createManual = async (data: ManualAttendanceInput): Promise<AttendanceRecord> => {
    const res = await attendancesService.createManual(data);
    await refetch();
    return res;
  };

  // & Correct attendance then refresh.
  // % Koreksi absensi lalu refresh.
  const correct = async (id: string, data: CorrectAttendanceInput): Promise<AttendanceRecord> => {
    const res = await attendancesService.correct(id, data);
    await refetch();
    return res;
  };

  return {
    attendances,
    meta,
    stats,
    loading,
    statsLoading,
    error,
    fetchAll,
    fetchStats,
    refetch,
    handleQueryChange,
    createManual,
    correct,
  };
}
