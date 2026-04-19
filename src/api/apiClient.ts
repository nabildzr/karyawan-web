// * File API client: src/api/apiClient.ts
// & This module provides a shared Axios client with global interceptors.
// % Modul ini menyediakan client Axios bersama dengan interceptor global.
import axios from "axios";
import { toast } from "sonner";

// & Create shared Axios instance with common defaults.
// % Buat instance Axios bersama dengan konfigurasi default umum.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1",
  timeout: 10000, // Timeout 10 detik
  withCredentials: true, // biar cookie (httpOnly) ikut dikirim ke backend
  headers: {
    "Content-Type": "application/json",
  },
});

// & Attach access token from localStorage into Authorization header.
// % Sisipkan access token dari localStorage ke header Authorization.
apiClient.interceptors.request.use(
  (config) => {
    // & Read token from local storage source used by frontend auth flow.
    // % Baca token dari sumber local storage yang dipakai alur auth frontend.
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// & Handle global API errors and force sign-in redirect on unauthorized.
// % Tangani error API global dan paksa redirect login saat unauthorized.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // & Silence toast for BLIP caption endpoint because fallback handles UX.
    // % Senyapkan toast untuk endpoint BLIP caption karena fallback menangani UX.
    const requestUrl = String(error?.config?.url ?? "");
    const isSilentBlipCaptionRequest = requestUrl.includes(
      "/attendances/blip-caption",
    );
    const isSilentMarketplaceBuyRequest =
      /\/points\/marketplace\/[^/]+\/buy/.test(requestUrl);
    const shouldSilenceToast =
      isSilentBlipCaptionRequest || isSilentMarketplaceBuyRequest;

    if (error.response) {
      const status = error.response.status;
      // & Prefer backend-provided message payload when available.
      // % Prioritaskan pesan dari payload backend jika tersedia.
      const message: string =
        error.response.data?.message ?? `Terjadi kesalahan (${status})`;

      if (status === 401) {
        console.error("Unauthorized: Session Expired");
        localStorage.removeItem("accessToken");
        const nextSignin = window.location.pathname.startsWith("/karyawan")
          ? "/karyawan/signin"
          : "/admin/signin";
        window.location.href = nextSignin;
      } else {
        // & Show toast for non-401 responses unless explicitly silenced.
        // % Tampilkan toast untuk response non-401 kecuali memang disenyapkan.
        if (!shouldSilenceToast) {
          toast.error(message);
        }
      }

      // & Re-throw normalized Error so hooks/pages can catch consistently.
      // % Lempar ulang Error ternormalisasi agar hook/page bisa catch konsisten.
      return Promise.reject(new Error(message));
    }

    // & Handle network/timeout errors when no HTTP response is returned.
    // % Tangani error network/timeout saat tidak ada HTTP response.
    const networkMsg = error.message ?? "Tidak dapat terhubung ke server";
    if (!shouldSilenceToast) {
      toast.error(networkMsg);
    }
    return Promise.reject(new Error(networkMsg));
  },
);
