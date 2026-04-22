// * This file defines route module logic for src/pages/Karyawan/routes/akun/components/AkunProfileCard.tsx.

import { Link } from "react-router";
import { useAuthContext } from "../../../../../context/AuthContext";

interface AkunProfileCardProps {
  title: string;
}

// & This function component/helper defines AkunProfileCard behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku AkunProfileCard untuk file route ini.
const AkunProfileCard = ({ title }: AkunProfileCardProps) => {
  // & Process the main execution steps of AkunProfileCard inside this function body.
  // % Memproses langkah eksekusi utama AkunProfileCard di dalam body fungsi ini.
  const { employeeProfile, user } = useAuthContext();
  const displayName = employeeProfile?.fullName ?? user?.nip ?? "User";
  const displayDivision =
    employeeProfile?.position?.division?.name ?? "Divisi belum diisi";
  const displayPosition =
    employeeProfile?.position?.name ?? "Jabatan belum diisi";
  const displayNip = user?.nip ?? "-";
  const displayEmail = employeeProfile?.email ?? "-";
  const profilePicture =
    employeeProfile?.employeeDetails?.[0]?.profilePictureUrl ??
    "https://i.pinimg.com/webp80/736x/b7/5b/29/b75b29441bbd967deda4365441497221.webp";

  return (
    <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <img
              src={profilePicture}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              {displayDivision} · {displayPosition}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              NIP {displayNip} · {displayEmail}
            </p>
          </div>
        </div>

        {/* <div className="rounded-2xl bg-brand-50 px-3 py-2 text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            Profil ringkas
          </p>
          <p className="mt-1 text-xs text-brand-800">{hint}</p>
        </div> */}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <Link
          to="/karyawan/akun/profile"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Lihat detail profil
            </p>
            <p className="text-xs text-gray-500">
              Data diri, kontak, dan informasi kepegawaian
            </p>
          </div>
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default AkunProfileCard;
