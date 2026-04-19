// * This file stores static home-page defaults and menu/activity configuration.
import type { HomeActivityItem, HomeMenuCard, HomeMetrics } from "./types";

// & Provide a safe default metrics object before API data is loaded.
// % Menyediakan objek metrics default yang aman sebelum data API selesai dimuat.
export const DEFAULT_METRICS: HomeMetrics = {
  checkIn: "--:--",
  checkInHint: "Belum Absen",
  checkInTone: "gray",
  checkOut: "--:--",
  checkOutHint: "Belum Check Out",
  checkOutTone: "gray",
  attendancePercent: "0%",
  attendanceHint: "0 Hari Kerja",
  attendanceTone: "warning",
  overtime: "0 Jam",
  overtimeHint: "Bulan Ini",
  overtimeTone: "gray",
};

// & Define quick-access employee menu cards shown on the home page.
// % Mendefinisikan kartu menu akses cepat karyawan yang ditampilkan di halaman beranda.
export const MENU_CARDS: readonly HomeMenuCard[] = [
  {
    title: "Riwayat Absensi",
    subtitle: "Lihat data masuk dan pulang",
  },
  {
    title: "Leaderboard",
    subtitle: "Lihat peringkat integritas",
  },
  {
    title: "Pengajuan",
    subtitle: "Cuti, izin, dan lembur",
  },
  {
    title: "Review Saya",
    subtitle: "Laporan penilaian terbaru",
  },
  {
    title: "Pengaturan",
    subtitle: "Akun dan keamanan",
  },
];

// & Define static sample activity items for timeline-like home widgets.
// % Mendefinisikan item aktivitas statis untuk widget beranda bergaya timeline.
export const ACTIVITY_ITEMS: readonly HomeActivityItem[] = [
  {
    title: "Check-in berhasil",
    description: "Kantor Pusat - 08:01",
    status: "Selesai",
    statusTone: "success",
  },
  {
    title: "Pengajuan cuti",
    description: "Menunggu persetujuan HR",
    status: "Proses",
    statusTone: "warning",
  },
  {
    title: "Penilaian bulanan",
    description: "Deadline 2 hari lagi",
    status: "Perlu Aksi",
    statusTone: "brand",
  },
];
