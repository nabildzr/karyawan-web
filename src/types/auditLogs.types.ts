// * File ini berisi type untuk audit log.
// * Dipakai untuk list dan filter log admin.

// & JSON changes snapshot shape.
// % Bentuk snapshot perubahan JSON.
export interface AuditLogChanges {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

// & Single audit log record shape.
// % Bentuk satu data audit log.
export interface AuditLog {
  id: string;
  // & Example: UPDATE_ATTENDANCE_MANUAL.
  // % Contoh: UPDATE_ATTENDANCE_MANUAL.
  action: string;
  // & Example: Attendances.
  // % Contoh: Attendances.
  entity: string;
  // & Affected entity id.
  // % Id entitas yang terdampak.
  entityId: string;
  // & Actor user id.
  // % Id user pelaku.
  userId: string;
  // & Example: ADMIN.
  // % Contoh: ADMIN.
  userRole: string;
  changes: AuditLogChanges;
  reason?: string | null;
  createdAt: string;
}

// & Pagination meta shape.
// % Bentuk meta paginasi.

export interface AuditLogPaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// & Query parameter type.
// % Type parameter query.

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
}
