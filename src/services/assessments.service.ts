// * Service ini menangani semua API penilaian.
// * Mencakup kategori, dashboard, laporan, dan submit nilai.

import { apiClient } from "../api/apiClient";
import type {
  AssessmentCategory,
  AssessmentCategoryStats,
  AssessmentDashboardStats,
  CreateCategoryInput,
  IndividualReport,
  MyResultsResponse,
  ReportResponse,
  SubmitAssessmentInput,
  SubordinateEmployee,
  UpdateAssessmentInput,
  UpdateCategoryInput,
} from "../types/assessments.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const assessmentsService = {
  // & Category endpoints.
  // % Endpoint kategori.

  // & Get category stats for dashboard display.
  // % Ambil statistik kategori untuk tampilan dashboard.
  getCategoryStats: async (): Promise<AssessmentCategoryStats> => {
    const res = await apiClient.get<ApiResponse<AssessmentCategoryStats>>(
      "/assessment-categories/stats"
    );
    return res.data.data;
  },

  // & Get categories with optional active filter.
  // % Ambil kategori dengan filter aktif opsional.
  getCategories: async (params?: { isActive?: string; type?: string }): Promise<AssessmentCategory[]> => {
    const res = await apiClient.get<ApiResponse<AssessmentCategory[]>>(
      "/assessment-categories/",
      { params }
    );
    return res.data.data;
  },

  // & Create new category.
  // % Buat kategori baru.
  createCategory: async (data: CreateCategoryInput): Promise<AssessmentCategory> => {
    const res = await apiClient.post<ApiResponse<AssessmentCategory>>(
      "/assessment-categories/",
      data
    );
    return res.data.data;
  },

  // & Update existing category.
  // % Ubah kategori yang sudah ada.
  updateCategory: async (id: string, data: UpdateCategoryInput): Promise<AssessmentCategory> => {
    const res = await apiClient.patch<ApiResponse<AssessmentCategory>>(
      `/assessment-categories/${id}`,
      data
    );
    return res.data.data;
  },

  // & Delete category by id.
  // % Hapus kategori berdasarkan id.
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/assessment-categories/${id}`);
  },

  // & Toggle category active status.
  // % Toggle status aktif kategori.
  toggleCategoryActive: async (id: string, isActive: boolean): Promise<AssessmentCategory> => {
    const res = await apiClient.patch<ApiResponse<AssessmentCategory>>(
      `/assessment-categories/${id}`,
      { isActive }
    );
    return res.data.data;
  },

  // & Assessment endpoints.
  // % Endpoint penilaian.

  // & Get dashboard stats with optional period and division filters.
  // % Ambil statistik dashboard dengan filter periode dan divisi opsional.
  getDashboardStats: async (params?: {
    period?: string;
    divisionId?: string;
  }): Promise<AssessmentDashboardStats> => {
    const res = await apiClient.get<ApiResponse<AssessmentDashboardStats>>(
      "/assessments/stats-penilaian",
      { params }
    );
    return res.data.data;
  },

  // & Get subordinates for current user with optional period and division filters.
  // % Ambil bawahan untuk pengguna saat ini dengan filter periode dan divisi opsional.
  getSubordinates: async (
    period: string,
    params?: { divisionId?: string }
  ): Promise<SubordinateEmployee[]> => {
    const res = await apiClient.get<ApiResponse<SubordinateEmployee[]>>(
      "/assessments/subordinates",
      { params: { period, ...params } }
    );
    return res.data.data;
  },

  // & Get report with pagination, search, and filters.
  // % Ambil laporan dengan paginasi, pencarian, dan filter.
  getReport: async (params: {
    period: string;
    page?: number;
    limit?: number;
    search?: string;
    divisionId?: string;
  }): Promise<ReportResponse> => {
    const res = await apiClient.get<{
      success: boolean;
      stats: ReportResponse["stats"];
      data: ReportResponse["data"];
      meta: ReportResponse["meta"];
    }>("/assessments/report", { params });
    return { stats: res.data.stats, data: res.data.data, meta: res.data.meta };
  },

  // & Export report file by selected format. pdf or excel.
  // % Export file laporan sesuai format. pdf atau excel.
  exportReport: async (params: {
    period: string;
    format?: "xlsx" | "pdf";
    divisionId?: string;
    search?: string;
  }): Promise<void> => {
    const res = await apiClient.get("/assessments/report/export", {
      params,
      responseType: "blob",
    });
    const ext = params.format === "pdf" ? "pdf" : "xlsx";
    const mimeType = ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const url = window.URL.createObjectURL(new Blob([res.data as BlobPart], { type: mimeType }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_penilaian_${params.period.replace(/ /g, "_")}.${ext}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // & Get individual report by employee and period.
  // % Ambil laporan individu berdasarkan karyawan dan periode.
  getIndividualByEmployee: async (
    employeeId: string,
    period: string
  ): Promise<IndividualReport> => {
    const res = await apiClient.get<ApiResponse<IndividualReport>>(
      `/assessments/individual/by-employee/${employeeId}`,
      { params: { period } }
    );
    return res.data.data;
  },

  // & Get individual report by assessment id.
  // % Ambil laporan individu berdasarkan id penilaian.
  getIndividualById: async (assessmentId: string): Promise<IndividualReport> => {
    const res = await apiClient.get<ApiResponse<IndividualReport>>(
      `/assessments/individual/${assessmentId}`
    );
    return res.data.data;
  },

  // & Return null when no self result exists.
  // % Kembalikan null saat hasil pribadi belum ada.
  getMyResults: async (period: string): Promise<MyResultsResponse | null> => {
    const res = await apiClient.get<ApiResponse<MyResultsResponse>>(
      "/assessments/my-results",
      {
        params: { period },
        validateStatus: (status) => status === 200 || status === 404,
      }
    );

    if (res.status === 404) {
      return null;
    }

    return res.data.data;
  },

  // & Export individual report to PDF.
  // % Export laporan individu ke PDF.
  exportIndividualPdf: async (assessmentId: string): Promise<void> => {
    const res = await apiClient.get(
      `/assessments/individual/${assessmentId}/export-pdf`,
      { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([res.data as BlobPart], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_individu_${assessmentId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // & Submit new assessment.
  // % Kirim penilaian baru.
  submit: async (data: SubmitAssessmentInput): Promise<void> => {
    await apiClient.post("/assessments/", data);
  },

  // & Update existing assessment.
  // % Ubah penilaian yang sudah ada.
  update: async (id: string, data: UpdateAssessmentInput): Promise<void> => {
    await apiClient.patch(`/assessments/${id}`, data);
  },
};
