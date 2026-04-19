// * Frontend module: karyawan-web/src/components/auth/SignInForm.tsx
// & This file defines frontend UI or logic for SignInForm.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk SignInForm.tsx.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import { useLogin } from "../../hooks/useAuth";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { LoginRequest } from "../../types/auth.types";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

type LoginFormValues = Omit<LoginRequest, "clientType">;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending, error } = useLogin();

  // React Hook Form — buat validasi form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  function onSubmit(data: LoginFormValues) {
    login({ ...data, clientType: "WEB" });
  }

  const { canAccessAdminPortal } = useAuthContext();

  return (
    <div className="flex flex-col flex-1">
      {canAccessAdminPortal ?? (
        <div className="w-full max-w-md pt-10 mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="size-5" />
            Back to dashboard
          </Link>
        </div>
      )}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Input nip dan password untuk login!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Error dari backend */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm">
                  {error.message}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <Label>
                    NIP <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="nip"
                    type="text"
                    placeholder="Masukkan NIP kamu"
                    autoComplete="username"
                    className={`
                    w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${
                      errors.nip
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-200 dark:border-gray-700"
                    }
                  `}
                    {...register("nip", {
                      required: "NIP wajib diisi",
                      minLength: {
                        value: 3,
                        message: "NIP minimal 3 karakter",
                      },
                    })}
                  />
                  {errors.nip && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.nip.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password kamu"
                      autoComplete="current-password"
                      className={`
                    w-full pl-10 pr-12 py-3 rounded-xl border bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${
                      errors.password
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-200 dark:border-gray-700"
                    }
                  `}
                      {...register("password", {
                        required: "Password wajib diisi",
                        minLength: {
                          value: 6,
                          message: "Password minimal 6 karakter",
                        },
                      })}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to="/admin/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Lupa password? Reset password di sini.
                  </Link>
                </div>
                <div>
                  <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full"
                    size="sm"
                  >
                    {isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sedang masuk...</span>
                      </>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
