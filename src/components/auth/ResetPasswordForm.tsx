// * Frontend module: karyawan-web/src/components/auth/ResetPasswordForm.tsx
// & This file renders reset password form using reset token query param.
// % File ini merender form reset password menggunakan token pada query param.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResetPassword, useVerifyCode } from "../../hooks/useAuth";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import type { ResetPasswordRequest } from "../../types/auth.types";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

type ResetPasswordFormValues = Omit<ResetPasswordRequest, "token">;

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") || "").trim();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: submitVerifyCode, isPending: isVerifyingCode } =
    useVerifyCode();
  const {
    mutateAsync: submitResetPassword,
    isPending: isResettingPassword,
    isSuccess,
  } = useResetPassword();
  const isPending = isVerifyingCode || isResettingPassword;

  // & Handle reset password form submit.
  // % Menangani submit form reset password.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>();

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setSubmitError("Token reset tidak ditemukan. Silakan kirim kode ulang.");
      return;
    }

    try {
      setSubmitError(null);

      await submitVerifyCode({
        token,
        code: values.code,
      });

      await submitResetPassword({
        token,
        code: values.code,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      setTimeout(() => navigate("/admin/signin"), 1200);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat verifikasi kode atau reset password.",
      );
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Kembali
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan kode verifikasi dan password baru untuk akun kamu.
            </p>
          </div>

          {!token && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
              Token reset tidak ditemukan. Silakan minta ulang dari halaman forgot password.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {submitError}
              </div>
            )}

            {isSuccess && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                Password berhasil direset. Mengarahkan ke halaman login...
              </div>
            )}

            <div>
              <Label>
                Kode Verifikasi <span className="text-error-500">*</span>
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Contoh: 123456"
                className={`w-full ${errors.code ? "border-red-400" : ""}`}
                {...register("code", {
                  required: "Kode verifikasi wajib diisi",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Kode verifikasi harus 6 digit angka",
                  },
                })}
              />
              {errors.code && (
                <p className="mt-1.5 text-xs text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div>
              <Label>
                Password Baru <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  className={`w-full ${errors.newPassword ? "border-red-400" : ""}`}
                  {...register("newPassword", {
                    required: "Password baru wajib diisi",
                    minLength: {
                      value: 8,
                      message: "Password minimal 8 karakter",
                    },
                  })}
                />
                <span
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showNewPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
              {errors.newPassword && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label>
                Konfirmasi Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password baru"
                  className={`w-full ${errors.confirmPassword ? "border-red-400" : ""}`}
                  {...register("confirmPassword", {
                    required: "Konfirmasi password wajib diisi",
                    minLength: {
                      value: 8,
                      message: "Password minimal 8 karakter",
                    },
                  })}
                />
                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              disabled={isPending || !token}
              type="submit"
              className="w-full"
              size="sm"
            >
              {isPending ? "Memproses..." : "Verifikasi Kode & Simpan Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
