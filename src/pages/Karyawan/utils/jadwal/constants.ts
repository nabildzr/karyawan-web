// * This file stores static constants and lookup maps for schedule utilities.
import type { WorkingScheduleMobileDayStatus } from "../../../../types/workingSchedules.types";
import type { ScheduleStatusStyle } from "../../routes/jadwal/types/JadwalTypes";

// & Formatter for month-year labels in Indonesian locale.
// % Formatter untuk label bulan-tahun dalam locale Indonesia.
export const MONTH_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

// & Formatter for compact day-month-year date labels.
// % Formatter untuk label tanggal ringkas hari-bulan-tahun.
export const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// & Formatter for week-range start date text.
// % Formatter untuk teks tanggal awal rentang minggu.
export const RANGE_START_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
});

// & Formatter for week-range end date text including year.
// % Formatter untuk teks tanggal akhir rentang minggu termasuk tahun.
export const RANGE_END_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

// & Map schedule day status to UI style tokens and default descriptive copy.
// % Memetakan status hari jadwal ke token gaya UI dan teks deskripsi default.
export const STATUS_STYLE: Record<WorkingScheduleMobileDayStatus, ScheduleStatusStyle> = {
  completed: {
    container: "border-emerald-300 bg-emerald-50",
    dayText: "text-emerald-700",
    titleText: "text-emerald-900",
    bodyText: "text-emerald-800",
    badge: "bg-emerald-100",
    badgeText: "Selesai",
    defaultDescription: "Absensi hari ini tercatat lengkap.",
  },
  absent: {
    container: "border-amber-300 bg-amber-50",
    dayText: "text-amber-700",
    titleText: "text-amber-900",
    bodyText: "text-amber-800",
    badge: "bg-amber-100",
    badgeText: "Absen",
    defaultDescription: "Status absensi tercatat tidak hadir.",
    showAlertIcon: true,
  },
  ongoing: {
    container: "border-green-300 bg-green-50",
    dayText: "text-green-700",
    titleText: "text-green-900",
    bodyText: "text-green-800",
    badge: "bg-green-100",
    badgeText: "Berlangsung",
    defaultDescription: "Status absensi tercatat hadir, check-out belum dilakukan.",
    showAlertIcon: true,
  },
  missed: {
    container: "border-red-300 bg-red-50",
    dayText: "text-red-700",
    titleText: "text-red-900",
    bodyText: "text-red-800",
    badge: "bg-red-100",
    badgeText: "Terlewat",
    defaultDescription: "Absensi tidak ditemukan untuk hari kerja ini.",
    showAlertIcon: true,
  },
  off: {
    container: "border-slate-300 bg-slate-50",
    dayText: "text-slate-600",
    titleText: "text-slate-800",
    bodyText: "text-slate-700",
    badge: "bg-slate-200",
    badgeText: "Libur",
    defaultDescription: "Tidak ada jadwal kerja pada hari ini.",
  },
  upcoming: {
    container: "border-sky-300 bg-sky-50",
    dayText: "text-sky-700",
    titleText: "text-sky-900",
    bodyText: "text-sky-800",
    badge: "bg-sky-100",
    badgeText: "Mendatang",
    defaultDescription: "Jadwal belum dimulai.",
  },
};

// & Normalize both Indonesian and English weekday names to short Indonesian labels.
// % Menormalkan nama hari Indonesia maupun Inggris ke label singkat Indonesia.
export const DAY_SHORT_MAP: Record<string, string> = {
  senin: "SEN",
  selasa: "SEL",
  rabu: "RAB",
  kamis: "KAM",
  jumat: "JUM",
  sabtu: "SAB",
  minggu: "MIN",
  monday: "SEN",
  tuesday: "SEL",
  wednesday: "RAB",
  thursday: "KAM",
  friday: "JUM",
  saturday: "SAB",
  sunday: "MIN",
};
