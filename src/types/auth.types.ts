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

// & Payload for POST /auth/forgot-password.
// % Payload untuk POST /auth/forgot-password.
export interface ForgotPasswordRequest {
  identifier: string;
}

// & Payload for POST /auth/send-code.
// % Payload untuk POST /auth/send-code.
export interface SendCodeRequest {
  identifier: string;
}

// & Forgot password response payload.
// % Payload response lupa password.
export interface ForgotPasswordResponse {
  expiresInMinutes: number;
  resetToken?: string;
  resetUrl?: string;
  verificationCode?: string;
  mailDispatched?: boolean;
}

// & Send code response payload.
// % Payload response kirim kode.
export interface SendCodeResponse {
  expiresInMinutes: number;
  resetToken?: string;
  resetUrl?: string;
  verificationCode?: string;
  mailDispatched?: boolean;
}

// & Payload for POST /auth/reset-password.
// % Payload untuk POST /auth/reset-password.
export interface ResetPasswordRequest {
  token: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// & Payload for POST /auth/verify-code.
// % Payload untuk POST /auth/verify-code.
export interface VerifyCodeRequest {
  token: string;
  code: string;
}

// & Verify code response payload.
// % Payload response verifikasi kode.
export interface VerifyCodeResponse {
  isValid: boolean;
}

// & AuthContext state shape.
// % Bentuk state AuthContext.
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
