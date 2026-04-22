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
  DASHBOARD: {
    ADMIN: "/dashboard/admin",
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
  // & Points / Integrity Wallet endpoints.
  // % Endpoint Dompet Integritas / Poin.
  POINTS: {
    // & Admin scope — rules CRUD.
    // % Scope admin — CRUD aturan poin.
    ADMIN_RULES: "/points/admin/point-rules",
    ADMIN_RULE_DETAIL: (id: string) => `/points/admin/point-rules/${id}`,
    // & Admin scope — marketplace items CRUD.
    // % Scope admin — CRUD item marketplace.
    ADMIN_ITEMS: "/points/admin/flexibility-items",
    ADMIN_ITEM_DETAIL: (id: string) => `/points/admin/flexibility-items/${id}`,
    // & Admin scope — leaderboard analytics.
    // % Scope admin — analitik leaderboard.
    ADMIN_LEADERBOARD: "/points/admin/analytics/leaderboard",
    // & Admin scope — global point ledgers.
    // % Scope admin — ledger poin global.
    ADMIN_LEDGERS: "/points/admin/point-ledgers",
    // & User scope — wallet, ledger, inventory.
    // % Scope user — dompet, ledger, inventory.
    MY_WALLET: "/points/my/wallet",
    MY_LEDGERS: "/points/my/ledgers",
    MY_INVENTORY: "/points/my/inventory",
    MY_LEADERBOARD: "/points/my/leaderboard",
    // & Public authenticated — marketplace browse and buy.
    // % Publik terautentikasi — browse dan beli marketplace.
    MARKETPLACE: "/points/marketplace",
    BUY_TOKEN: (itemId: string) => `/points/marketplace/${itemId}/buy`,
  },
};
