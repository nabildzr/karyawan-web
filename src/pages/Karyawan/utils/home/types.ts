// * This file defines type contracts used by employee home utilities and UI cards.
// & Define supported tone variants used to color metric badges and chips.
// % Mendefinisikan varian tone yang didukung untuk mewarnai badge dan chip metrik.
export type CardTone = "success" | "brand" | "warning" | "gray";

// & Define normalized metrics shape used across home business logic and UI rendering.
// % Mendefinisikan bentuk metrik ternormalisasi yang dipakai di logika bisnis dan render UI beranda.
export interface HomeMetrics {
  checkIn: string;
  checkInHint: string;
  checkInTone: CardTone;
  checkOut: string;
  checkOutHint: string;
  checkOutTone: CardTone;
  attendancePercent: string;
  attendanceHint: string;
  attendanceTone: CardTone;
}

// & Define lightweight card payload shape shown in the summary grid.
// % Mendefinisikan bentuk payload kartu ringkas yang ditampilkan di grid ringkasan.
export interface HomeSummaryCard {
  label: string;
  value: string;
  hint: string;
  tone: CardTone;
}

// & Define structure for quick menu cards in employee home menu section.
// % Mendefinisikan struktur kartu menu cepat pada bagian menu beranda karyawan.
export interface HomeMenuCard {
  title: string;
  subtitle: string;
}

// & Define structure for home activity timeline/list items.
// % Mendefinisikan struktur item aktivitas pada timeline/daftar beranda.
export interface HomeActivityItem {
  title: string;
  description: string;
  status: string;
  statusTone: CardTone;
}
