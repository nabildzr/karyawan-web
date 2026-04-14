// * This file stores static constants and default state for employee submission forms.
import { CreateSubmissionInput, SubmissionStatus, SubmissionType } from "../../../../types/submissions.types";
import { getTodayJakartaDate } from "./mapper";

// & Define selectable submission type options shown in form dropdown.
// % Mendefinisikan opsi tipe pengajuan yang dapat dipilih pada dropdown form.
export const SUBMISSION_OPTIONS: Array<{ value: SubmissionType; label: string }> = [
  { value: "IZIN_SAKIT", label: "Izin Sakit" },
  { value: "IZIN_KHUSUS", label: "Izin Khusus" },
  { value: "DINAS_LUAR", label: "Dinas Luar" },
  { value: "LEMBUR", label: "Lembur" },
  { value: "GANTI_SHIFT_HARI", label: "Ganti Shift Hari" },
];

// & Define status filter tabs/options used in submission history list.
// % Mendefinisikan opsi filter status yang dipakai pada daftar riwayat pengajuan.
export const STATUS_FILTERS: Array<{
  value: SubmissionStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

// & Initialize create-form default values using today's Jakarta date.
// % Menginisialisasi nilai default form pembuatan dengan tanggal hari ini zona Jakarta.
export const INITIAL_FORM: CreateSubmissionInput = {
  type: "IZIN_SAKIT",
  startDate: getTodayJakartaDate().toISOString().split("T")[0],
  endDate: getTodayJakartaDate().toISOString().split("T")[0],
  reason: "",
};

// & Restrict uploaded attachment MIME types to supported document/image formats.
// % Membatasi MIME type lampiran yang diunggah hanya ke format dokumen/gambar yang didukung.
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

// & Set maximum attachment size to 10 MB.
// % Menetapkan ukuran maksimum lampiran sebesar 10 MB.
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

// & Set default page size for submission history pagination.
// % Menetapkan ukuran halaman default untuk paginasi riwayat pengajuan.
export const HISTORY_PAGE_SIZE = 4;