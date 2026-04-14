// * Service ini menangani API jabatan.
// * Menyediakan operasi list, detail, dan CRUD.

import { apiClient } from "../api/apiClient";
import type {
  CreatePositionInput,
  Position,
  UpdatePositionInput,
} from "../types/hierarki.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

export const jabatanService = {
  // & Get position list with optional relations.
  // % Ambil daftar jabatan dengan relasi opsional.
  getAll: async (
    withDivision = true,
    withEmployees = true,
  ): Promise<Position[]> => {
    const res = await apiClient.get<ApiResponse<Position[]>>("/positions", {
      params: { withDivision, withEmployees },
    });
    return res.data.data;
  },

  // & Get position detail by id.
  // % Ambil detail jabatan berdasarkan id.
  getById: async (
    id: string,
    withDivision = true,
    withEmployees = true,
  ): Promise<Position> => {
    const res = await apiClient.get<ApiResponse<Position>>(
      `/positions/${id}`,
      { params: { withDivision, withEmployees } },
    );
    return res.data.data;
  },

  // & Create new position.
  // % Buat jabatan baru.
  create: async (data: CreatePositionInput): Promise<Position> => {
    const res = await apiClient.post<ApiResponse<Position>>(
      "/positions",
      data,
    );
    return res.data.data;
  },

  // & Update position by id.
  // % Ubah jabatan berdasarkan id.
  update: async (id: string, data: UpdatePositionInput): Promise<Position> => {
    const res = await apiClient.put<ApiResponse<Position>>(
      `/positions/${id}`,
      data,
    );
    return res.data.data;
  },

  // & Delete position by id.
  // % Hapus jabatan berdasarkan id.
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/positions/${id}`);
  },
};
