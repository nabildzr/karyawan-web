// * File ini berisi type untuk hari libur nasional.
// * Dipakai untuk endpoint holidays.

export interface PublicHoliday {
  id: string;
  name: string;
  // & Date uses ISO string.
  // % Tanggal menggunakan ISO string.
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayInput {
  name: string;
  // & Expected format: YYYY-MM-DD.
  // % Format yang diharapkan: YYYY-MM-DD.
  date: string;
}

export interface UpdateHolidayInput {
  name?: string;
  // & Expected format: YYYY-MM-DD.
  // % Format yang diharapkan: YYYY-MM-DD.
  date?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SyncResult {
  name: string;
  date: string;
}

export interface SyncMeta {
  inserted: number;
}
