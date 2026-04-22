// * This file defines route module logic for src/pages/Karyawan/routes/akun/profile/index.tsx.

import { Link } from "react-router";
import PageMeta from "../../../../../components/common/PageMeta";
import KaryawanAddressCard from "../components/KaryawanProfile/KaryawanAddressCard";
import KaryawanInfoCard from "../components/KaryawanProfile/KaryawanInfoCard";
import KaryawanMetaCard from "../components/KaryawanProfile/KaryawanMetaCard";

export default function KaryawanProfileDetailPage() {
  return (
    <>
      <PageMeta
        title="Detail Profil Karyawan | Portal Karyawan"
        description="Lihat detail profil, kontak, dan informasi kepegawaian kamu."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:mb-7">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Detail Profil
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Informasi profil, kontak, dan detail kepegawaian kamu.
            </p>
          </div>

          <Link
            to="/karyawan/akun"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Kembali ke Akun
          </Link>
        </div>

        <div className="space-y-6">
          <KaryawanMetaCard />
          <KaryawanInfoCard />
          <KaryawanAddressCard />
        </div>
      </div>
    </>
  );
}