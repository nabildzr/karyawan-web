export type NotificationCategory =
  | "ATTENDANCE"
  | "POINTS"
  | "SCHEDULE"
  | "ASSESSMENT"
  | "SUBMISSION"
  | "GENERAL";

export interface PaginatedMeta {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  isRead: boolean;
  readAt: string | null;
  referenceEntity: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  data: NotificationRecord[];
  meta: PaginatedMeta;
  message: string;
}
