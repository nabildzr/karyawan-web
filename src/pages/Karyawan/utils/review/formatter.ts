// * This file formats review score, period, and date-time text for display/export.
import { MONTHS_ID } from "../../routes/review/data/monthsId";
import { parseIsoDate } from "./parser";

export function formatScore(value: number): string {
  // & Guard score with finite check so NaN/Infinity never reach UI.
  // % Menjaga skor dengan pengecekan finite agar NaN/Infinity tidak masuk ke UI.
  const safeValue = Number.isFinite(value) ? value : 0;

  // & Keep one decimal precision for consistent score display.
  // % Menjaga presisi satu desimal agar tampilan skor konsisten.
  return safeValue.toFixed(1);
}


export function formatPeriod(month: number, year: number): string {
  // & Convert numeric month-year into localized month name and year label.
  // % Mengonversi angka bulan-tahun menjadi label nama bulan lokal dan tahun.
  return `${MONTHS_ID[month - 1]} ${year}`;
}



export function formatDateTime(value?: string | null): string {
  // & Parse ISO-like value safely using shared parser helper.
  // % Parsing nilai mirip ISO secara aman menggunakan helper parser bersama.
  const parsedDate = parseIsoDate(value);

  // & Return fallback symbol when date is absent or invalid.
  // % Mengembalikan simbol fallback saat tanggal tidak ada atau tidak valid.
  if (!parsedDate) return "-";

  // & Format date part in Indonesian locale with Jakarta timezone.
  // % Memformat bagian tanggal dengan locale Indonesia dan zona waktu Jakarta.
  const datePart = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate);

  // & Format time part and replace colon with dot for design requirement.
  // % Memformat bagian waktu lalu mengganti titik dua menjadi titik sesuai kebutuhan desain.
  const timePart = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  })
    .format(parsedDate)
    .replace(":", ".");

  // & Combine date and time parts into a single printable label.
  // % Menggabungkan bagian tanggal dan waktu menjadi satu label siap tampil/cetak.
  return `${datePart}, ${timePart}`;
}