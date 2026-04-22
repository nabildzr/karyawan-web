// * Hooks Dompet Integritas: src/hooks/useIntegrity.ts
// & Custom hooks for admin and user-facing integrity wallet features.
// % Custom hooks untuk fitur dompet integritas admin dan user.

import { useCallback, useState } from "react";
import type { IntegrityQueryParams } from "../services/integrity.service";
import { integrityService } from "../services/integrity.service";
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

const DEFAULT_META: IntegrityPaginatedMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

// ========================================
// & Admin — Point Rules hook
// % Admin — Hook aturan poin
// ========================================
export function usePointRules() {
  const [rules, setRules] = useState<PointRule[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.adminRules.getAll(params);
      setRules(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat aturan poin");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  const create = async (input: CreatePointRuleInput): Promise<void> => {
    await integrityService.adminRules.create(input);
    await fetchAll({ ...queryParams, page: 1 });
  };

  const update = async (
    id: string,
    input: UpdatePointRuleInput,
  ): Promise<void> => {
    await integrityService.adminRules.update(id, input);
    await fetchAll(queryParams);
  };

  const remove = async (id: string): Promise<void> => {
    await integrityService.adminRules.delete(id);
    const newPage =
      rules.length === 1 && queryParams.page && queryParams.page > 1
        ? queryParams.page - 1
        : (queryParams.page ?? 1);
    await fetchAll({ ...queryParams, page: newPage });
  };

  return {
    rules,
    meta,
    loading,
    error,
    fetchAll,
    handleQueryChange,
    refetch,
    create,
    update,
    remove,
  };
}

// ========================================
// & Admin — Flexibility Items hook
// % Admin — Hook item marketplace
// ========================================
export function useFlexibilityItems() {
  const [items, setItems] = useState<FlexibilityItem[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.adminItems.getAll(params);
      setItems(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat item marketplace",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  const create = async (input: CreateFlexibilityItemInput): Promise<void> => {
    await integrityService.adminItems.create(input);
    await fetchAll({ ...queryParams, page: 1 });
  };

  const update = async (
    id: string,
    input: UpdateFlexibilityItemInput,
  ): Promise<void> => {
    await integrityService.adminItems.update(id, input);
    await fetchAll(queryParams);
  };

  const remove = async (id: string): Promise<void> => {
    await integrityService.adminItems.delete(id);
    const newPage =
      items.length === 1 && queryParams.page && queryParams.page > 1
        ? queryParams.page - 1
        : (queryParams.page ?? 1);
    await fetchAll({ ...queryParams, page: newPage });
  };

  return {
    items,
    meta,
    loading,
    error,
    fetchAll,
    handleQueryChange,
    refetch,
    create,
    update,
    remove,
  };
}

// ========================================
// & Admin — Leaderboard hook
// % Admin — Hook leaderboard
// ========================================
export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  // % Fungsi utama untuk fetch data leaderboard dengan query params tertentu.
  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.adminLeaderboard.getAll(params);
      setEntries(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  // % Fungsi untuk menangani perubahan query params, seperti saat user mengganti halaman atau melakukan pencarian.
  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  // % Fungsi untuk refetch data dengan queryParams saat ini, berguna setelah melakukan aksi seperti create/update/delete
  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  return {
    entries,
    meta,
    loading,
    error,
    fetchAll,
    handleQueryChange,
    refetch,
  };
}

// ========================================
// & Admin — Integrity Logs hook
// % Admin — Hook log integritas
// ========================================
export function useIntegrityLogs() {
  const [logs, setLogs] = useState<PointLedgerEntry[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  // % Fungsi utama untuk fetch data log integritas dengan query params tertentu.
  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.adminLogs.getAll(params);
      setLogs(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat log integritas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // % Fungsi untuk menangani perubahan query params, seperti saat user mengganti halaman atau melakukan pencarian.
  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  // % Fungsi untuk refetch data dengan queryParams saat ini, berguna setelah melakukan aksi seperti create/update/delete
  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  return { logs, meta, loading, error, fetchAll, handleQueryChange, refetch };
}

// ========================================
// & User — My Wallet hook
// % User — Hook dompet saya
// ========================================
export function useMyWallet() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // % Fungsi untuk fetch saldo dompet user saat ini.
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await integrityService.userWallet.getBalance();
      setBalance(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat saldo dompet",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { balance, loading, error, fetch };
}

// ========================================
// & User — My Ledger History hook
// % User — Hook riwayat ledger saya
// ========================================
export function useMyLedger() {
  const [entries, setEntries] = useState<PointLedgerEntry[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.userLedger.getAll(params);
      setEntries(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat riwayat poin",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  return {
    entries,
    meta,
    loading,
    error,
    fetchAll,
    handleQueryChange,
    refetch,
  };
}

// ========================================
// & User — My Token Inventory hook
// % User — Hook inventory token saya
// ========================================
export function useMyInventory() {
  const [tokens, setTokens] = useState<UserToken[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.userInventory.getAll(params);
      setTokens(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat inventory token",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  return { tokens, meta, loading, error, fetchAll, handleQueryChange, refetch };
}

// ========================================
// & User — Leaderboard hook
// % User — Hook leaderboard karyawan
// ========================================
export function useMyLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.userLeaderboard.getAll(params);
      setEntries(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat leaderboard karyawan",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  return {
    entries,
    meta,
    loading,
    error,
    fetchAll,
    handleQueryChange,
    refetch,
  };
}

// ========================================
// & User — Marketplace Browse & Buy hook
// % User — Hook browse & beli marketplace
// ========================================
export function useMarketplace() {
  const [items, setItems] = useState<FlexibilityItem[]>([]);
  const [meta, setMeta] = useState<IntegrityPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<IntegrityQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchAll = useCallback(async (params: IntegrityQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrityService.marketplace.getAll(params);
      setItems(Array.isArray(result.data) ? result.data : []);
      setMeta(result.meta ?? DEFAULT_META);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat marketplace");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (params: IntegrityQueryParams) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  // & Buy a token from marketplace and refresh list.
  // % Beli token dari marketplace lalu refresh daftar.
  const buy = async (itemId: string): Promise<BuyTokenResult> => {
    setBuying(true);
    try {
      return await integrityService.marketplace.buy(itemId);
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menukar token.",
      };
    } finally {
      setBuying(false);
    }
  };

  return {
    items,
    meta,
    loading,
    buying,
    error,
    fetchAll,
    handleQueryChange,
    refetch,
    buy,
  };
}
