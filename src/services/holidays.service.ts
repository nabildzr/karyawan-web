// * Service ini menangani API hari libur.
// * Menyediakan operasi list, sync, dan CRUD.

import { apiClient } from "../api/apiClient";
import type {
  CreateHolidayInput,
  PaginatedMeta,
  PublicHoliday,
  SyncMeta,
  SyncResult,
  UpdateHolidayInput,
} from "../types/holidays.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: PaginatedMeta | SyncMeta | null;
}

export interface GetAllHolidaysParams {
  page?: number;
  limit?: number;
  search?: string;
  year?: number;
}

export const holidaysService = {
  // & Get holidays with pagination and filter.
  // % Ambil hari libur dengan paginasi dan filter.
  getAll: async (
    params: GetAllHolidaysParams = {},
  ): Promise<{ data: PublicHoliday[]; meta: PaginatedMeta }> => {
    const res = await apiClient.get<ApiResponse<PublicHoliday[]>>("/holidays", {
      params,
    });
    return {
      data: res.data.data,
      meta: res.data.meta as PaginatedMeta,
    };
  },

  // & Get holiday detail by id.
  // % Ambil detail hari libur berdasarkan id.
  getById: async (id: string): Promise<PublicHoliday> => {
    const res = await apiClient.get<ApiResponse<PublicHoliday>>(
      `/holidays/${id}`,
    );
    return res.data.data;
  },

  // & Create new holiday.
  // % Buat hari libur baru.
  create: async (data: CreateHolidayInput): Promise<PublicHoliday> => {
    const res = await apiClient.post<ApiResponse<PublicHoliday>>(
      "/holidays",
      data,
    );
    return res.data.data;
  },

  // & Update holiday by id.
  // % Ubah hari libur berdasarkan id.
  update: async (
    id: string,
    data: UpdateHolidayInput,
  ): Promise<PublicHoliday> => {
    const res = await apiClient.put<ApiResponse<PublicHoliday>>(
      `/holidays/${id}`,
      data,
    );
    return res.data.data;
  },

  // & Delete holiday by id.
  // % Hapus hari libur berdasarkan id.
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/holidays/${id}`);
  },

  // & Sync holidays from external source.
  // % Sinkron hari libur dari sumber eksternal.
  sync: async (): Promise<{ data: SyncResult[]; inserted: number }> => {
    const res = await apiClient.post<ApiResponse<SyncResult[]>>(
      "/holidays/sync",
    );
    return {
      data: res.data.data,
      inserted: (res.data.meta as SyncMeta)?.inserted ?? res.data.data.length,
    };
  },
};
