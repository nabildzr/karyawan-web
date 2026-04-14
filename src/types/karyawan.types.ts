// * File ini berisi type untuk manajemen karyawan.
// * Dipakai untuk list, detail, dan form karyawan.

export type UserRole = "CEO" | "MANAGER" | "HR" | "ADMIN" | "USER";

export interface EmployeeRbacRole {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
  isActive: boolean;
}

// & API response shapes.
// % Bentuk response dari API.

export interface EmployeeDivision {
  id: string;
  name: string;
  description: string | null;
}

export interface EmployeePosition {
  id: string;
  name: string;
  gajiPokok: number;
  isManagerial: boolean;
  division?: EmployeeDivision;
}

export interface EmployeeUser {
  id: string;
  nip: string;
  rbacRoleId: string | null;
  rbacRole: EmployeeRbacRole | null;
}

export interface EmployeeDetail {
  employeeId?: string;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  religion: string | null;
  profilePictureUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  hireDate: string | null;
  employmentType: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkingScheduleShift {
  id?: string;
  name: string;
  // & Time format: HH:MM.
  // % Format waktu: HH:MM.
  startTime: string;
  // & Time format: HH:MM.
  // % Format waktu: HH:MM.
  endTime: string;
  isCrossDay: boolean;
}

export interface WorkingScheduleDay {
  id?: string;
  // & Example: Senin, Selasa, and others.
  // % Contoh: Senin, Selasa, dan lainnya.
  dayOfWeek: string;
  isActive: boolean;
  shift?: WorkingScheduleShift | null;
}

export interface WorkingScheduleBasic {
  id: string;
  name: string;
  days?: WorkingScheduleDay[];
}

// & Shape returned by GET /employees list.
// % Bentuk response GET /employees list.
export interface Employee {
  id: string;
  fullName: string;
  address: string | null;
  email: string | null;
  phoneNumber: string | null;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
  user: EmployeeUser;
  position: EmployeePosition | null;
  employeeDetails: EmployeeDetail[];
}

// & Shape returned by GET /employees/:id detail.
// % Bentuk response GET /employees/:id detail.
export interface EmployeeDetail2 extends Employee {
  workingSchedulesId: string | null;
  workingSchedules: WorkingScheduleBasic | null;
}

// & Input payload types.
// % Type payload input.

export interface CreateEmployeeUserInput {
  nip: string;
  rbacRoleId: string;
}

export interface CreateEmployeeDataInput {
  fullName: string;
  address?: string | null;
  email: string;
  phoneNumber?: string | null;
  // & Date uses ISO string.
  // % Tanggal menggunakan ISO string.
  joinDate: string;
  positionId?: string | null;
  workingSchedulesId?: string | null;
}

export interface CreateEmployeeDetailsInput {
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  religion?: string | null;
  profilePictureUrl?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  hireDate?: string | null;
  employmentType?: string | null;
}

export interface CreateEmployeeInput {
  user: CreateEmployeeUserInput;
  employee: CreateEmployeeDataInput;
  details?: CreateEmployeeDetailsInput;
}

export interface UpdateEmployeeUserInput {
  nip?: string;
  rbacRoleId?: string | null;
}

export interface UpdateEmployeeDataInput {
  fullName?: string;
  address?: string | null;
  email?: string;
  phoneNumber?: string | null;
  joinDate?: string;
  positionId?: string | null;
  workingSchedulesId?: string | null;
}

export interface UpdateEmployeeInput {
  user?: UpdateEmployeeUserInput;
  employee?: UpdateEmployeeDataInput;
  details?: CreateEmployeeDetailsInput;
}

// & Paginated response types.
// % Type response paginasi.
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta: PaginatedMeta;
}
