import { useCallback, useEffect, useState } from "react";
import { jabatanService } from "../services/jabatan.service";
import type {
    CreatePositionInput,
    Position,
    UpdatePositionInput,
} from "../types/hierarki.types";

// * Hook ini mengelola data jabatan dan aksi CRUD.
// * Data otomatis diambil saat komponen mount.
export function useJabatan() {
  // & State for list, loading, and error.
  // % State untuk daftar, loading, dan error.
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Fetch all positions from API.
  // % Ambil semua jabatan dari API.
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jabatanService.getAll();
      setPositions(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data jabatan",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // & Load data on first render.
  // % Muat data saat render pertama.
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // & Create position then refresh list.
  // % Buat jabatan lalu refresh daftar.
  const create = async (input: CreatePositionInput): Promise<void> => {
    await jabatanService.create(input);
    await fetchAll();
  };

  // & Update position then refresh list.
  // % Ubah jabatan lalu refresh daftar.
  const update = async (
    id: string,
    input: UpdatePositionInput,
  ): Promise<void> => {
    await jabatanService.update(id, input);
    await fetchAll();
  };

  // & Delete position then refresh list.
  // % Hapus jabatan lalu refresh daftar.
  const remove = async (id: string): Promise<void> => {
    await jabatanService.delete(id);
    await fetchAll();
  };

  return { positions, loading, error, refetch: fetchAll, create, update, remove };
}
