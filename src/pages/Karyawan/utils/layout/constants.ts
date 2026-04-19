// * This file defines bottom navigation configuration for the employee portal layout.
// & Define the contract for each bottom navigation item.
// % Mendefinisikan kontrak untuk setiap item navigasi bawah.
export interface KaryawanBottomNavItem {
  to: string;
  label: string;
  end: boolean;
}

// & Provide static ordered navigation items used by the karyawan bottom navbar.
// % Menyediakan item navigasi statis berurutan yang dipakai bottom navbar karyawan.
export const NAV_ITEMS: readonly KaryawanBottomNavItem[] = [
  { to: "/karyawan", label: "Beranda", end: true },
  { to: "/karyawan/pengajuan", label: "Pengajuan", end: false },
  { to: "/karyawan/review", label: "Review", end: false },
  { to: "/karyawan/dompet", label: "Dompet", end: false },
  { to: "/karyawan/jadwal", label: "Jadwal", end: false },
  { to: "/karyawan/akun", label: "Akun", end: false },
];
