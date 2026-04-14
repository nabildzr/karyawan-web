// * File route karyawan: attendanceFlow/flowStore.ts
// & This file persists attendance flow state in session storage.
// % File ini menyimpan state flow absensi di session storage.
export type AttendanceFlowActionType = "CHECK_IN" | "CHECK_OUT";
export type AttendanceFlowStage = "IDLE" | "CAPTURED" | "PROCESSING" | "RESULT_READY";

export type AttendanceFlowErrorCode =
  | "FACE_NOT_MATCH"
  | "LOW_CONFIDENCE"
  | "NOT_REGISTERED"
  | "OUTSIDE_GEOFENCE"
  | "ALREADY_CHECKED"
  | "GLASSES_DETECTED"
  | "MASK_DETECTED"
  | "TIMEOUT";

export interface AttendanceFlowResultState {
  stage: AttendanceFlowStage;
  status: "idle" | "success" | "failed";
  captureDataUrl: string | null;
  actionType: AttendanceFlowActionType | null;
  employeeName: string | null;
  timestamp: string | null;
  locationLabel: string | null;
  confidence: number | null;
  errorCode: AttendanceFlowErrorCode | null;
  errorMessage: string | null;
  attendanceId: string | null;
  capturedAt: string | null;
  processedAt: string | null;
  contextDateKey: string | null;
}

const STORAGE_KEY = "attendance-flow-result-v2";
const CAPTURE_STATE_MAX_AGE_MS = 5 * 60 * 1000;
const RESULT_STATE_MAX_AGE_MS = 15 * 60 * 1000;

const DEFAULT_STATE: AttendanceFlowResultState = {
  stage: "IDLE",
  status: "idle",
  captureDataUrl: null,
  actionType: null,
  employeeName: null,
  timestamp: null,
  locationLabel: null,
  confidence: null,
  errorCode: null,
  errorMessage: null,
  attendanceId: null,
  capturedAt: null,
  processedAt: null,
  contextDateKey: null,
};

const canUseSessionStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const cloneDefaultState = (): AttendanceFlowResultState => ({ ...DEFAULT_STATE });

// & Check whether an ISO timestamp is still within the allowed age window.
// % Cek apakah timestamp ISO masih berada dalam batas umur yang diizinkan.
const isFreshTimestamp = (iso: string | null, maxAgeMs: number): boolean => {
  if (!iso) return false;

  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return false;

  return Date.now() - timestamp <= maxAgeMs;
};

export const getAttendanceFlowResult = (): AttendanceFlowResultState => {
  if (!canUseSessionStorage()) return cloneDefaultState();

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneDefaultState();

  try {
    const parsed = JSON.parse(raw) as Partial<AttendanceFlowResultState>;
    return {
      ...cloneDefaultState(),
      ...parsed,
    };
  } catch {
    return cloneDefaultState();
  }
};

// & Merge partial state updates and persist the result in session storage.
// % Gabungkan update state parsial lalu simpan hasilnya ke session storage.
export const setAttendanceFlowResult = (
  next: Partial<AttendanceFlowResultState>,
): AttendanceFlowResultState => {
  const merged: AttendanceFlowResultState = {
    ...getAttendanceFlowResult(),
    ...next,
  };

  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  return merged;
};

// & Clear persisted flow state to reset attendance flow session.
// % Hapus state flow tersimpan untuk mereset sesi flow absensi.
export const resetAttendanceFlowResult = () => {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
};

// & Validate whether the capture state is still usable for processing step.
// % Validasi apakah state capture masih layak dipakai untuk tahap processing.
export const isCaptureStateValid = (
  state: AttendanceFlowResultState,
  expectedDateKey?: string,
): boolean => {
  if (state.stage !== "CAPTURED" && state.stage !== "PROCESSING") return false;
  if (state.status !== "idle") return false;
  if (!state.captureDataUrl) return false;
  if (!isFreshTimestamp(state.capturedAt, CAPTURE_STATE_MAX_AGE_MS)) return false;

  if (expectedDateKey && state.contextDateKey && state.contextDateKey !== expectedDateKey) {
    return false;
  }

  return true;
};

// & Validate whether result state is still valid before showing result page.
// % Validasi apakah state hasil masih valid sebelum menampilkan halaman result.
export const isResultStateValid = (
  state: AttendanceFlowResultState,
  expectedDateKey?: string,
): boolean => {
  if (state.stage !== "RESULT_READY") return false;
  if (state.status !== "success" && state.status !== "failed") return false;
  if (!isFreshTimestamp(state.processedAt, RESULT_STATE_MAX_AGE_MS)) return false;

  if (expectedDateKey && state.contextDateKey && state.contextDateKey !== expectedDateKey) {
    return false;
  }

  return true;
};

export const ATTENDANCE_FLOW_ERROR_MESSAGES: Record<
  AttendanceFlowErrorCode,
  {
    title: string;
    description: string;
  }
> = {
  FACE_NOT_MATCH: {
    title: "Wajah tidak cocok",
    description:
      "Wajah Anda tidak cocok dengan data yang terdaftar. Pastikan wajah berada di tengah kamera.",
  },
  LOW_CONFIDENCE: {
    title: "Kemiripan terlalu rendah",
    description:
      "Sistem belum cukup yakin dengan hasil verifikasi. Coba ambil ulang dengan pencahayaan lebih baik.",
  },
  NOT_REGISTERED: {
    title: "Wajah belum terdaftar",
    description:
      "Data wajah Anda belum terdaftar di sistem. Hubungi admin untuk melakukan registrasi wajah.",
  },
  OUTSIDE_GEOFENCE: {
    title: "Di luar area absensi",
    description:
      "Lokasi Anda berada di luar geofence kantor. Masuk ke area kantor lalu coba lagi.",
  },
  ALREADY_CHECKED: {
    title: "Absensi sudah selesai",
    description:
      "Anda sudah melakukan absensi untuk tahap ini hari ini. Tidak ada aksi tambahan yang bisa diproses.",
  },
  GLASSES_DETECTED: {
    title: "Aksesori terdeteksi",
    description:
      "Kacamata atau sunglasses terdeteksi. Lepaskan aksesori di area wajah lalu coba lagi.",
  },
  MASK_DETECTED: {
    title: "Masker terdeteksi",
    description:
      "Masker menutupi wajah Anda. Buka masker sementara agar verifikasi wajah bisa dilakukan.",
  },
  TIMEOUT: {
    title: "Proses timeout",
    description:
      "Permintaan ke layanan verifikasi melebihi batas waktu. Periksa koneksi dan coba kembali.",
  },
};
