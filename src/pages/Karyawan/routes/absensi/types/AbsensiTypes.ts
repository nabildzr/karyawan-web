// * This file defines route module logic for src/pages/Karyawan/routes/absensi/types/AbsensiTypes.ts.

// & This file declares attendance route type contracts shared by components and helpers.
// % File ini mendeklarasikan kontrak tipe route absensi yang dipakai bersama oleh komponen dan helper.

import type { Geofence } from "../../../../../types/geofences.types";

// & Define UI location state machine for permission and readiness flow.
// % Mendefinisikan state machine lokasi untuk alur izin dan kesiapan.
export type LocationState = "checking" | "ready" | "blocked";

// & Extend geofence model with computed distance and area flags for map presentation.
// % Memperluas model geofence dengan jarak terhitung dan flag area untuk presentasi peta.
export type GeofenceWithDistance = Geofence & {
  distanceMeters: number;
  distanceLabel: string;
  isInside: boolean;
};

// & Describe minimal reverse-geocoding payload fields used to build location labels.
// % Menjelaskan field minimal payload reverse-geocoding yang dipakai untuk membentuk label lokasi.
export type GeocodingResponse = {
  display_name?: string;
  address?: {
    city?: string;
    county?: string;
    state?: string;
    suburb?: string;
    city_district?: string;
    country_code?: string;
  };
};

// & Restrict attendance action to supported check-in/check-out operations.
// % Membatasi aksi absensi hanya pada operasi check-in/check-out yang didukung.
export type AttendanceActionType = "CHECK_IN" | "CHECK_OUT";

// & Define resolved preferred action payload with optional lock reason.
// % Mendefinisikan payload aksi yang diprioritaskan beserta alasan lock opsional.
export interface PreferredActionResolution {
  actionType: AttendanceActionType | null;
  lockReason: string | null;
}
