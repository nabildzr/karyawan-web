// * File ini berisi type untuk autentikasi.
// * Mengikuti shape user, employee, dan detail employee.

// & Role enum aligned with RBAC schema.
// % Enum role mengikuti schema RBAC.
export type UserRole =
  | "SUPER_ADMIN"
  | "CEO"
  | "MANAGER"
  | "HR"
  | "ADMIN"
  | "USER";

export type PermissionAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "APPROVE";

export interface AuthPermission {
  action: PermissionAction;
  resourceKey: string;
  resourceName: string;
  resourceRoutePath: string | null;
  groupName: string | null;
  supportsApprove: boolean;
}

export interface AuthRbacRole {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
  isActive: boolean;
  canAccessAdmin: boolean;
}

// & Standard backend response wrapper.
// % Wrapper response standar dari backend.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

// & Shape returned by GET /auth/me.
// % Bentuk response dari GET /auth/me.
export interface AuthUser {
  id: string;
  nip: string;
  role: string | null;
  rbacRoleKey?: string | null;
  createdAt: string;
  updatedAt: string;
  rbacRole?: AuthRbacRole | null;
  permissions: AuthPermission[];

  // & Employee relation may be null.
  // % Relasi employee bisa null.
  employees: EmployeeProfile | null;
}

export interface EmployeeProfile {
  id: string;
  fullName: string;
  address: string | null;
  email: string | null;
  phoneNumber: string | null;
  joinDate: string;
  userId: string;

  // & Position relation.
  // % Relasi posisi.
  position: {
    id: string;
    name: string;
    description: string | null;
    gajiPokok: number;
    isManagerial: boolean;
    division: {
      id: string;
      name: string;
    } | null;
  } | null;

  // & Employee detail relation.
  // % Relasi detail employee.
  employeeDetails?: EmployeeDetails[];
}

export interface EmployeeDetails {
  employeeId: string;
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
}

// & Payload for POST /auth/login.
// % Payload untuk POST /auth/login.
export interface LoginRequest {
  nip: string;
  password: string;
  clientType: "WEB" | "MOBILE";
}

// & Login response shape.
// % Bentuk response login.
export type LoginResponse = AuthUser;

// & AuthContext state shape.
// % Bentuk state AuthContext.
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
