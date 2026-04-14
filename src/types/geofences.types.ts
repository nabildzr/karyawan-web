// * File ini berisi type untuk geofence.
// * Dipakai untuk CRUD area absensi.

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  // & Unit is meters.
  // % Satuan radius dalam meter.
  radius: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGeofenceInput {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface UpdateGeofenceInput {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
