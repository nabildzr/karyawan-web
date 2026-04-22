// * Types for admin dashboard aggregate endpoint.
// * Dipakai untuk payload GET /dashboard/admin.

import type { AttendanceStats } from "./attendances.types";

export type DashboardAttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT"
  | "LEAVE"
  | "OFF";

export interface AdminDashboardSummary {
  totalEmployees: number;
  pendingSubmissions: number;
  attendance: AttendanceStats;
}

export interface AdminDashboardDivisionDistributionItem {
  id: string | null;
  name: string;
  employeeCount: number;
}

export interface AdminDashboardRecentAttendance {
  id: string;
  employeeId: string;
  status: DashboardAttendanceStatus;
  statusCheckOut?: DashboardAttendanceStatus | null;
  checkIn?: string | null;
  checkOut?: string | null;
  shiftNameSnapshot: string;
  isManualEntry: boolean;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    fullName: string;
    user?: {
      nip?: string;
    } | null;
    position?: {
      id: string;
      name: string;
      division?: {
        id: string;
        name: string;
      } | null;
    } | null;
  } | null;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  divisionDistribution: AdminDashboardDivisionDistributionItem[];
  monthlyAttendance: {
    year: number;
    present: number[];
    late: number[];
  };
  recentAttendances: AdminDashboardRecentAttendance[];
  generatedAt: string;
}
