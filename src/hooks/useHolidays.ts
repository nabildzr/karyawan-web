// * Frontend module: karyawan-web/src/hooks/useHolidays.ts
// & This file defines frontend UI or logic for useHolidays.ts.
// % File ini mendefinisikan UI atau logika frontend untuk useHolidays.ts.

import { useCallback, useState } from "react";
import type { GetAllHolidaysParams } from "../services/holidays.service";
import { holidaysService } from "../services/holidays.service";
import type {
  CreateHolidayInput,
  PaginatedMeta,
  PublicHoliday,
  UpdateHolidayInput,
} from "../types/holidays.types";

const DEFAULT_META: PaginatedMeta = {
  total: 0,
  page: 1,
  limit: 5,
  totalPages: 1,
};

// * Hook ini mengelola data hari libur admin.
// * Mendukung list, sync, dan aksi CRUD.
export function useHolidays() {
  // & State for list, pagination, and status.
  // % State untuk daftar, paginasi, dan status.
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // & Keep latest query params for refetch.
  // % Simpan query terakhir untuk refetch.
  const [queryParams, setQueryParams] = useState<GetAllHolidaysParams>({
    page: 1,
    limit: 5,
    search: "",
  });

  // & Fetch holiday list with params.
  // % Ambil daftar hari libur sesuai params.
  const fetchAll = useCallback(async (params: GetAllHolidaysParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await holidaysService.getAll(params);
      setHolidays(result.data);
      setMeta(result.meta);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data hari libur",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // & Handle table query change.
  // % Tangani perubahan query dari tabel.
  const handleQueryChange = useCallback(
    (params: { page: number; limit: number; search: string }) => {
      fetchAll(params);
    },
    [fetchAll],
  );

  // & Manual refetch with current params.
  // % Refetch manual dengan params saat ini.
  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  // & Create holiday then refresh.
  // % Buat hari libur lalu refresh.
  const create = async (input: CreateHolidayInput): Promise<void> => {
    await holidaysService.create(input);
    await fetchAll({ ...queryParams, page: 1 });
  };

  // & Update holiday then refresh.
  // % Ubah hari libur lalu refresh.
  const update = async (
    id: string,
    input: UpdateHolidayInput,
  ): Promise<void> => {
    await holidaysService.update(id, input);
    await fetchAll(queryParams);
  };

  // & Delete holiday then refresh.
  // % Hapus hari libur lalu refresh.
  const remove = async (id: string): Promise<void> => {
    await holidaysService.delete(id);
    const newPage =
      holidays.length === 1 && queryParams.page && queryParams.page > 1
        ? queryParams.page - 1
        : queryParams.page ?? 1;
    await fetchAll({ ...queryParams, page: newPage });
  };

  // & Sync holidays from external API.
  // % Sinkron hari libur dari API eksternal.
  const sync = async (): Promise<number> => {
    setSyncing(true);
    try {
      const result = await holidaysService.sync();
      await fetchAll({ ...queryParams, page: 1 });
      return result.inserted;
    } finally {
      setSyncing(false);
    }
  };

  return {
    holidays,
    meta,
    loading,
    error,
    syncing,
    refetch,
    fetchAll,
    handleQueryChange,
    create,
    update,
    remove,
    sync,
  };
}
