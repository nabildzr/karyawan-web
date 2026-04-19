// * This file defines route module logic for src/pages/Karyawan/routes/akun/components/AkunNotificationSettings.tsx.

import { NotificationToggle } from "../../../../../components/Notifications/NotificationPermissionBanner";

// Kartu pengaturan notifikasi di halaman akun karyawan
const AkunNotificationSettings = () => {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <p className="text-sm font-semibold text-gray-800 mb-3">Pengaturan Notifikasi</p>
      <NotificationToggle />
      <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
        Notifikasi akan dikirim ke perangkat ini saat ada absensi, perubahan poin, atau
        update pengajuan. Kamu bisa menonaktifkan kapan saja.
      </p>
    </div>
  );
};

export default AkunNotificationSettings;
