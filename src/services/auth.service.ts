// * Service ini menangani API autentikasi web.
// * Request auth selalu membawa cookie session.

import type {
  ApiResponse,
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from "../types/auth.types";

// & Resolve backend base URL from env.
// % Ambil base URL backend dari env.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// & Shared fetch helper with cookie credentials.
// % Helper fetch bersama dengan cookie credentials.
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    // & Always include cookies for auth endpoints.
    // % Selalu sertakan cookie untuk endpoint auth.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  // & Throw normalized error for non-2xx responses.
  // % Lempar error terstandar saat response bukan 2xx.
  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: "Terjadi kesalahan" }));
    throw new Error(errorBody.message ?? `HTTP Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// & Login user and hydrate current profile.
// % Login user lalu ambil profil aktif.
export async function loginUser(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  // & Debug payload for login troubleshooting.
  // % Debug payload untuk troubleshooting login.
  console.log(
    "Payload yang dikirim ke /auth/login:",
    JSON.stringify({
      ...credentials,
      clientType: "WEB",
    }),
  );

  await apiFetch<ApiResponse<null>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      ...credentials,
      clientType: "WEB",
    }),
  });

  return getCurrentUser();
}

// & Get current authenticated user.
// % Ambil user yang sedang terautentikasi.
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiFetch<ApiResponse<AuthUser>>(
    "/auth/me?withEmployee=true",
  );
  return {
    ...response.data,
    permissions: response.data.permissions ?? [],
  };
}

// & Logout current session.
// % Logout sesi saat ini.
export async function logoutUser(): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}

// & Refresh auth session token.
// % Refresh token sesi autentikasi.
export async function refreshToken(): Promise<void> {
  return apiFetch<void>("/auth/refresh", {
    method: "POST",
  });
}

// & Request forgot password flow by NIP or email.
// % Minta alur lupa password berdasarkan NIP atau email.
export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await apiFetch<ApiResponse<ForgotPasswordResponse>>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

// & Send forgot-password verification code.
// % Kirim kode verifikasi untuk lupa password.
export async function sendCode(
  payload: SendCodeRequest,
): Promise<SendCodeResponse> {
  const response = await apiFetch<ApiResponse<SendCodeResponse>>(
    "/auth/send-code",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

// & Reset password with reset token.
// % Reset password menggunakan token reset.
export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  await apiFetch<ApiResponse<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// & Verify reset code before password reset.
// % Verifikasi kode reset sebelum reset password.
export async function verifyCode(
  payload: VerifyCodeRequest,
): Promise<VerifyCodeResponse> {
  const response = await apiFetch<ApiResponse<VerifyCodeResponse>>(
    "/auth/verify-code",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}
