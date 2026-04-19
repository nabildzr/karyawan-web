// * Frontend module: karyawan-web/src/pages/AuthPages/ForgotPassword.tsx
// & This file renders forgot password auth page.
// % File ini merender halaman auth lupa password.

import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ForgotPassword() {
  return (
    <>
      <PageMeta
        title="Forgot Password | Portal Karyawan"
        description="Request reset password token for Portal Karyawan"
      />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
