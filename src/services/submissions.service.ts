import { apiClient } from "../api/apiClient";
import type {
  CreateSubmissionInput,
  GetAdminSubmissionsParams,
  GetSubmissionsParams,
  SubmissionPaginatedMeta,
  SubmissionRecord,
  UpdateSubmissionStatusInput,
} from "../types/submissions.types";

// * Service ini menangani API pengajuan.
// * Mendukung endpoint mine dan admin.

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: SubmissionPaginatedMeta | null;
}

export const submissionsService = {
  // & Get own submissions with pagination.
  // % Ambil pengajuan pribadi dengan paginasi.
  getMy: async (
    params: GetSubmissionsParams = {},
  ): Promise<{ data: SubmissionRecord[]; meta: SubmissionPaginatedMeta }> => {
    const res = await apiClient.get<ApiResponse<SubmissionRecord[]>>(
      "/submissions/my",
      { params },
    );

    return {
      data: res.data.data,
      meta: (res.data.meta as SubmissionPaginatedMeta) ?? {
        total: res.data.data.length,
        page: params.page ?? 1,
        limit: params.limit ?? res.data.data.length,
        totalPages: 1,
      },
    };
  },

  // & Get own submission detail by id.
  // % Ambil detail pengajuan pribadi berdasarkan id.
  getMyDetail: async (id: string): Promise<SubmissionRecord> => {
    const res = await apiClient.get<ApiResponse<SubmissionRecord>>(
      `/submissions/my/${id}`,
    );
    return res.data.data;
  },

  // & Create submission with optional attachment.
  // % Buat pengajuan dengan lampiran opsional.
  create: async (payload: CreateSubmissionInput): Promise<SubmissionRecord> => {
    const form = new FormData();
    form.append("type", payload.type);
    form.append("startDate", payload.startDate);
    form.append("endDate", payload.endDate);
    form.append("reason", payload.reason);

    if (payload.attachmentFile) {
      form.append("attachmentFile", payload.attachmentFile);
    }

    const res = await apiClient.post<ApiResponse<SubmissionRecord>>(
      "/submissions",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data.data;
  },

  // & Get all submissions for admin.
  // % Ambil semua pengajuan untuk admin.
  getAllAdmin: async (
    params: GetAdminSubmissionsParams = {},
  ): Promise<{ data: SubmissionRecord[]; meta: SubmissionPaginatedMeta }> => {
    const res = await apiClient.get<ApiResponse<SubmissionRecord[]>>(
      "/submissions",
      { params },
    );

    return {
      data: res.data.data,
      meta: (res.data.meta as SubmissionPaginatedMeta) ?? {
        total: res.data.data.length,
        page: params.page ?? 1,
        limit: params.limit ?? res.data.data.length,
        totalPages: 1,
      },
    };
  },

  // & Get admin submission detail by id.
  // % Ambil detail pengajuan admin berdasarkan id.
  getDetailAdmin: async (id: string): Promise<SubmissionRecord> => {
    const res = await apiClient.get<ApiResponse<SubmissionRecord>>(
      `/submissions/admin/${id}`,
    );
    return res.data.data;
  },

  // & Update submission status by id.
  // % Ubah status pengajuan berdasarkan id.
  updateStatus: async (
    id: string,
    payload: UpdateSubmissionStatusInput,
  ): Promise<SubmissionRecord> => {
    const res = await apiClient.put<ApiResponse<SubmissionRecord>>(
      `/submissions/${id}/status`,
      payload,
    );
    return res.data.data;
  },

  // & Delete submission by id from admin endpoint.
  // % Hapus pengajuan berdasarkan id dari endpoint admin.
  deleteAdmin: async (id: string): Promise<SubmissionRecord> => {
    const res = await apiClient.delete<ApiResponse<SubmissionRecord>>(
      `/submissions/${id}`,
    );
    return res.data.data;
  },
};
