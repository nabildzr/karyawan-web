// * Service Dompet Integritas: src/services/integrity.service.ts
// & API transport layer for point rules, marketplace, ledger, and tokens.
// % Layer transport API untuk aturan poin, marketplace, ledger, dan token.

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoint";
import type {
    BuyTokenResult,
    CreateFlexibilityItemInput,
    CreatePointRuleInput,
    FlexibilityItem,
    IntegrityPaginatedMeta,
    LeaderboardEntry,
    PointLedgerEntry,
    PointRule,
    UpdateFlexibilityItemInput,
    UpdatePointRuleInput,
    UserToken,
    WalletBalance,
} from "../types/integrity.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: IntegrityPaginatedMeta | null;
}

type LegacyPagination = {
  total?: number;
  skip?: number;
  take?: number;
  pages?: number;
};

export interface IntegrityQueryParams {
  page?: number;
  limit?: number;
  skip?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  targetRole?: string;
  transactionType?: string;
  userId?: string;
  referenceEntity?: string;
}

const isPaginatedMeta = (meta: unknown): meta is IntegrityPaginatedMeta => {
  if (!meta || typeof meta !== "object") return false;
  const value = meta as Record<string, unknown>;
  return (
    typeof value.total === "number" &&
    typeof value.page === "number" &&
    typeof value.limit === "number" &&
    typeof value.totalPages === "number"
  );
};

const ensureArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const buildMeta = (options: {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}): IntegrityPaginatedMeta => {
  const total = Number(options.total ?? 0);
  const page = Math.max(1, Number(options.page ?? 1));
  const limit = Math.max(1, Number(options.limit ?? 10));
  const fallbackTotalPages = Math.ceil(total / limit);
  const totalPages = Math.max(
    1,
    Number(options.totalPages ?? (fallbackTotalPages || 1)),
  );

  return {
    total,
    page,
    limit,
    totalPages,
  };
};

const normalizePaginatedPayload = <T>(
  payload: unknown,
  params: IntegrityQueryParams = {},
  explicitMeta?: IntegrityPaginatedMeta | null,
): { data: T[]; meta: IntegrityPaginatedMeta } => {
  const requestedPage = Number(params.page ?? 1);
  const requestedLimit = Number(params.limit ?? 10);

  if (Array.isArray(payload)) {
    const data = payload as T[];
    const meta = isPaginatedMeta(explicitMeta)
      ? explicitMeta
      : buildMeta({
          total: data.length,
          page: requestedPage,
          limit: requestedLimit,
        });
    return { data, meta };
  }

  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    const data = ensureArray<T>(
      body.data ??
        body.items ??
        body.entries ??
        body.rules ??
        body.logs ??
        body.tokens,
    );

    if (isPaginatedMeta(explicitMeta)) {
      return { data, meta: explicitMeta };
    }

    const pagination = (body.pagination ?? null) as LegacyPagination | null;
    if (pagination) {
      const limit = Number(pagination.take ?? requestedLimit);
      const skip = Number(pagination.skip ?? (requestedPage - 1) * limit);
      const page = limit > 0 ? Math.floor(skip / limit) + 1 : requestedPage;
      const total = Number(pagination.total ?? data.length);

      return {
        data,
        meta: buildMeta({
          total,
          page,
          limit,
          totalPages: Number(pagination.pages ?? undefined),
        }),
      };
    }

    return {
      data,
      meta: buildMeta({
        total: data.length,
        page: requestedPage,
        limit: requestedLimit,
      }),
    };
  }

  return {
    data: [],
    meta: buildMeta({
      total: 0,
      page: requestedPage,
      limit: requestedLimit,
    }),
  };
};

const normalizeLeaderboardRows = (rows: unknown[]): LeaderboardEntry[] =>
  rows.map((row, index) => {
    const value = (row ?? {}) as Record<string, unknown>;
    return {
      rank: Number(value.rank ?? index + 1),
      userId: String(value.userId ?? ""),
      name: String(value.name ?? value.userName ?? "Unknown"),
      userName:
        typeof value.userName === "string" ? value.userName : undefined,
      employeeId:
        typeof value.employeeId === "string" ? value.employeeId : undefined,
      role: typeof value.role === "string" ? value.role : undefined,
      position:
        typeof value.position === "string" ? value.position : null,
      division:
        typeof value.division === "string" ? value.division : null,
      balance: Number(value.balance ?? value.currentPoints ?? 0),
      totalEarned: Number(
        value.totalEarned ?? value.balance ?? value.currentPoints ?? 0,
      ),
      level: String(value.level ?? value.integrityLevel ?? "BRONZE") as LeaderboardEntry["level"],
    };
  });

const normalizeWalletPayload = (payload: unknown): WalletBalance => {
  const value = (payload ?? {}) as Record<string, unknown>;
  const balance = Number(value.balance ?? value.currentPoints ?? 0);
  const level = String(
    value.level ?? value.integrityLevel ?? "BRONZE",
  ) as WalletBalance["level"];
  const nextLevel =
    typeof value.nextLevel === "string"
      ? (value.nextLevel as WalletBalance["level"])
      : undefined;

  return {
    userId: String(value.userId ?? ""),
    balance,
    totalEarned: Number(value.totalEarned ?? 0),
    totalSpent: Number(value.totalSpent ?? 0),
    level,
    nextLevel,
    rank: Number(value.rank ?? 0),
    currentPoints: balance,
    integrityLevel: level,
    nextLevelThreshold:
      typeof value.nextLevelThreshold === "number"
        ? value.nextLevelThreshold
        : undefined,
    percentageToNextLevel:
      typeof value.percentageToNextLevel === "number"
        ? value.percentageToNextLevel
        : undefined,
  };
};

const normalizeLedgerRows = (rows: unknown[]): PointLedgerEntry[] =>
  rows.map((row) => {
    const value = (row ?? {}) as Record<string, unknown>;
    const nestedUser =
      value.user && typeof value.user === "object"
        ? (value.user as Record<string, unknown>)
        : null;

    return {
      id: String(value.id ?? ""),
      userId: String(value.userId ?? ""),
      transactionType: String(
        value.transactionType ?? "EARN",
      ) as PointLedgerEntry["transactionType"],
      amount: Number(value.amount ?? 0),
      balanceBefore:
        typeof value.balanceBefore === "number" ? value.balanceBefore : undefined,
      balanceAfter:
        typeof value.balanceAfter === "number" ? value.balanceAfter : undefined,
      currentBalance: Number(
        value.currentBalance ?? value.balanceAfter ?? value.balance ?? 0,
      ),
      description:
        typeof value.description === "string" ? value.description : null,
      referenceEntity:
        typeof value.referenceEntity === "string"
          ? value.referenceEntity
          : null,
      referenceId:
        typeof value.referenceId === "string" ? value.referenceId : null,
      createdAt: String(value.createdAt ?? new Date().toISOString()),
      updatedAt:
        typeof value.updatedAt === "string" ? value.updatedAt : undefined,
      user: nestedUser
        ? {
            id: String(nestedUser.id ?? ""),
            employeeId:
              typeof nestedUser.employeeId === "string"
                ? nestedUser.employeeId
                : undefined,
            name: String(
              nestedUser.name ?? nestedUser.employeeId ?? nestedUser.id ?? "Unknown",
            ),
            email:
              typeof nestedUser.email === "string"
                ? nestedUser.email
                : undefined,
            role:
              typeof nestedUser.role === "string" ? nestedUser.role : undefined,
            balance:
              typeof nestedUser.balance === "number"
                ? nestedUser.balance
                : undefined,
          }
        : undefined,
    };
  });

const normalizeTokenRows = (rows: unknown[]): UserToken[] =>
  rows.map((row) => {
    const value = (row ?? {}) as Record<string, unknown>;
    const item =
      value.item && typeof value.item === "object"
        ? (value.item as UserToken["item"])
        : undefined;

    return {
      id: String(value.id ?? ""),
      userId: String(value.userId ?? ""),
      itemId: String(value.itemId ?? ""),
      status: String(value.status ?? "AVAILABLE") as UserToken["status"],
      usedAt:
        typeof value.usedAt === "string" ? value.usedAt : null,
      expiresAt: String(value.expiresAt ?? new Date().toISOString()),
      remainingDays: Number(value.remainingDays ?? 0),
      usedAtAttendanceId:
        typeof value.usedAtAttendanceId === "string"
          ? value.usedAtAttendanceId
          : null,
      createdAt: String(value.createdAt ?? new Date().toISOString()),
      updatedAt: String(value.updatedAt ?? new Date().toISOString()),
      item,
    };
  });

export const integrityService = {
  // ========================================
  // & ADMIN — Point Rules
  // % ADMIN — Aturan Poin
  // ========================================
  adminRules: {
    // & List all point rules with pagination.
    // % Ambil daftar semua aturan poin dengan paginasi.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{ data: PointRule[]; meta: IntegrityPaginatedMeta }> => {
      const res = await apiClient.get<ApiResponse<PointRule[]>>(
        API_ENDPOINTS.POINTS.ADMIN_RULES,
        { params },
      );
      return normalizePaginatedPayload<PointRule>(
        res.data.data,
        params,
        res.data.meta,
      );
    },

    // & Create a new point rule.
    // % Buat aturan poin baru.
    create: async (input: CreatePointRuleInput): Promise<PointRule> => {
      const res = await apiClient.post<ApiResponse<PointRule>>(
        API_ENDPOINTS.POINTS.ADMIN_RULES,
        input,
      );
      return res.data.data;
    },

    // & Update existing point rule by id.
    // % Update aturan poin berdasarkan id.
    update: async (
      id: string,
      input: UpdatePointRuleInput,
    ): Promise<PointRule> => {
      const res = await apiClient.put<ApiResponse<PointRule>>(
        API_ENDPOINTS.POINTS.ADMIN_RULE_DETAIL(id),
        input,
      );
      return res.data.data;
    },

    // & Soft-delete (deactivate) a point rule.
    // % Soft-delete (nonaktifkan) aturan poin.
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(API_ENDPOINTS.POINTS.ADMIN_RULE_DETAIL(id));
    },
  },

  // ========================================
  // & ADMIN — Flexibility Items (Marketplace)
  // % ADMIN — Item Fleksibilitas (Marketplace)
  // ========================================
  adminItems: {
    // & List all marketplace items with pagination.
    // % Ambil semua item marketplace dengan paginasi.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{ data: FlexibilityItem[]; meta: IntegrityPaginatedMeta }> => {
      const res = await apiClient.get<ApiResponse<FlexibilityItem[]>>(
        API_ENDPOINTS.POINTS.ADMIN_ITEMS,
        { params },
      );
      return normalizePaginatedPayload<FlexibilityItem>(
        res.data.data,
        params,
        res.data.meta,
      );
    },

    // & Create a new marketplace item.
    // % Buat item marketplace baru.
    create: async (
      input: CreateFlexibilityItemInput,
    ): Promise<FlexibilityItem> => {
      const res = await apiClient.post<ApiResponse<FlexibilityItem>>(
        API_ENDPOINTS.POINTS.ADMIN_ITEMS,
        input,
      );
      return res.data.data;
    },

    // & Update marketplace item by id.
    // % Update item marketplace berdasarkan id.
    update: async (
      id: string,
      input: UpdateFlexibilityItemInput,
    ): Promise<FlexibilityItem> => {
      const res = await apiClient.put<ApiResponse<FlexibilityItem>>(
        API_ENDPOINTS.POINTS.ADMIN_ITEM_DETAIL(id),
        input,
      );
      return res.data.data;
    },

    // & Delete marketplace item by id.
    // % Hapus item marketplace berdasarkan id.
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(API_ENDPOINTS.POINTS.ADMIN_ITEM_DETAIL(id));
    },
  },

  // ========================================
  // & ADMIN — Leaderboard Analytics
  // % ADMIN — Analitik Leaderboard
  // ========================================
  adminLeaderboard: {
    // & Get integrity leaderboard with pagination.
    // % Ambil leaderboard integritas dengan paginasi.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{
      data: LeaderboardEntry[];
      meta: IntegrityPaginatedMeta;
    }> => {
      const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
        API_ENDPOINTS.POINTS.ADMIN_LEADERBOARD,
        { params },
      );
      const normalized = normalizePaginatedPayload<unknown>(
        res.data.data,
        params,
        res.data.meta,
      );
      return {
        data: normalizeLeaderboardRows(normalized.data),
        meta: normalized.meta,
      };
    },
  },

  // ========================================
  // & ADMIN — Integrity Logs (Ledger global)
  // % ADMIN — Log Integritas (Ledger global)
  // ========================================
  adminLogs: {
    // & Get all ledger entries across users for admin view.
    // % Ambil semua entry ledger lintas user untuk tampilan admin.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{
      data: PointLedgerEntry[];
      meta: IntegrityPaginatedMeta;
    }> => {
      const res = await apiClient.get<ApiResponse<PointLedgerEntry[]>>(
        API_ENDPOINTS.POINTS.ADMIN_LEDGERS,
        { params },
      );
      const normalized = normalizePaginatedPayload<unknown>(
        res.data.data,
        params,
        res.data.meta,
      );
      return {
        data: normalizeLedgerRows(normalized.data),
        meta: normalized.meta,
      };
    },
  },

  // ========================================
  // & USER — Wallet
  // % USER — Dompet
  // ========================================
  userWallet: {
    // & Get current user wallet balance summary.
    // % Ambil ringkasan saldo dompet user saat ini.
    getBalance: async (): Promise<WalletBalance> => {
      const res = await apiClient.get<ApiResponse<WalletBalance>>(
        API_ENDPOINTS.POINTS.MY_WALLET,
      );
      return normalizeWalletPayload(res.data.data);
    },
  },

  // ========================================
  // & USER — Ledger History
  // % USER — Riwayat Ledger
  // ========================================
  userLedger: {
    // & Get user's point mutation history.
    // % Ambil riwayat mutasi poin user.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{
      data: PointLedgerEntry[];
      meta: IntegrityPaginatedMeta;
    }> => {
      const res = await apiClient.get<ApiResponse<PointLedgerEntry[]>>(
        API_ENDPOINTS.POINTS.MY_LEDGERS,
        { params },
      );
      const normalized = normalizePaginatedPayload<unknown>(
        res.data.data,
        params,
        res.data.meta,
      );
      return {
        data: normalizeLedgerRows(normalized.data),
        meta: normalized.meta,
      };
    },
  },

  // ========================================
  // & USER — Token Inventory
  // % USER — Inventory Token
  // ========================================
  userInventory: {
    // & Get user's token inventory with optional status filter.
    // % Ambil inventory token user dengan filter status opsional.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{ data: UserToken[]; meta: IntegrityPaginatedMeta }> => {
      const res = await apiClient.get<ApiResponse<UserToken[]>>(
        API_ENDPOINTS.POINTS.MY_INVENTORY,
        { params },
      );
      const normalized = normalizePaginatedPayload<unknown>(
        res.data.data,
        params,
        res.data.meta,
      );
      return {
        data: normalizeTokenRows(normalized.data),
        meta: normalized.meta,
      };
    },
  },

  // ========================================
  // & USER — Leaderboard
  // % USER — Leaderboard
  // ========================================
  userLeaderboard: {
    // & Get employee leaderboard with lightweight fields.
    // % Ambil leaderboard karyawan dengan field yang ringan.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{
      data: LeaderboardEntry[];
      meta: IntegrityPaginatedMeta;
    }> => {
      const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
        API_ENDPOINTS.POINTS.MY_LEADERBOARD,
        { params },
      );
      const normalized = normalizePaginatedPayload<unknown>(
        res.data.data,
        params,
        res.data.meta,
      );
      return {
        data: normalizeLeaderboardRows(normalized.data),
        meta: normalized.meta,
      };
    },
  },

  // ========================================
  // & USER — Marketplace
  // % USER — Marketplace
  // ========================================
  marketplace: {
    // & Browse marketplace items available for purchase.
    // % Browse item marketplace yang tersedia untuk dibeli.
    getAll: async (
      params: IntegrityQueryParams = {},
    ): Promise<{
      data: FlexibilityItem[];
      meta: IntegrityPaginatedMeta;
    }> => {
      const res = await apiClient.get<ApiResponse<FlexibilityItem[]>>(
        API_ENDPOINTS.POINTS.MARKETPLACE,
        { params },
      );
      return normalizePaginatedPayload<FlexibilityItem>(
        res.data.data,
        params,
        res.data.meta,
      );
    },

    // & Buy a token from the marketplace.
    // % Beli token dari marketplace.
    buy: async (itemId: string): Promise<BuyTokenResult> => {
      const res = await apiClient.post<ApiResponse<BuyTokenResult>>(
        API_ENDPOINTS.POINTS.BUY_TOKEN(itemId),
      );
      const payload: Record<string, unknown> =
        res.data.data && typeof res.data.data === "object"
          ? (res.data.data as unknown as Record<string, unknown>)
          : {};

      return {
        success: Boolean(payload.success),
        token:
          payload.token && typeof payload.token === "object"
            ? normalizeTokenRows([payload.token])[0]
            : undefined,
        error: typeof payload.error === "string" ? payload.error : undefined,
      };
    },
  },
};
