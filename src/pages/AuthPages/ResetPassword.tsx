// * Frontend module: karyawan-web/src/pages/AuthPages/ResetPassword.tsx
// & This file renders reset password auth page.
// % File ini merender halaman auth reset password.

import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ResetPassword() {
  return (
    <>
      <PageMeta
        title="Reset Password | Portal Karyawan"
        description="Reset account password with secure token"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
