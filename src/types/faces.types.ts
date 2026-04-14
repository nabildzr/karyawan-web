// * File ini berisi type untuk manajemen face biometric.
// * Dipakai di halaman registrasi dan verifikasi wajah.

import type { UserRole } from "./karyawan.types";

export interface FaceUserEmployee {
  fullName: string;
  email: string;
}

export interface FaceUser {
  id: string;
  nip: string;
  role: UserRole;
  // & Nested employee profile.
  // % Profil employee yang bersarang.
  employees?: FaceUserEmployee | null;
}

// & Single item from GET /faces/admin.
// % Satu item dari GET /faces/admin.
export interface FaceRecord {
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: FaceUser;
}

export interface FaceCheckResult {
  isRegistered: boolean;
}

export interface FacePaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetFacesParams {
  page?: number;
  limit?: number;
  search?: string;
}
