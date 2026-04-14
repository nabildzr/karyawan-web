// * File ini berisi type untuk modul absensi.
// * Dipakai oleh flow mobile dan admin.

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "LEAVE";
export type AttendancePeriod = "week" | "month" | "year";
export type AttendanceFilter = "late" | "present" | "absent" | "all";
export type ExportFormat = "xlsx" | "csv";
export type AttendanceAction = "CHECK_IN" | "CHECK_OUT" | "LOCKED";
export type TodayShiftState =
  | "HOLIDAY"
  | "SUBMISSION"
  | "OFF"
  | "NOT_STARTED"
  | "ONGOING"
  | "COMPLETED";

export type SubmissionType =
  | "IZIN_SAKIT"
  | "IZIN_KHUSUS"
  | "DINAS_LUAR"
  | "LEMBUR"
  | "GANTI_SHIFT_HARI";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

// & Stats type.
// % Type statistik.

export interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  leave: number;
  total: number;
}

// & Employee nested shapes.
// % Bentuk data employee yang bersarang.

export interface AttendanceEmployeeUser {
  id?: string;
  nip: string;
  role: string;
}

export interface AttendanceEmployeePosition {
  id?: string;
  name: string;
  isManagerial?: boolean;
  division?: { id?: string; name: string; description?: string };
}

export interface AttendanceEmployeeDetails {
  gender?: string | null;
  employmentType?: string | null;
  profilePictureUrl?: string | null;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
}

export interface AttendanceWorkingScheduleDay {
  dayOfWeek: string;
  isActive: boolean;
  shift?: { name: string; startTime: string; endTime: string; isCrossDay: boolean } | null;
}

export interface AttendanceWorkingSchedule {
  id: string;
  name: string;
  days?: AttendanceWorkingScheduleDay[];
}

export interface AttendanceEmployee {
  id: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  joinDate?: string;
  user: AttendanceEmployeeUser;
  position?: AttendanceEmployeePosition | null;
  employeeDetails?: AttendanceEmployeeDetails | null;
  workingSchedules?: AttendanceWorkingSchedule | null;
}

// & Geofence nested shape.
// % Bentuk data geofence.

export interface AttendanceGeofence {
  id?: string;
  name: string;
  latitude: string;
  longitude: string;
  radius?: number;
}

// & Manual entry actor shape.
// % Bentuk data pelaku input manual.

export interface ManualEntryUser {
  id: string;
  nip: string;
  role: string;
  employees?: { fullName: string; email: string } | null;
}

// & Core attendance record shape.
// % Bentuk utama data absensi.

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  shiftNameSnapshot?: string | null;
  expectedCheckInSnapshot?: string | null;
  expectedCheckOutSnapshot?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  status: AttendanceStatus;
  statusCheckOut?: AttendanceStatus | null;
  deviceInfo?: string | null;
  checkInPhoto?: string | null;
  checkOutPhoto?: string | null;
  isManualEntry: boolean;
  manualEntryBy?: string | null;
  manualEntryAt?: string | null;
  manualEntryByRole?: string | null;
  manualNotes?: string | null;
  manualReason?: string | null;
  latitudeCheckInSnapshot?: number | null;
  longitudeCheckInSnapshot?: number | null;
  latitudeCheckOutSnapshot?: number | null;
  longitudeCheckOutSnapshot?: number | null;
  radiusCheckInSnapshot?: number | null;
  radiusCheckOutSnapshot?: number | null;
  geofencesId?: string | null;
  geofencesCheckOutId?: string | null;
  createdAt: string;
  updatedAt: string;
  // & Relations populated by list/detail endpoint.
  // % Relasi diisi oleh endpoint list/detail.
  employee?: AttendanceEmployee | null;
  geofences?: AttendanceGeofence | null;
  geofencesCheckOut?: AttendanceGeofence | null;
  manualEntryUser?: ManualEntryUser | null;
}

export interface TodayAttendanceContext {
  dateKey: string;
  timezone: string;
  isHoliday: boolean;
  holidayName: string | null;
  hasShift: boolean;
  shift: {
    dayOfWeek: string;
    name: string;
    startTime: string;
    endTime: string;
    isCrossDay: boolean;
    shiftStart: string;
    shiftEnd: string;
  } | null;
  attendance: {
    id: string;
    status: AttendanceStatus;
    statusCheckOut: AttendanceStatus | null;
    checkIn: string | null;
    checkOut: string | null;
    expectedCheckInSnapshot: string;
    expectedCheckOutSnapshot: string | null;
  } | null;
  activeSubmission: {
    id: string;
    type: SubmissionType;
    status: SubmissionStatus;
    startDate: string;
    endDate: string;
    reason: string;
  } | null;
  action: AttendanceAction;
  actionLabel: string;
  lockReason: string | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  checkInLockReason: string | null;
  checkOutLockReason: string | null;
  checkOutUnlockAt: string | null;
  checkOutUnlockThresholdPercent: number;
  shiftState: TodayShiftState;
  shiftProgressPercent: number;
  now: string;
}

// & Pagination meta shape.
// % Bentuk meta paginasi.

export interface AttendancePaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// & Query parameter types.
// % Type parameter query.

export interface GetAdminAttendancesParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus | "";
  employeeId?: string;
  divisionId?: string;
  isManualEntry?: boolean;
}

export interface GetStatsParams {
  startDate?: string;
  endDate?: string;
  divisionId?: string;
  employeeId?: string;
}

// & Input payload types.
// % Type payload input.

export interface ManualAttendanceInput {
  employeeId: string;
  shiftName: string;
  expectedCheckIn: string;
  expectedCheckOut?: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  statusCheckOut?: AttendanceStatus;
  note: string;
  reason: string;
}

export interface CorrectAttendanceInput {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
  statusCheckOut?: AttendanceStatus;
  note: string;
  reason?: string;
}

export interface ExportParams {
  startDate: string;
  endDate: string;
  format?: ExportFormat;
  divisionId?: string;
  status?: AttendanceStatus;
  employeeId?: string;
}
