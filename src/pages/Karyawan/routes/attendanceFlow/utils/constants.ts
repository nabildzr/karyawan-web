// * File route karyawan: attendanceFlow/utils/constants.ts
// & This file centralizes threshold and timing constants for attendance flow.
// % File ini memusatkan konstanta ambang dan timing untuk flow absensi.
export const CHECK_INTERVAL_MS = 2000;
export const MIN_BRIGHTNESS = 50;
export const MAX_BRIGHTNESS = 220;
export const MAX_BRIGHTNESS_GAP = 35;

export const STEP_MIN_DURATION_MS = 800;
export const FACE_CONFIDENCE_THRESHOLD = 80;

export const PROCESS_STEPS = [
  "Mengecek konteks absensi hari ini",
  "Memverifikasi wajah ke mesin AI",
  "Memvalidasi lokasi dan menyimpan absensi",
  "Menyusun hasil absensi",
];

export const ENFORCE_ACCESSORY_VALIDATION =
  import.meta.env.VITE_ENFORCE_ACCESSORY_VALIDATION === "true";
