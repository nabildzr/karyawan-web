// * This file contains formatter helpers for employee submission labels and values.
import { SubmissionType } from "../../../../types/submissions.types";
import { SUBMISSION_OPTIONS } from "./constants";

export function formatType(type: SubmissionType) {
  // & Resolve localized label from known options and fallback to raw enum value.
  // % Menentukan label terlokalisasi dari opsi yang dikenal dan fallback ke nilai enum mentah.
  return (
    SUBMISSION_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}

export function formatDate(input: string) {
  // & Format raw date string into short Indonesian date text.
  // % Memformat string tanggal mentah menjadi teks tanggal Indonesia yang ringkas.
  return new Date(input).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateField(input: string) {
  // & Return placeholder format when input is empty.
  // % Mengembalikan placeholder format saat input kosong.
  if (!input) return "DD/MM/YYYY";

  // & Split YYYY-MM-DD input for manual display transformation.
  // % Memecah input YYYY-MM-DD untuk transformasi tampilan manual.
  const [year, month, day] = input.split("-");

  // & Return placeholder when input is malformed.
  // % Mengembalikan placeholder saat input tidak sesuai format.
  if (!year || !month || !day) return "DD/MM/YYYY";

  // & Convert into DD/MM/YYYY display format used by date field UI.
  // % Mengonversi ke format tampilan DD/MM/YYYY yang dipakai UI field tanggal.
  return `${day}/${month}/${year}`;
}

export function formatFileSize(size: number) {
  // & Use MB format when size is at least 1 MB for readability.
  // % Menggunakan format MB saat ukuran minimal 1 MB agar mudah dibaca.
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  // & Otherwise show rounded KB with minimum 1 KB.
  // % Jika tidak, tampilkan KB pembulatan dengan minimum 1 KB.
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function toJakartaDateKey(date: Date) {
  // & Return timezone-aware date key using sv-SE format (YYYY-MM-DD).
  // % Mengembalikan date key berbasis timezone menggunakan format sv-SE (YYYY-MM-DD).
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}