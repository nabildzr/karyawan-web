import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoint";
import type { AdminDashboardData } from "../types/dashboard.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

export const dashboardService = {
  getAdminOverview: async (params?: {
    recentLimit?: number;
  }): Promise<AdminDashboardData> => {
    const res = await apiClient.get<ApiResponse<AdminDashboardData>>(
      API_ENDPOINTS.DASHBOARD.ADMIN,
      { params },
    );

    return res.data.data;
  },
};
