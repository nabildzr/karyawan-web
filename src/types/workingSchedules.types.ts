// * File ini berisi type untuk jadwal kerja.
// * Dipakai untuk endpoint working schedules.

// & Reusable nested shapes.
// % Bentuk data bersarang yang dipakai ulang.

export interface ShiftInfo {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isCrossDay: boolean;
  createdAt?: string;
}

export interface ScheduleDay {
  id: string;
  dayOfWeek: string;
  isActive: boolean;
  workingScheduleId: string;
  shiftId?: string | null;
  shift?: ShiftInfo | null;
}

export interface ScheduleEmployeeBasic {
  id: string;
  fullName: string;
  email?: string | null;
  user?: { nip: string } | null;
  position?: {
    name: string;
    division?: { name: string } | null;
  } | null;
}

// & List item from GET /working-schedules.
// % Item list dari GET /working-schedules.

export interface WorkingSchedule {
  id: string;
  name: string;
  createdAt: string;
  _count: { employees: number };
  days?: ScheduleDay[];
}

// & Detail shape from GET /working-schedules/:id.
// % Bentuk detail dari GET /working-schedules/:id.

export interface WorkingScheduleDetail extends WorkingSchedule {
  employees: ScheduleEmployeeBasic[];
}

// & Stats shape from response meta.
// % Bentuk statistik dari meta response.

export interface WorkingScheduleStats {
  totalSchedules: number;
  activeAssignments: number;
  recentChanges: number;
}

// & Input payload types.
// % Type payload input.

export interface DayInput {
  dayOfWeek: string;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  isCrossDay?: boolean;
}

export interface CreateWorkingScheduleInput {
  name: string;
  days: DayInput[];
  employeeIds?: string[];
}

export interface UpdateWorkingScheduleInput {
  name?: string;
  days?: DayInput[];
  employeeIds?: string[];
}

export interface AssignEmployeesInput {
  employeeIds: string[];
}

// & Mobile summary types.
// % Type ringkasan untuk mobile.

export type WorkingScheduleMobileDayStatus =
  | "completed"
  | "absent"
  | "ongoing"
  | "missed"
  | "off"
  | "upcoming";

export interface WorkingScheduleMobileShift {
  name: string;
  startTime: string;
  endTime: string;
  isCrossDay?: boolean;
}

export interface WorkingScheduleMobileDaySummary {
  date: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  shift: WorkingScheduleMobileShift | null;
  status: WorkingScheduleMobileDayStatus;
  note?: string | null;
}

export interface WorkingScheduleMobileSummary {
  serverNow: string;
  serverDate: string;
  joinDate: string;
  todayShift: WorkingScheduleMobileDaySummary | null;
  weeklySummary: WorkingScheduleMobileDaySummary[];
}

export interface WorkingScheduleMobileSummaryParams {
  startDate: string;
  endDate: string;
  timezone?: string;
}

// & Day constants for labels and options.
// % Konstanta hari untuk label dan opsi.

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DAY_LABELS: Record<string, string> = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
};
