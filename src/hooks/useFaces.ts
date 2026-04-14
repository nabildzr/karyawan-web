import { useCallback, useState } from "react";
import { facesService } from "../services/faces.service";
import type {
  FacePaginatedMeta,
  FaceRecord,
  GetFacesParams,
} from "../types/faces.types";

const DEFAULT_META: FacePaginatedMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

// * Hook ini mengelola data biometrik wajah admin.
// * Mendukung list, update, hapus, dan refetch.
export function useFaces() {
  // & State for list, pagination, and status.
  // % State untuk daftar, paginasi, dan status.
  const [faces, setFaces] = useState<FaceRecord[]>([]);
  const [meta, setMeta] = useState<FacePaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Keep latest query params for refetch.
  // % Simpan query terakhir untuk refetch.
  const [queryParams, setQueryParams] = useState<GetFacesParams>({
    page: 1,
    limit: 10,
    search: "",
  });

  // & Fetch paginated faces list.
  // % Ambil daftar wajah dengan paginasi.
  const fetchAll = useCallback(async (params: GetFacesParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await facesService.adminGetAll(params);
      setFaces(result.data);
      setMeta(result.meta);
      setQueryParams(params);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data biometrik wajah",
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

  const refetch = useCallback(async () => {
    await fetchAll(queryParams);
  }, [fetchAll, queryParams]);

  // & Update user face then refresh.
  // % Ubah wajah user lalu refresh.
  const adminUpdate = async (userId: string, imageFile: File): Promise<void> => {
    await facesService.adminUpdate(userId, imageFile);
    await fetchAll(queryParams);
  };

  // & Delete user face then refresh.
  // % Hapus wajah user lalu refresh.
  const adminDelete = async (userId: string): Promise<void> => {
    await facesService.adminDelete(userId);
    const newPage =
      faces.length === 1 && queryParams.page && queryParams.page > 1
        ? queryParams.page - 1
        : queryParams.page ?? 1;
    await fetchAll({ ...queryParams, page: newPage });
  };

  // & Register face via register endpoint, then refresh.
  // % Daftarkan wajah via endpoint register, lalu refresh.
  // & This endpoint follows current authenticated user scope.
  // % Endpoint ini mengikuti scope user yang sedang login.
  const registerForEmployee = async (
    userId: string,
    imageFile: File,
  ): Promise<void> => {
    await facesService.register(userId, imageFile);
    await fetchAll(queryParams);
  };

  return {
    faces,
    meta,
    loading,
    error,
    fetchAll,
    handleQueryChange,
    refetch,
    adminUpdate,
    adminDelete,
    registerForEmployee,
  };
}
