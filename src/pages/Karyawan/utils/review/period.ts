// * This file provides period range and selector option helpers for review filtering.
import { MONTHS_ID } from "../../routes/review/data/monthsId";
import { parseIsoDate } from "./parser";

// & Define shape for month selector option.
// % Mendefinisikan bentuk opsi selector bulan.
export interface MonthOption {
  value: number;
  label: string;
}

// & Define inclusive start-end range used for valid review periods.
// % Mendefinisikan rentang start-end inklusif yang dipakai untuk periode review valid.
export interface PeriodRange {
  start: Date;
  end: Date;
}

export function getValidPeriodRange(joinDate?: string | null): PeriodRange {
  // & Use current month start as upper bound for selectable review period.
  // % Menggunakan awal bulan saat ini sebagai batas atas periode review yang bisa dipilih.
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  // & Parse employee join date as optional lower-bound source.
  // % Parsing tanggal join karyawan sebagai sumber batas bawah opsional.
  const parsedJoinDate = parseIsoDate(joinDate);

  // & Fallback to last 12 months when join date is unavailable/invalid.
  // % Fallback ke 12 bulan terakhir saat tanggal join tidak ada/tidak valid.
  if (!parsedJoinDate) {
    return {
      start: new Date(end.getFullYear(), end.getMonth() - 11, 1),
      end,
    };
  }

  // & Normalize join date to first day of its month.
  // % Menormalkan tanggal join ke hari pertama pada bulannya.
  const start = new Date(
    parsedJoinDate.getFullYear(),
    parsedJoinDate.getMonth(),
    1,
  );

  // & If join month is after end bound, clamp start to end.
  // % Jika bulan join melewati batas akhir, jepit nilai start ke end.
  if (start > end) {
    return { start: end, end };
  }

  // & Return computed valid period range.
  // % Mengembalikan rentang periode valid hasil perhitungan.
  return { start, end };
}

export function buildYearOptions(range: PeriodRange): number[] {
  // & Build descending year list from end year down to start year.
  // % Menyusun daftar tahun menurun dari tahun akhir hingga tahun awal.
  const years: number[] = [];
  for (
    let currentYear = range.end.getFullYear();
    currentYear >= range.start.getFullYear();
    currentYear -= 1
  ) {
    years.push(currentYear);
  }

  // & Return year options for selector component.
  // % Mengembalikan opsi tahun untuk komponen selector.
  return years;
}

export function buildMonthOptions(
  year: number,
  range: PeriodRange,
): MonthOption[] {
  // & Resolve allowed start month based on selected year and range lower bound.
  // % Menentukan bulan awal yang diizinkan berdasarkan tahun terpilih dan batas bawah rentang.
  const startMonth =
    year === range.start.getFullYear() ? range.start.getMonth() + 1 : 1;

  // & Resolve allowed end month based on selected year and range upper bound.
  // % Menentukan bulan akhir yang diizinkan berdasarkan tahun terpilih dan batas atas rentang.
  const endMonth =
    year === range.end.getFullYear() ? range.end.getMonth() + 1 : 12;

  // & Normalize month boundaries so loop remains valid even on inverted input.
  // % Menormalkan batas bulan agar perulangan tetap valid walau input terbalik.
  const safeStart = Math.min(startMonth, endMonth);
  const safeEnd = Math.max(startMonth, endMonth);

  // & Build month options from safeStart to safeEnd.
  // % Menyusun opsi bulan dari safeStart sampai safeEnd.
  const options: MonthOption[] = [];
  for (let month = safeStart; month <= safeEnd; month += 1) {
    options.push({ value: month, label: MONTHS_ID[month - 1] });
  }

  // & Return month options for current selected year.
  // % Mengembalikan opsi bulan untuk tahun yang sedang dipilih.
  return options;
}

export function clampMonthForYear(
  year: number,
  month: number,
  range: PeriodRange,
): number {
  // & Resolve minimum month allowed for selected year.
  // % Menentukan bulan minimum yang diizinkan pada tahun terpilih.
  const minMonth =
    year === range.start.getFullYear() ? range.start.getMonth() + 1 : 1;

  // & Resolve maximum month allowed for selected year.
  // % Menentukan bulan maksimum yang diizinkan pada tahun terpilih.
  const maxMonth =
    year === range.end.getFullYear() ? range.end.getMonth() + 1 : 12;

  // & Normalize min/max to keep clamping robust.
  // % Menormalkan min/max agar proses clamp tetap robust.
  const safeMin = Math.min(minMonth, maxMonth);
  const safeMax = Math.max(minMonth, maxMonth);

  // & Clamp below minimum to minimum.
  // % Menjepit nilai di bawah minimum menjadi minimum.
  if (month < safeMin) return safeMin;

  // & Clamp above maximum to maximum.
  // % Menjepit nilai di atas maksimum menjadi maksimum.
  if (month > safeMax) return safeMax;

  // & Return month unchanged when it is already within allowed range.
  // % Mengembalikan bulan tanpa perubahan saat sudah berada dalam rentang yang diizinkan.
  return month;
}