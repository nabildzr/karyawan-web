// * Service ini menangani semua API absensi.
// * Mencakup flow karyawan dan admin.

import { apiClient } from "../api/apiClient";
import type {
  AttendanceFilter,
  AttendancePaginatedMeta,
  AttendancePeriod,
  AttendanceRecord,
  AttendanceStats,
  CorrectAttendanceInput,
  ExportParams,
  GetAdminAttendancesParams,
  GetStatsParams,
  ManualAttendanceInput,
  TodayAttendanceContext,
} from "../types/attendances.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: AttendancePaginatedMeta | null;
}

export interface MyAttendanceHistoryData {
  records: AttendanceRecord[];
  summary: {
    total_days: number;
    streak_days: number;
  };
  current_page: number;
  total_pages: number;
  has_more: boolean;
}

export interface AttendanceActionPayload {
  image: File;
  latitude?: number;
  longitude?: number;
  deviceInfo?: string;
  timezone?: string;
}

export interface AttendanceActionResult {
  attendance: {
    id: string;
    status: string;
    statusCheckOut?: string | null;
    checkIn?: string | null;
    checkOut?: string | null;
    shiftName?: string | null;
    expectedCheckIn?: string | null;
    expectedCheckOut?: string | null;
    employeeName?: string | null;
  };
  faceConfidence: number;
}

// & Build multipart payload for check-in/check-out.
// % Susun payload multipart untuk check-in/check-out.
const buildAttendanceActionForm = (payload: AttendanceActionPayload) => {
  const form = new FormData();
  form.append("image", payload.image);

  if (payload.latitude !== undefined) {
    form.append("latitude", String(payload.latitude));
  }

  if (payload.longitude !== undefined) {
    form.append("longitude", String(payload.longitude));
  }

  if (payload.deviceInfo) {
    form.append("deviceInfo", payload.deviceInfo);
  }

  form.append("timezone", payload.timezone ?? "Asia/Jakarta");

  // % hasil akhir:
  // ? FormData {
  // ?   "image": File,
  // ?   "latitude": "value",
  // ?   "longitude": "value",
  // ?   "deviceInfo": "value",
  // ?   "timezone": "value"
  // ? }

  return form;
};

export const attendancesService = {
  // & Employee endpoints.
  // % Endpoint untuk karyawan.

  // & Get today attendance context.
  // % Ambil konteks absensi hari ini.
  getTodayContext: async (
    timezone = "Asia/Jakarta",
  ): Promise<TodayAttendanceContext> => {
    const res = await apiClient.get<ApiResponse<TodayAttendanceContext>>(
      "/attendances/today-context",
      { params: { timezone } },
    );
    return res.data.data;
  },

  // & Get own attendance history.
  // % Ambil riwayat absensi pribadi.
  getMyHistory: async (params?: {
    page?: number;
    limit?: number;
    period?: AttendancePeriod;
    filter?: AttendanceFilter;
  }): Promise<MyAttendanceHistoryData> => {
    const res = await apiClient.get<ApiResponse<MyAttendanceHistoryData>>(
      "/attendances/history",
      { params },
    );
    return res.data.data;
  },

  // & Get own attendance detail by attendance id.
  // % Ambil detail absensi pribadi berdasarkan attendance id.
  getMyById: async (id: string): Promise<AttendanceRecord> => {
    const res = await apiClient.get<ApiResponse<AttendanceRecord>>(
      `/attendances/history/${id}`,
    );
    return res.data.data;
  },

  // & Send check-in with face image.
  // % Kirim check-in dengan foto wajah.
  checkIn: async (
    payload: AttendanceActionPayload,
  ): Promise<AttendanceActionResult> => {
    const form = buildAttendanceActionForm(payload);
    const res = await apiClient.post<ApiResponse<AttendanceActionResult>>(
      "/attendances/check-in",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data.data;
  },

  // & Send check-out with face image.
  // % Kirim check-out dengan foto wajah.
  checkOut: async (
    payload: AttendanceActionPayload,
  ): Promise<AttendanceActionResult> => {
    const form = buildAttendanceActionForm(payload);
    const res = await apiClient.post<ApiResponse<AttendanceActionResult>>(
      "/attendances/check-out",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data.data;
  },

  // & Admin endpoints.
  // % Endpoint untuk admin.

  // & Get attendance stats.
  // % Ambil statistik absensi.
  getStats: async (params?: GetStatsParams): Promise<AttendanceStats> => {
    const res = await apiClient.get<ApiResponse<AttendanceStats>>(
      "/attendances/admin/stats",
      { params },
    );
    return res.data.data;
  },

  // & Get paginated attendance list.
  // % Ambil daftar absensi dengan paginasi.
  getAll: async (
    params: GetAdminAttendancesParams = {},
  ): Promise<{ data: AttendanceRecord[]; meta: AttendancePaginatedMeta }> => {
    // & Remove empty values from query params.
    // % Hapus nilai kosong dari query params.
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined),
    );
    const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      "/attendances/admin",
      { params: cleaned },
    );
    return {
      data: res.data.data,
      meta: res.data.meta as AttendancePaginatedMeta,
    };
  },

  // & Get attendance detail by id.
  // % Ambil detail absensi berdasarkan id.
  getById: async (id: string): Promise<AttendanceRecord> => {
    const res = await apiClient.get<ApiResponse<AttendanceRecord>>(
      `/attendances/admin/${id}`,
    );
    return res.data.data;
  },

  // & Create manual attendance record.
  // % Buat catatan absensi manual.
  createManual: async (
    data: ManualAttendanceInput,
  ): Promise<AttendanceRecord> => {
    const res = await apiClient.post<ApiResponse<AttendanceRecord>>(
      "/attendances/manual",
      data,
    );
    return res.data.data;
  },

  // & Correct attendance record by id.
  // % Koreksi absensi berdasarkan id.
  correct: async (
    id: string,
    data: CorrectAttendanceInput,
  ): Promise<AttendanceRecord> => {
    const res = await apiClient.put<ApiResponse<AttendanceRecord>>(
      `/attendances/admin/correct/${id}`,
      data,
    );
    return res.data.data;
  },

  // & Export attendance file.
  // % Export file absensi.
  export: async (params: ExportParams): Promise<void> => {
    const res = await apiClient.get("/attendances/admin/export", {
      params,
      responseType: "blob",
    });
    const blob = new Blob([res.data as BlobPart], {
      type:
        params.format === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absensi_${params.startDate}_sd_${params.endDate}.${params.format ?? "xlsx"}`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
