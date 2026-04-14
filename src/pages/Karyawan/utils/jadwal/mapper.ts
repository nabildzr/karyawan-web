// * This file maps schedule summary payloads into week-based UI view models.
import type { WorkingScheduleMobileDaySummary } from "../../../../types/workingSchedules.types";
import type {
  ShiftScheduleItem,
  ShiftScheduleWeek,
} from "../../routes/jadwal/types/JadwalTypes";
import { DATE_LABEL_FORMATTER, STATUS_STYLE } from "./constants";
import { formatRangeLabel, getDayShort, parseIsoDate, toIsoDate } from "./formatter";

function getWeekAnchor(date: Date) {
  // & Clone date so original reference is not mutated.
  // % Menyalin tanggal agar referensi asli tidak termutasi.
  const anchor = new Date(date);

  // & Convert Sunday-based index into Monday-based week index.
  // % Mengonversi indeks berbasis Minggu menjadi indeks minggu berbasis Senin.
  const dayIndex = (anchor.getDay() + 6) % 7;

  // & Shift date back to Monday and normalize time to midnight.
  // % Menggeser tanggal ke Senin dan menormalkan jam ke tengah malam.
  anchor.setDate(anchor.getDate() - dayIndex);
  anchor.setHours(0, 0, 0, 0);
  return anchor;
}

function mapDayToScheduleItem(day: WorkingScheduleMobileDaySummary): ShiftScheduleItem {
  // & Parse ISO date string for day number and localized date label generation.
  // % Parsing string tanggal ISO untuk membuat nomor hari dan label tanggal lokal.
  const date = parseIsoDate(day.date);

  // & Resolve shift name fallback based on upcoming/off status when shift is missing.
  // % Menentukan fallback nama shift berdasarkan status upcoming/off saat data shift kosong.
  const shiftName =
    day.shift?.name ?? (day.status === "upcoming" ? "Shift belum diatur" : "Off Day");

  // & Resolve shift time text with cross-day indicator or descriptive fallback.
  // % Menentukan teks jam shift dengan indikator lintas hari atau fallback deskriptif.
  const shiftTime = day.shift
    ? `${day.shift.startTime} - ${day.shift.endTime}${day.shift.isCrossDay ? " (Lintas hari)" : ""}`
    : day.status === "upcoming"
      ? "Menunggu pengaturan jam kerja"
      : "Tidak ada jam kerja";

  // & Build normalized card item used by schedule list components.
  // % Menyusun item kartu ternormalisasi yang dipakai komponen daftar jadwal.
  return {
    id: day.date,
    dayShort: getDayShort(day.dayOfWeek, date),
    dayNumber: String(date.getDate()).padStart(2, "0"),
    dateLabel: DATE_LABEL_FORMATTER.format(date),
    shiftName,
    shiftTime,
    description: day.note?.trim() || STATUS_STYLE[day.status].defaultDescription,
    status: day.status,
  };
}

export function mapSummaryToWeeks(days: WorkingScheduleMobileDaySummary[]): ShiftScheduleWeek[] {
  // & Return empty list immediately when API has no day summary data.
  // % Mengembalikan list kosong lebih awal saat API tidak memiliki data ringkasan harian.
  if (days.length === 0) {
    return [];
  }

  // & Group day summaries by week-anchor date key.
  // % Mengelompokkan ringkasan harian berdasarkan key tanggal anchor minggu.
  const grouped = new Map<string, WorkingScheduleMobileDaySummary[]>();

  // & Sort all day entries by date to ensure deterministic week and item ordering.
  // % Mengurutkan seluruh entri harian berdasarkan tanggal agar urutan minggu dan item deterministik.
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

  // & Populate grouped map with each day entry under its computed week key.
  // % Mengisi map kelompok dengan setiap entri hari di bawah key minggu yang dihitung.
  for (const day of sortedDays) {
    const date = parseIsoDate(day.date);
    const weekKey = toIsoDate(getWeekAnchor(date));

    if (!grouped.has(weekKey)) {
      grouped.set(weekKey, []);
    }

    grouped.get(weekKey)?.push(day);
  }

  // & Transform grouped entries into week view objects with range label and mapped items.
  // % Mengubah entri hasil grouping menjadi objek view mingguan dengan label rentang dan item terpetakan.
  return Array.from(grouped.values()).map((weekItems, index) => ({
    weekNumber: index + 1,
    rangeLabel: formatRangeLabel(
      weekItems[0]?.date ?? "",
      weekItems[weekItems.length - 1]?.date ?? "",
    ),
    items: weekItems.map(mapDayToScheduleItem),
  }));
}
