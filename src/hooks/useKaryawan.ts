// * Frontend module: karyawan-web/src/hooks/useKaryawan.ts
// & This file defines frontend UI or logic for useKaryawan.ts.
// % File ini mendefinisikan UI atau logika frontend untuk useKaryawan.ts.

import { useCallback, useState } from "react";
import type { GetAllEmployeesParams } from "../services/karyawan.service";
import { karyawanService } from "../services/karyawan.service";
import type {
    CreateEmployeeInput,
    Employee,
    EmployeeDetail2,
    PaginatedMeta,
    UpdateEmployeeInput,
} from "../types/karyawan.types";

const DEFAULT_META: PaginatedMeta = {
  total: 0,
  page: 1,
  limit: 5,
  totalPages: 1,
};

// * Hook ini mengelola data karyawan admin.
// * Mendukung list, detail, dan aksi CRUD.
export function useKaryawan() {
  // & State for list, pagination, and status.
  // % State untuk daftar, paginasi, dan status.
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Keep latest query params for refetch.
  // % Simpan query terakhir untuk refetch.
  const [queryParams, setQueryParams] = useState<GetAllEmployeesParams>({
    page: 1,
    limit: 5,
    search: "",
  });

  // & Fetch employee list with params.
  // % Ambil daftar karyawan sesuai params.
  const fetchAll = useCallback(async (params: GetAllEmployeesParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await karyawanService.getAll(params);
      setEmployees(result.data);
      setMeta(result.meta);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data karyawan",
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

  // & Get employee detail by id.
  // % Ambil detail karyawan berdasarkan id.
  const getById = async (id: string): Promise<EmployeeDetail2> => {
    return karyawanService.getById(id);
  };

  // & Create employee then refresh list.
  // % Buat karyawan lalu refresh daftar.
  const create = async (input: CreateEmployeeInput): Promise<void> => {
    await karyawanService.create(input);
    await fetchAll({ ...queryParams, page: 1 });
  };

  // & Update employee then refresh list.
  // % Ubah karyawan lalu refresh daftar.
  const update = async (
    id: string,
    input: UpdateEmployeeInput,
  ): Promise<void> => {
    await karyawanService.update(id, input);
    await fetchAll(queryParams);
  };

  // & Delete employee then refresh list.
  // % Hapus karyawan lalu refresh daftar.
  const remove = async (id: string): Promise<void> => {
    await karyawanService.delete(id);
    // & Move back one page when last item is deleted.
    // % Mundur satu halaman jika item terakhir terhapus.
    const newPage =
      employees.length === 1 && queryParams.page && queryParams.page > 1
        ? queryParams.page - 1
        : queryParams.page ?? 1;
    await fetchAll({ ...queryParams, page: newPage });
  };

  return {
    employees,
    meta,
    loading,
    error,
    refetch,
    handleQueryChange,
    fetchAll,
    getById,
    create,
    update,
    remove,
  };
}
