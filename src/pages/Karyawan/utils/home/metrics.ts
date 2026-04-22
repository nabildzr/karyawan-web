// * This file derives employee home dashboard metrics from attendance history data.
import type { MyAttendanceHistoryData } from "../../../../services/attendances.service";
import type { CardTone, HomeMetrics, HomeSummaryCard } from "./types";

function formatTime(iso?: string | null) {
  // & Show placeholder when no timestamp is available.
  // % Menampilkan placeholder saat timestamp tidak tersedia.
  if (!iso) return "--:--";

  // & Format timestamp into HH:mm for compact metric cards.
  // % Memformat timestamp menjadi HH:mm untuk kartu metrik yang ringkas.
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameLocalDay(dateInput?: string | null, refDate = new Date()) {
  // & Return false early when there is no date input.
  // % Mengembalikan false lebih awal saat tidak ada input tanggal.
  if (!dateInput) return false;

  // & Parse once and compare year-month-day for local day equality.
  // % Parsing sekali lalu membandingkan tahun-bulan-hari untuk kesetaraan hari lokal.
  const date = new Date(dateInput);
  return (
    date.getFullYear() === refDate.getFullYear() &&
    date.getMonth() === refDate.getMonth() &&
    date.getDate() === refDate.getDate()
  );
}

function sortByNewest(records: MyAttendanceHistoryData["records"]) {
  // & Clone and sort records by creation timestamp descending.
  // % Menyalin lalu mengurutkan data berdasarkan waktu pembuatan terbaru ke terlama.
  return [...records].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function deriveMetrics(data: MyAttendanceHistoryData): HomeMetrics {
  // & Sort history once so subsequent lookups use a consistent order.
  // % Mengurutkan riwayat sekali agar pencarian berikutnya memakai urutan konsisten.
  const sorted = sortByNewest(data.records);

  // & Try to find today's record using multiple reliable date fields.
  // % Mencoba mencari record hari ini dengan beberapa field tanggal yang andal.
  const todayRecord = sorted.find(
    (record) =>
      isSameLocalDay(record.checkIn) ||
      isSameLocalDay(record.expectedCheckInSnapshot) ||
      isSameLocalDay(record.createdAt),
  );

  // & Find latest check-in/check-out records as fallback when today's data is absent.
  // % Mencari record check-in/check-out terbaru sebagai fallback saat data hari ini tidak ada.
  const latestCheckInRecord = sorted.find((record) => !!record.checkIn);
  const latestCheckOutRecord = sorted.find((record) => !!record.checkOut);

  // & Prioritize today's record, otherwise fallback to latest available records.
  // % Memprioritaskan record hari ini, jika tidak ada gunakan record terbaru yang tersedia.
  const checkInRecord = todayRecord ?? latestCheckInRecord;
  const checkOutRecord = todayRecord ?? latestCheckOutRecord;

  // & Derive check-in hint text based on attendance status and availability.
  // % Menurunkan teks petunjuk check-in berdasarkan status absensi dan ketersediaan data.
  const checkInHint = !checkInRecord?.checkIn
    ? "Belum Absen"
    : checkInRecord.status === "PRESENT"
      ? "Tepat Waktu"
      : checkInRecord.status === "LATE"
        ? "Terlambat"
        : "Tercatat";

  // & Derive check-in tone to align visual severity with attendance status.
  // % Menurunkan tone check-in agar tingkat visual sesuai status absensi.
  const checkInTone: CardTone = !checkInRecord?.checkIn
    ? "gray"
    : checkInRecord.status === "PRESENT"
      ? "success"
      : checkInRecord.status === "LATE"
        ? "warning"
        : "brand";

  // & Detect today's missing check-out to avoid misleading status text.
  // % Mendeteksi check-out hari ini yang belum ada agar teks status tidak menyesatkan.
  const hasTodayWithoutCheckout = !!todayRecord && !todayRecord.checkOut;

  // & Build check-out hint with special handling for missing or early check-out.
  // % Menyusun petunjuk check-out dengan penanganan khusus untuk data hilang atau pulang awal.
  const checkOutHint = hasTodayWithoutCheckout
    ? "Belum Check Out"
    : !checkOutRecord?.checkOut
      ? "Belum Check Out"
      : checkOutRecord.statusCheckOut === "LATE"
        ? "Pulang Awal"
        : "Sesuai Jadwal";

  // & Build check-out tone to match hint semantics.
  // % Menyusun tone check-out agar selaras dengan semantik petunjuk.
  const checkOutTone: CardTone =
    !checkOutRecord?.checkOut || hasTodayWithoutCheckout
      ? "gray"
      : checkOutRecord.statusCheckOut === "LATE"
        ? "warning"
        : "brand";

  // & Compute attendance percentage from present/late days against total work days.
  // % Menghitung persentase kehadiran dari hari hadir/terlambat dibanding total hari kerja.
  const totalWorkDays = data.summary?.total_days ?? 0;
  const presentDays = sorted.filter(
    (record) => record.status === "PRESENT" || record.status === "LATE",
  ).length;
  const attendancePercent =
    totalWorkDays > 0 ? Math.round((presentDays / totalWorkDays) * 100) : 0;



  // & Return normalized metric payload consumed by home summary cards.
  // % Mengembalikan payload metrik ternormalisasi yang dipakai kartu ringkasan beranda.
  return {
    checkIn: formatTime(checkInRecord?.checkIn),
    checkInHint,
    checkInTone,
    checkOut: formatTime(checkOutRecord?.checkOut),
    checkOutHint,
    checkOutTone,
    attendancePercent: `${attendancePercent}%`,
    attendanceHint: `${totalWorkDays} Hari Kerja`,
    attendanceTone: attendancePercent >= 90 ? "success" : "warning",
  };
}

export function buildSummaryCards(
  metrics: HomeMetrics,
  loadingMetrics: boolean,
): HomeSummaryCard[] {
  // & Build four summary cards and switch to loading placeholders when data is pending.
  // % Menyusun empat kartu ringkasan dan beralih ke placeholder loading saat data belum siap.
  return [
    {
      label: "Jam Masuk",
      value: loadingMetrics ? "..." : metrics.checkIn,
      hint: loadingMetrics ? "Memuat..." : metrics.checkInHint,
      tone: metrics.checkInTone,
    },
    {
      label: "Jam Pulang",
      value: loadingMetrics ? "..." : metrics.checkOut,
      hint: loadingMetrics ? "Memuat..." : metrics.checkOutHint,
      tone: metrics.checkOutTone,
    },
    {
      label: "Kehadiran",
      value: loadingMetrics ? "..." : metrics.attendancePercent,
      hint: loadingMetrics ? "Memuat..." : metrics.attendanceHint,
      tone: metrics.attendanceTone,
    },
 
  ];
}

export function toneClass(tone: CardTone) {
  // & Map semantic tone token into Tailwind utility classes.
  // % Memetakan token tone semantik ke kelas utilitas Tailwind.
  if (tone === "success") return "bg-success-50 text-success-700";
  if (tone === "brand") return "bg-brand-50 text-brand-700";
  if (tone === "warning") return "bg-warning-50 text-warning-700";
  return "bg-gray-100 text-gray-700";
}
