import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../services/auth.service";
import type { LoginRequest } from "../types/auth.types";

// * Hook auth berbasis TanStack Query.
// * Menyediakan query user aktif, login, dan logout.

// & Shared query key for auth cache.
// % Kunci query bersama untuk cache auth.
export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "me"] as const,
};

// & Get current logged in user.
// % Ambil user yang sedang login.
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: getCurrentUser,
    retry: 1,
    // & Cache user data for 5 minutes.
    // % Cache data user selama 5 menit.
    staleTime: 5 * 60 * 1000,
  });
}

// & Login mutation and cache update.
// % Mutation login dan update cache.
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginUser(credentials),

    onSuccess: (data) => {
      // & Store user data in query cache.
      // % Simpan data user ke query cache.
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, data);

      // & Redirect based on resolved role.
      // % Redirect sesuai role user.
      const currentRole = data.role ?? data.rbacRoleKey ?? null;
      navigate(currentRole === "USER" ? "/karyawan" : "/admin");
    },

    onError: (error: Error) => {
      // & Keep backend error message for UI.
      // % Pertahankan pesan error backend untuk UI.
      console.error("Login gagal:", error.message);
    },
  });
}

// & Logout mutation and cache reset.
// % Mutation logout dan reset cache.
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      // & Clear all cached data after logout.
      // % Bersihkan semua cache setelah logout.
      queryClient.clear();

      // & Redirect user to login page.
      // % Redirect user ke halaman login.
      navigate("/admin/signin");
    },

    onError: (error: Error) => {
      console.error("Logout gagal:", error.message);
      // & Still clear cache and redirect on failure.
      // % Tetap clear cache dan redirect saat gagal.
      queryClient.clear();
      navigate("/admin/signin");
    },
  });
}
