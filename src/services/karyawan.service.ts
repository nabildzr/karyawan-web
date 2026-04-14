// * Service ini menangani API karyawan.
// * Menyediakan operasi list, detail, dan CRUD.

import { apiClient } from "../api/apiClient";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeDetail2,
  PaginatedMeta,
  UpdateEmployeeInput,
} from "../types/karyawan.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta: PaginatedMeta;
}

export interface GetAllEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const karyawanService = {
  // & Get employees with pagination and search.
  // % Ambil karyawan dengan paginasi dan pencarian.
  getAll: async (
    params: GetAllEmployeesParams = {},
  ): Promise<{ data: Employee[]; meta: PaginatedMeta }> => {
    const res = await apiClient.get<ApiPaginatedResponse<Employee[]>>(
      "/employees",
      { params },
    );
    return { data: res.data.data, meta: res.data.meta };
  },

  // & Get employee detail by id.
  // % Ambil detail karyawan berdasarkan id.
  getById: async (id: string): Promise<EmployeeDetail2> => {
    const res = await apiClient.get<ApiResponse<EmployeeDetail2>>(
      `/employees/${id}`,
    );
    return res.data.data;
  },

  // & Create new employee.
  // % Buat karyawan baru.
  create: async (data: CreateEmployeeInput): Promise<Employee> => {
    const res = await apiClient.post<ApiResponse<Employee>>(
      "/employees",
      data,
    );
    return res.data.data;
  },

  // & Update employee by id.
  // % Ubah karyawan berdasarkan id.
  update: async (id: string, data: UpdateEmployeeInput): Promise<Employee> => {
    const res = await apiClient.put<ApiResponse<Employee>>(
      `/employees/${id}`,
      data,
    );
    return res.data.data;
  },

  // & Delete employee by id.
  // % Hapus karyawan berdasarkan id.
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};
