// * Service ini menangani API divisi.
// * Menyediakan operasi list, detail, dan CRUD.

import { apiClient } from "../api/apiClient";
import type {
  CreateDivisionInput,
  Division,
  UpdateDivisionInput,
} from "../types/hierarki.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

export const divisiService = {
  // & Get division list with optional relations.
  // % Ambil daftar divisi dengan relasi opsional.
  getAll: async (
    withPositions = false,
    withManager = false,
    withEmployees = false,
  ): Promise<Division[]> => {
    const res = await apiClient.get<ApiResponse<Division[]>>("/divisions", {
      params: { withPositions, withManager, withEmployees },
    });
    return res.data.data;
  },

  // & Get division detail by id.
  // % Ambil detail divisi berdasarkan id.
  getById: async (
    id: string,
    withPositions = true,
    withManager = true,
    withEmployees = false,
  ): Promise<Division> => {
    const res = await apiClient.get<ApiResponse<Division>>(
      `/divisions/${id}`,
      { params: { withPositions, withManager, withEmployees } },
    );
    return res.data.data;
  },

  // & Create new division.
  // % Buat divisi baru.
  create: async (data: CreateDivisionInput): Promise<Division> => {
    const res = await apiClient.post<ApiResponse<Division>>(
      "/divisions",
      data,
    );
    return res.data.data;
  },

  // & Update division by id.
  // % Ubah divisi berdasarkan id.
  update: async (id: string, data: UpdateDivisionInput): Promise<Division> => {
    const res = await apiClient.put<ApiResponse<Division>>(
      `/divisions/${id}`,
      data,
    );
    return res.data.data;
  },

  // & Delete division by id.
  // % Hapus divisi berdasarkan id.
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/divisions/${id}`);
  },
};
