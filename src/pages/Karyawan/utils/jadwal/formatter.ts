// * This file contains formatter and date-range helper functions for schedule utilities.
import type { ScheduleMonthOption } from "../../routes/jadwal/types/JadwalTypes";
import {
  DAY_SHORT_MAP,
  MONTH_FORMATTER,
  RANGE_END_FORMATTER,
  RANGE_START_FORMATTER,
} from "./constants";

export function toMonthValue(date: Date) {
  // & Convert Date to YYYY-MM value used by month selector query state.
  // % Mengonversi Date menjadi nilai YYYY-MM yang dipakai state query pemilih bulan.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function toIsoDate(date: Date) {
  // & Convert Date object into stable YYYY-MM-DD string.
  // % Mengonversi objek Date menjadi string YYYY-MM-DD yang stabil.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string) {
  // & Parse date-only string with midnight suffix to avoid timezone drift during parsing.
  // % Parsing string tanggal-only dengan akhiran tengah malam agar tidak bergeser karena timezone.
  return new Date(`${value}T00:00:00`);
}

export function getMonthBounds(monthValue: string) {
  // & Split YYYY-MM input into numeric year and month values.
  // % Memecah input YYYY-MM menjadi nilai tahun dan bulan numerik.
  const [year, month] = monthValue.split("-").map(Number);

  // & Fallback to current month bounds when input is invalid.
  // % Fallback ke batas bulan saat ini jika input tidak valid.
  if (!year || !month || month < 1 || month > 12) {
    const now = new Date();
    return {
      startDate: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }

  // & Build first and last date for the selected month.
  // % Membangun tanggal awal dan akhir untuk bulan yang dipilih.
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // & Return normalized date bounds as ISO date-only strings.
  // % Mengembalikan batas tanggal ternormalisasi sebagai string ISO date-only.
  return {
    startDate: toIsoDate(startDate),
    endDate: toIsoDate(endDate),
  };
}

export function formatMonthLabel(date: Date) {
  // & Format month label then capitalize first character for UI consistency.
  // % Memformat label bulan lalu kapitalisasi karakter pertama agar konsisten di UI.
  const label = MONTH_FORMATTER.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildMonthOptions(
  joinDate?: string,
  serverDate?: string,
  selectedMonth?: string,
  forward = 3,
) {
  // & Initialize option container and current date baseline.
  // % Inisialisasi penampung opsi dan baseline tanggal saat ini.
  const options: ScheduleMonthOption[] = [];
  const today = new Date();

  // & Resolve start and end sources from join/server dates with sensible defaults.
  // % Menentukan sumber tanggal awal dan akhir dari join/server date dengan default yang masuk akal.
  const startSource = joinDate
    ? parseIsoDate(joinDate)
    : new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const endSource = serverDate ? parseIsoDate(serverDate) : today;

  // & Expand selectable range from start month to end month plus forward buffer.
  // % Memperluas rentang pilihan dari bulan awal ke bulan akhir plus buffer ke depan.
  const startMonth = new Date(startSource.getFullYear(), startSource.getMonth(), 1);
  const endMonth = new Date(endSource.getFullYear(), endSource.getMonth() + forward, 1);

  // & Ensure end range includes selected month when user has out-of-range state.
  // % Memastikan rentang akhir mencakup bulan terpilih saat state user berada di luar rentang.
  if (selectedMonth) {
    const selectedDate = parseIsoDate(`${selectedMonth}-01`);
    if (selectedDate > endMonth) {
      endMonth.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
  }

  // & Iterate month by month to generate selector options.
  // % Melakukan iterasi per bulan untuk menghasilkan opsi selector.
  const cursor = new Date(startMonth);
  while (cursor <= endMonth) {
    const monthDate = new Date(cursor);

    // & Push value-label pair for current cursor month.
    // % Menambahkan pasangan value-label untuk bulan cursor saat ini.
    options.push({
      value: toMonthValue(monthDate),
      label: formatMonthLabel(monthDate),
    });

    // & Move cursor to next month.
    // % Memindahkan cursor ke bulan berikutnya.
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // & Return completed month option list.
  // % Mengembalikan daftar opsi bulan yang sudah lengkap.
  return options;
}

export function getDayShort(dayOfWeek: string, date: Date) {
  // & Normalize weekday key for case-insensitive map lookup.
  // % Menormalkan key hari agar lookup map tidak sensitif huruf besar-kecil.
  const key = dayOfWeek.trim().toLowerCase();
  const mapped = DAY_SHORT_MAP[key];

  // & Return mapped short label when available.
  // % Mengembalikan label singkat hasil mapping jika tersedia.
  if (mapped) {
    return mapped;
  }

  // & Fallback to locale short weekday when day name is unknown.
  // % Fallback ke nama hari singkat locale saat nama hari tidak dikenali.
  const fallback = date.toLocaleDateString("id-ID", { weekday: "short" });
  return fallback.toUpperCase().slice(0, 3);
}

export function formatRangeLabel(startDateIso: string, endDateIso: string) {
  // & Parse range boundaries then format into concise human-readable week range text.
  // % Parsing batas rentang lalu memformatnya menjadi teks rentang minggu yang ringkas dan mudah dibaca.
  const startDate = parseIsoDate(startDateIso);
  const endDate = parseIsoDate(endDateIso);

  return `${RANGE_START_FORMATTER.format(startDate)} - ${RANGE_END_FORMATTER.format(endDate)}`;
}
