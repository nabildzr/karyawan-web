// * Service ini menangani API jadwal kerja.
// * Mencakup list, detail, assignment, dan ringkasan mobile.

import { apiClient } from "../api/apiClient";
import type {
  AssignEmployeesInput,
  CreateWorkingScheduleInput,
  UpdateWorkingScheduleInput,
  WorkingSchedule,
  WorkingScheduleDetail,
  WorkingScheduleMobileSummary,
  WorkingScheduleMobileSummaryParams,
  WorkingScheduleStats,
} from "../types/workingSchedules.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: WorkingScheduleStats | null;
}

export const workingSchedulesService = {
  // & Get schedule list with optional stats meta.
  // % Ambil daftar jadwal dengan meta statistik opsional.
  getAll: async (
    withDays = false,
    withShifts = false,
  ): Promise<{ data: WorkingSchedule[]; stats: WorkingScheduleStats }> => {
    const res = await apiClient.get<ApiResponse<WorkingSchedule[]>>(
      "/working-schedules",
      { params: { withDays, withShifts } },
    );
    return {
      data: res.data.data,
      stats: (res.data.meta as WorkingScheduleStats) ?? {
        totalSchedules: res.data.data.length,
        activeAssignments: 0,
        recentChanges: 0,
      },
    };
  },

  // & Get schedule detail by id.
  // % Ambil detail jadwal berdasarkan id.
  getById: async (id: string): Promise<WorkingScheduleDetail> => {
    const res = await apiClient.get<ApiResponse<WorkingScheduleDetail>>(
      `/working-schedules/${id}`,
    );
    return res.data.data;
  },

  // & Create new working schedule.
  // % Buat jadwal kerja baru.
  create: async (
    data: CreateWorkingScheduleInput,
  ): Promise<WorkingScheduleDetail> => {
    const res = await apiClient.post<ApiResponse<WorkingScheduleDetail>>(
      "/working-schedules",
      data,
    );
    return res.data.data;
  },

  // & Update working schedule by id.
  // % Ubah jadwal kerja berdasarkan id.
  update: async (
    id: string,
    data: UpdateWorkingScheduleInput,
  ): Promise<WorkingScheduleDetail> => {
    const res = await apiClient.put<ApiResponse<WorkingScheduleDetail>>(
      `/working-schedules/${id}`,
      data,
    );
    return res.data.data;
  },

  // & Assign employees to selected schedule.
  // % Assign karyawan ke jadwal terpilih.
  assign: async (
    id: string,
    data: AssignEmployeesInput,
  ): Promise<WorkingScheduleDetail> => {
    const res = await apiClient.put<ApiResponse<WorkingScheduleDetail>>(
      `/working-schedules/${id}/assign`,
      data,
    );
    return res.data.data;
  },

  // & Get weekly and today summary for mobile.
  // % Ambil ringkasan mingguan dan hari ini untuk mobile.
  getMobileSummary: async (
    params: WorkingScheduleMobileSummaryParams,
  ): Promise<WorkingScheduleMobileSummary> => {
    const res = await apiClient.get<ApiResponse<WorkingScheduleMobileSummary>>(
      "/working-schedules/mobile/summary",
      {
        params: {
          ...params,
          timezone: params.timezone ?? "Asia/Jakarta",
        },
      },
    );
    return res.data.data;
  },
};
