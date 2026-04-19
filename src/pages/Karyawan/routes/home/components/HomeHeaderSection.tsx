// * This file defines route module logic for src/pages/Karyawan/routes/home/components/HomeHeaderSection.tsx.

import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../../../../hooks/useNotifications";

interface HomeHeaderSectionProps {
  todayDisplay: string;
  shiftDisplay: string;
  shiftProgressPercent: number;
  shiftStatus: string;
  fullName?: string | null;
  nip?: string | null;
  canAccessAdminPortal: boolean;
  onPortalChange: (nextPortal: string) => void;
}

// & This function defines getAvatarLabel behavior in the route flow.
// % Fungsi ini mendefinisikan perilaku getAvatarLabel dalam alur route.
function getAvatarLabel(fullName?: string | null, nip?: string | null) {
  // & Process the main execution steps of getAvatarLabel inside this function body.
  // % Memproses langkah eksekusi utama getAvatarLabel di dalam body fungsi ini.
  const initials = fullName
    ?.split(" ")
    .map((value) => value[0])
    .join("");

  return initials || nip?.substring(0, 2).toUpperCase() || "ND";
}

// & This function component/helper defines HomeHeaderSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku HomeHeaderSection untuk file route ini.
const HomeHeaderSection = ({
  todayDisplay,
  shiftDisplay,
  shiftProgressPercent,
  shiftStatus,
  fullName,
  nip,
  canAccessAdminPortal,
  onPortalChange,
}: HomeHeaderSectionProps) => {
  const { unreadCount } = useNotifications();
  // & Process the main execution steps of HomeHeaderSection inside this function body.
  // % Memproses langkah eksekusi utama HomeHeaderSection di dalam body fungsi ini.
  return (
    <header className="mb-4 rounded-2xl bg-brand-500 p-4 text-white shadow-theme-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
            Portal
          </span>
          <select
            value="karyawan"
            onChange={(event) => onPortalChange(event.target.value)}
            className="rounded-lg border border-white/35 bg-white/15 px-2.5 py-1 text-sm font-semibold text-white outline-none focus:border-white"
          >
            <option value="karyawan" className="text-gray-900">
              Portal Karyawan
            </option>
            <option
              value="admin"
              disabled={!canAccessAdminPortal}
              className="text-gray-900"
            >
              {canAccessAdminPortal
                ? "Portal Admin"
                : "Portal Admin (Tidak ada akses)"}
            </option>
          </select>
        </label>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">
            {todayDisplay}
          </span>
          <Link
            to="/karyawan/notifikasi"
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
          {getAvatarLabel(fullName, nip)}
        </div>
        <div>
          <p className="text-xs text-white/80">Selamat Datang</p>
          <p className="text-base font-bold">{fullName ?? nip ?? "Karyawan"}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white/15 p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-white/80">
          <span>Shift Hari Ini</span>
          <span>{shiftDisplay}</span>
        </div>
        <div className="h-2 rounded-full bg-white/25">
          <div
            className="h-2 rounded-full bg-white transition-all duration-500"
            style={{
              width: `${Math.max(0, Math.min(100, shiftProgressPercent))}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-white/90">{shiftStatus}</p>
      </div>
    </header>
  );
};

export default HomeHeaderSection;
