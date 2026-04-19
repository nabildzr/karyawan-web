// * Frontend module: karyawan-web/src/services/geofences.service.ts
// & This file defines frontend UI or logic for geofences.service.ts.
// % File ini mendefinisikan UI atau logika frontend untuk geofences.service.ts.

import { apiClient } from "../api/apiClient";
import type {
    CreateGeofenceInput,
    Geofence,
    UpdateGeofenceInput,
} from "../types/geofences.types";

// * Service ini menangani API geofence.
// * Menyediakan operasi list, detail, dan CRUD.

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}


export const geofencesService = {
  // & Get office geofence list for employee attendance page.
  // % Ambil daftar geofence kantor untuk halaman absensi karyawan.
  getOfficeLocations: async (): Promise<Geofence[]> => {
    const res = await apiClient.get<ApiResponse<Geofence[]>>(
      "/geofences/office-locations",
    );
    return res.data.data;
  },

  // & Get all geofences.
  // % Ambil semua geofence.
  getAll: async (): Promise<Geofence[]> => {
    const res = await apiClient.get<ApiResponse<Geofence[]>>("/geofences");
    return res.data.data;
  },

  // & Get geofence detail by id.
  // % Ambil detail geofence berdasarkan id.
  getById: async (id: string): Promise<Geofence> => {
    const res = await apiClient.get<ApiResponse<Geofence>>(
      `/geofences/${id}`,
    );
    return res.data.data;
  },

  // & Create geofence with safe coordinate precision.
  // % Buat geofence dengan presisi koordinat aman.
  create: async (data: CreateGeofenceInput): Promise<Geofence> => {
    const payload = {
      ...data,
      // & Keep max 7 decimals to match DB precision.
      // % Batasi maksimal 7 desimal agar sesuai presisi DB.
      latitude: parseFloat(data.latitude.toFixed(7)),
      longitude: parseFloat(data.longitude.toFixed(7)),
    };
    const res = await apiClient.post<ApiResponse<Geofence>>("/geofences", payload);
    return res.data.data;
  },

  // & Update geofence with safe optional coordinates.
  // % Ubah geofence dengan koordinat opsional yang aman.
  update: async (id: string, data: UpdateGeofenceInput): Promise<Geofence> => {
    const payload = {
      ...data,
      ...(data.latitude != null && {
        latitude: parseFloat(data.latitude.toFixed(7)),
      }),
      ...(data.longitude != null && {
        longitude: parseFloat(data.longitude.toFixed(7)),
      }),
    };
    const res = await apiClient.put<ApiResponse<Geofence>>(`/geofences/${id}`, payload);
    return res.data.data;
  },

  // & Delete geofence by id.
  // % Hapus geofence berdasarkan id.
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/geofences/${id}`);
  },
};
