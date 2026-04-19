// * Frontend module: karyawan-web/src/hooks/useGeofences.ts
// & This file defines frontend UI or logic for useGeofences.ts.
// % File ini mendefinisikan UI atau logika frontend untuk useGeofences.ts.

import { useCallback, useEffect, useState } from "react";
import { geofencesService } from "../services/geofences.service";
import type {
    CreateGeofenceInput,
    Geofence,
    UpdateGeofenceInput,
} from "../types/geofences.types";

// * Hook ini mengelola data geofence dan aksi CRUD.
// * Data otomatis diambil saat komponen mount.
export function useGeofences() {
  // & State for list, loading, and error.
  // % State untuk daftar, loading, dan error.
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Fetch all geofences from API.
  // % Ambil semua geofence dari API.
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await geofencesService.getAll();
      setGeofences(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data geofence",
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

  // & Create geofence then refresh list.
  // % Buat geofence lalu refresh daftar.
  const create = async (input: CreateGeofenceInput): Promise<void> => {
    await geofencesService.create(input);
    await fetchAll();
  };

  // & Update geofence then refresh list.
  // % Ubah geofence lalu refresh daftar.
  const update = async (
    id: string,
    input: UpdateGeofenceInput,
  ): Promise<void> => {
    await geofencesService.update(id, input);
    await fetchAll();
  };

  // & Delete geofence then refresh list.
  // % Hapus geofence lalu refresh daftar.
  const remove = async (id: string): Promise<void> => {
    await geofencesService.delete(id);
    await fetchAll();
  };

  return { geofences, loading, error, refetch: fetchAll, create, update, remove };
}
