// * Frontend module: karyawan-web/src/components/auth/ForgotPasswordForm.tsx
// & This file renders forgot password form and result flow.
// % File ini merender form lupa password dan alur hasilnya.

import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { useSendCode } from "../../hooks/useAuth";
import type { SendCodeRequest } from "../../types/auth.types";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

type ForgotPasswordFormValues = SendCodeRequest;

export default function ForgotPasswordForm() {
  const { mutate: submitSendCode, data, isPending, isSuccess, error } =
    useSendCode();

  // & Handle form validation and submit payload.
  // % Menangani validasi form dan payload submit.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = (values: ForgotPasswordFormValues) => {
    submitSendCode(values);
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
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan NIP atau email. Kode dan link reset password akan dikirim
              ke email terdaftar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error.message}
              </div>
            )}

            {isSuccess && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                <p>
                  Permintaan diproses. Jika akun ditemukan, kode dan link reset
                  password sudah dikirim ke email terdaftar.
                </p>
                {typeof data?.mailDispatched === "boolean" && (
                  <p className="mt-2">
                    Status email (dev):{" "}
                    {data.mailDispatched ? "terkirim" : "gagal/skip"}
                  </p>
                )}
                {data?.verificationCode && (
                  <p className="mt-2">
                    Dev verification code:{" "}
                    <span className="font-semibold">
                      {data.verificationCode}
                    </span>
                  </p>
                )}
                {data?.resetToken && (
                  <p className="mt-2 break-all">
                    Dev reset token:{" "}
                    <span className="font-semibold">{data.resetToken}</span>
                  </p>
                )}
                {data?.resetToken && (
                  <p className="mt-2">
                    <Link
                      to={`/auth/reset-password?token=${encodeURIComponent(data.resetToken)}`}
                      className="underline"
                    >
                      Lanjut ke halaman reset password
                    </Link>
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>
                NIP atau Email <span className="text-error-500">*</span>
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Contoh: 2201001 atau user@mail.com"
                className={`w-full ${errors.identifier ? "border-red-400" : ""}`}
                {...register("identifier", {
                  required: "NIP atau email wajib diisi",
                  minLength: {
                    value: 3,
                    message: "Minimal 3 karakter",
                  },
                })}
              />
              {errors.identifier && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <Button
              disabled={isPending}
              type="submit"
              className="w-full"
              size="sm"
            >
              {isPending ? "Memproses..." : "Kirim Kode Verifikasi"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
