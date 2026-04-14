// * This file defines route module logic for src/pages/Karyawan/routes/jadwal/types/JadwalTypes.ts.

// & This file defines schedule route type contracts for view models and component props.
// % File ini mendefinisikan kontrak tipe route jadwal untuk view model dan props komponen.

import type { WorkingScheduleMobileDayStatus } from "../../../../../types/workingSchedules.types";

// & Define month option shape used by month selector control.
// % Mendefinisikan bentuk opsi bulan yang dipakai kontrol pemilih bulan.
export interface ScheduleMonthOption {
  value: string;
  label: string;
}

// & Define normalized day card model shown inside weekly schedule list.
// % Mendefinisikan model kartu harian ternormalisasi yang ditampilkan di daftar jadwal mingguan.
export interface ShiftScheduleItem {
  id: string;
  dayShort: string;
  dayNumber: string;
  dateLabel: string;
  shiftName: string;
  shiftTime: string;
  description: string;
  status: WorkingScheduleMobileDayStatus;
}

// & Define grouped weekly schedule payload consumed by list sections.
// % Mendefinisikan payload jadwal mingguan terkelompok yang dipakai section daftar.
export interface ShiftScheduleWeek {
  weekNumber: number;
  rangeLabel: string;
  items: ShiftScheduleItem[];
}

// & Define shared header component props.
// % Mendefinisikan props komponen header bersama.
export interface HeaderSectionProps {
  title: string;
  description: string;
}

// & Define week selector component props and callback contracts.
// % Mendefinisikan props komponen pemilih minggu beserta kontrak callback.
export interface WeekSelectorProps {
  selectedMonth: string;
  monthOptions: ScheduleMonthOption[];
  selectedWeek: number;
  weeks: ShiftScheduleWeek[];
  disabled?: boolean;
  onMonthChange: (nextMonth: string) => void;
  onWeekChange: (nextWeek: number) => void;
}

// & Define schedule card props.
// % Mendefinisikan props untuk kartu jadwal.
export interface ScheduleCardProps {
  item: ShiftScheduleItem;
}

// & Define schedule list props with title and active week data.
// % Mendefinisikan props daftar jadwal dengan judul dan data minggu aktif.
export interface ScheduleListProps {
  title: string;
  weekData: ShiftScheduleWeek;
}

// & Define style token contract for rendering per-status schedule cards.
// % Mendefinisikan kontrak token style untuk render kartu jadwal per status.
export interface ScheduleStatusStyle {
  container: string;
  dayText: string;
  titleText: string;
  bodyText: string;
  badge: string;
  badgeText: string;
  defaultDescription: string;
  showAlertIcon?: boolean;
}
