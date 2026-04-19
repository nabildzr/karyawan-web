// * Frontend module: karyawan-web/src/pages/AuthPages/LoginPage.tsx
// & This file defines frontend UI or logic for LoginPage.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk LoginPage.tsx.

// ============================================================
// LOGIN PAGE
// Halaman login dengan NIP + Password
// Pakai useLogin() hook dari TanStack Query
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Fingerprint, Lock, User } from "lucide-react";
import { LoginRequest } from "../../types/auth.types";
import { useLogin } from "../../hooks/useAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending, error } = useLogin();

  // React Hook Form — buat validasi form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  function onSubmit(data: LoginRequest) {
    login(data);
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Sisi Kiri: Branding Panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-blue-300 blur-3xl" />
        </div>

        <div className="relative z-10 text-center text-white">
          {/* Icon / Logo */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border border-white/30">
              <Fingerprint className="w-14 h-14 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Sistem Absensi
            <br />
            Karyawan
          </h1>
          <p className="text-blue-200 text-lg max-w-sm leading-relaxed">
            Kelola kehadiran, jadwal, dan kinerja karyawan dalam satu platform terpadu.
          </p>

          {/* Feature highlight */}
          <div className="mt-12 grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Face Recognition", desc: "Absensi berbasis wajah" },
              { label: "Geofencing", desc: "Validasi lokasi otomatis" },
              { label: "Real-time", desc: "Monitor langsung" },
              { label: "RBAC", desc: "Kontrol akses peran" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-left"
              >
                <div className="font-semibold text-white">{item.label}</div>
                <div className="text-blue-200 text-xs mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sisi Kanan: Form Login ──────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            {/* Logo kecil untuk mobile */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-2xl">
                <Fingerprint className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Selamat Datang 👋
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Masuk ke panel admin menggunakan NIP dan password kamu.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error dari backend */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm">
                {error.message}
              </div>
            )}

            {/* Field NIP */}
            <div>
              <label
                htmlFor="nip"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                NIP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="nip"
                  type="text"
                  placeholder="Masukkan NIP kamu"
                  autoComplete="username"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.nip
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 dark:border-gray-700"
                    }
                  `}
                  {...register("nip", {
                    required: "NIP wajib diisi",
                    minLength: { value: 3, message: "NIP minimal 3 karakter" },
                  })}
                />
              </div>
              {errors.nip && (
                <p className="mt-1.5 text-xs text-red-500">{errors.nip.message}</p>
              )}
            </div>

            {/* Field Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password kamu"
                  autoComplete="current-password"
                  className={`
                    w-full pl-10 pr-12 py-3 rounded-xl border bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.password
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 dark:border-gray-700"
                    }
                  `}
                  {...register("password", {
                    required: "Password wajib diisi",
                    minLength: { value: 6, message: "Password minimal 6 karakter" },
                  })}
                />
                {/* Toggle show/hide password */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="
                w-full py-3 px-4 rounded-xl font-semibold text-white
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Sedang masuk...</span>
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
            Lupa password? Hubungi admin atau HRD perusahaan kamu.
          </p>
        </div>
      </div>
    </div>
  );
}
