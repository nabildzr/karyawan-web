import { useCallback, useState } from "react";
import { workingSchedulesService } from "../services/workingSchedules.service";
import type {
  AssignEmployeesInput,
  CreateWorkingScheduleInput,
  UpdateWorkingScheduleInput,
  WorkingSchedule,
  WorkingScheduleDetail,
  WorkingScheduleStats,
} from "../types/workingSchedules.types";

const DEFAULT_STATS: WorkingScheduleStats = {
  totalSchedules: 0,
  activeAssignments: 0,
  recentChanges: 0,
};

// * Hook ini mengelola data jadwal kerja admin.
// * Mendukung list, detail, dan assignment karyawan.
export function useWorkingSchedules() {
  // & State for list, stats, and status.
  // % State untuk daftar, statistik, dan status.
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [stats, setStats] = useState<WorkingScheduleStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Fetch all schedules and stats.
  // % Ambil semua jadwal dan statistik.
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await workingSchedulesService.getAll();
      setSchedules(result.data);
      setStats(result.stats);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data jadwal kerja",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // & Get schedule detail by id.
  // % Ambil detail jadwal berdasarkan id.
  const getById = async (id: string): Promise<WorkingScheduleDetail> => {
    return workingSchedulesService.getById(id);
  };

  // & Create schedule then refresh.
  // % Buat jadwal lalu refresh.
  const create = async (
    input: CreateWorkingScheduleInput,
  ): Promise<WorkingScheduleDetail> => {
    const result = await workingSchedulesService.create(input);
    await fetchAll();
    return result;
  };

  // & Update schedule then refresh.
  // % Ubah jadwal lalu refresh.
  const update = async (
    id: string,
    input: UpdateWorkingScheduleInput,
  ): Promise<WorkingScheduleDetail> => {
    const result = await workingSchedulesService.update(id, input);
    await fetchAll();
    return result;
  };

  // & Assign employees then refresh.
  // % Assign karyawan lalu refresh.
  const assign = async (
    id: string,
    input: AssignEmployeesInput,
  ): Promise<WorkingScheduleDetail> => {
    const result = await workingSchedulesService.assign(id, input);
    await fetchAll();
    return result;
  };

  return {
    schedules,
    stats,
    loading,
    error,
    fetchAll,
    getById,
    create,
    update,
    assign,
  };
}
