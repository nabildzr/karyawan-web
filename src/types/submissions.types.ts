// * File ini berisi type untuk pengajuan karyawan.
// * Dipakai untuk list, create, dan approval.

export type SubmissionType =
  | "IZIN_SAKIT"
  | "IZIN_KHUSUS"
  | "DINAS_LUAR"
  | "LEMBUR"
  | "GANTI_SHIFT_HARI";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubmissionUserSummary {
  id: string;
  nip: string;
  role: string;
  employees?: {
    id: string;
    fullName: string;
    email: string | null;
  } | null;
}

export interface SubmissionRecord {
  id: string;
  userId: string;
  type: SubmissionType;
  startDate: string;
  endDate: string;
  reason: string;
  attachment: string | null;
  attachmentPublicId?: string | null;
  attachmentOriginalName?: string | null;
  attachmentMimeType?: string | null;
  attachmentSizeBytes?: number | null;
  status: SubmissionStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: SubmissionUserSummary;
}

export interface SubmissionPaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// & Query parameter types.
// % Type parameter query.
export interface GetSubmissionsParams {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  type?: SubmissionType;
}

export interface GetAdminSubmissionsParams extends GetSubmissionsParams {
  search?: string;
}

// & Input payload types.
// % Type payload input.
export interface CreateSubmissionInput {
  type: SubmissionType;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentFile?: File;
}

export interface UpdateSubmissionStatusInput {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
