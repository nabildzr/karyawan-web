// * File API endpoint map: src/api/endpoint.ts
// & This file centralizes frontend endpoint constants and dynamic path builders.
// % File ini memusatkan konstanta endpoint frontend dan builder path dinamis.
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    PROFILE: "/auth/me",
  },
  EMPLOYEES: {
    BASE: "/employees",
    // & Build employee detail endpoint by id.
    // % Bangun endpoint detail karyawan berdasarkan id.
    DETAIL: (id: string) => `/employees/${id}`,
  },
  ASSESSMENTS: {
    CATEGORIES: "/assessment-categories",
    SUBORDINATES: "/assessments/subordinates",
    MY_RESULTS: "/assessments/my-results",
  },
  AUDIT_LOGS: {
    BASE: "/audit-logs",
  },
  ATTENDANCES: {
    BASE: "/attendances",
    HISTORY: "/attendances/history",
    TODAY_CONTEXT: "/attendances/today-context",
  },
  SUBMISSIONS: {
    BASE: "/submissions",
    MY: "/submissions/my",
    // & Build submission detail endpoint for employee scope.
    // % Bangun endpoint detail pengajuan untuk scope karyawan.
    MY_DETAIL: (id: string) => `/submissions/my/${id}`,
    // & Build submission detail endpoint for admin scope.
    // % Bangun endpoint detail pengajuan untuk scope admin.
    ADMIN_DETAIL: (id: string) => `/submissions/admin/${id}`,
    // & Build status update endpoint used by approval workflow.
    // % Bangun endpoint update status yang dipakai alur approval.
    UPDATE_STATUS: (id: string) => `/submissions/${id}/status`,
    // & Build delete endpoint for submission by id.
    // % Bangun endpoint hapus pengajuan berdasarkan id.
    DELETE: (id: string) => `/submissions/${id}`,
  },
};
