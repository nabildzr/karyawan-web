// * Service ini menangani API biometrik wajah.
// * Mendukung endpoint user dan admin.

import { apiClient } from "../api/apiClient";
import type {
  FaceCheckResult,
  FacePaginatedMeta,
  FaceRecord,
  GetFacesParams,
} from "../types/faces.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: FacePaginatedMeta | null;
}

export const facesService = {
  // & User scoped endpoints.
  // % Endpoint scope user.

  // & Register face image.
  // % Daftarkan gambar wajah.
  register: async (userId: string, imageFile: File): Promise<void> => {
    const form = new FormData();
    form.append("image", imageFile);
    form.append("userId", userId);
    await apiClient.post<ApiResponse<null>>(`/faces/admin/register`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // & Update own face image.
  // % Ubah gambar wajah milik sendiri.
  updateOwn: async (imageFile: File): Promise<void> => {
    const form = new FormData();
    form.append("image", imageFile);
    await apiClient.put<ApiResponse<null>>("/faces/update", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // & Check whether own face is registered.
  // % Cek apakah wajah sendiri sudah terdaftar.
  checkOwn: async (): Promise<FaceCheckResult> => {
    const res =
      await apiClient.get<ApiResponse<FaceCheckResult>>("/faces/check");
    return res.data.data;
  },

  // & Admin scoped endpoints.
  // % Endpoint scope admin.

  // & Get all registered faces with pagination.
  // % Ambil semua wajah terdaftar dengan paginasi.
  adminGetAll: async (
    params: GetFacesParams = {},
  ): Promise<{ data: FaceRecord[]; meta: FacePaginatedMeta }> => {
    const res = await apiClient.get<ApiResponse<FaceRecord[]>>("/faces/admin", {
      params,
    });
    return {
      data: res.data.data,
      meta: res.data.meta as FacePaginatedMeta,
    };
  },

  // & Get face data by user id.
  // % Ambil data wajah berdasarkan user id.
  adminGetById: async (userId: string): Promise<FaceRecord> => {
    const res = await apiClient.get<ApiResponse<FaceRecord>>(
      `/faces/admin/${userId}`,
    );
    return res.data.data;
  },

  // & Update face for selected user.
  // % Ubah wajah untuk user terpilih.
  adminUpdate: async (userId: string, imageFile: File): Promise<void> => {
    const form = new FormData();
    form.append("image", imageFile);
    await apiClient.put<ApiResponse<null>>(`/faces/admin/${userId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // & Delete face data for selected user.
  // % Hapus data wajah untuk user terpilih.
  adminDelete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/faces/admin/${userId}`);
  },

  // & Register face for selected user via admin endpoint.
  // % Daftarkan wajah untuk user terpilih via endpoint admin.
  // & Current implementation uses admin update flow.
  // % Implementasi saat ini memakai alur update admin.
  adminRegisterFor: async (userId: string, imageFile: File): Promise<void> => {
    const form = new FormData();
    form.append("image", imageFile);
    await apiClient.put<ApiResponse<null>>(`/faces/admin/${userId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
