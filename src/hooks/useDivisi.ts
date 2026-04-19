// * Frontend module: karyawan-web/src/hooks/useDivisi.ts
// & This file defines frontend UI or logic for useDivisi.ts.
// % File ini mendefinisikan UI atau logika frontend untuk useDivisi.ts.

import { useCallback, useEffect, useState } from "react";
import { divisiService } from "../services/divisi.service";
import type {
  CreateDivisionInput,
  Division,
  UpdateDivisionInput,
} from "../types/hierarki.types";

// * Hook ini mengelola data divisi dan aksi CRUD.
// * Data otomatis diambil saat komponen mount.
export function useDivisi() {
  // & State for list, loading, and error.
  // % State untuk daftar, loading, dan error.
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Fetch all divisions from API.
  // % Ambil semua divisi dari API.
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await divisiService.getAll(true, true, true);
      setDivisions(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data divisi",
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

  // & Create division then refresh list.
  // % Buat divisi lalu refresh daftar.
  const create = async (input: CreateDivisionInput): Promise<void> => {
    await divisiService.create(input);
    await fetchAll();
  };

  // & Update division then refresh list.
  // % Ubah divisi lalu refresh daftar.
  const update = async (
    id: string,
    input: UpdateDivisionInput,
  ): Promise<void> => {
    await divisiService.update(id, input);
    await fetchAll();
  };

  // & Delete division then refresh list.
  // % Hapus divisi lalu refresh daftar.
  const remove = async (id: string): Promise<void> => {
    await divisiService.delete(id);
    await fetchAll();
  };

  return { divisions, loading, error, refetch: fetchAll, create, update, remove };
}
