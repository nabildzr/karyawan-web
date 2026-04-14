// * File route karyawan: attendanceFlow/utils/errors.ts
// & This utility normalizes processing errors into structured flow error codes.
// % Utility ini menormalkan error processing menjadi kode error flow terstruktur.
import type { AttendanceFlowErrorCode } from "../flowStore";

// * Utility ini menangani normalisasi error pada flow processing absensi.

export class FlowProcessError extends Error {
  code: AttendanceFlowErrorCode;

  constructor(code: AttendanceFlowErrorCode, message: string) {
    super(message);
    this.name = "FlowProcessError";
    this.code = code;
  }
}

// & Map raw backend/client error text into structured flow error code.
// % Petakan teks error mentah backend/client menjadi kode error flow terstruktur.
export const inferErrorCode = (message: string): AttendanceFlowErrorCode => {
  const value = message.toLowerCase();

  if (
    value.includes("sunglasses") ||
    value.includes("glasses") ||
    value.includes("kacamata")
  ) {
    return "GLASSES_DETECTED";
  }

  if (value.includes("mask") || value.includes("masker")) {
    return "MASK_DETECTED";
  }

  if (
    value.includes("registrasi wajah") ||
    value.includes("belum terdaftar") ||
    value.includes("enrollment")
  ) {
    return "NOT_REGISTERED";
  }

  if (value.includes("geofence") || value.includes("lokasi")) {
    return "OUTSIDE_GEOFENCE";
  }

  if (
    value.includes("sudah check") ||
    value.includes("sudah melakukan") ||
    value.includes("tidak ditemukan data check-in") ||
    value.includes("terkunci")
  ) {
    return "ALREADY_CHECKED";
  }

  if (value.includes("kemiripan") || value.includes("confidence")) {
    return "LOW_CONFIDENCE";
  }

  if (value.includes("timeout") || value.includes("time out")) {
    return "TIMEOUT";
  }

  return "FACE_NOT_MATCH";
};

// & Extract the most relevant message from unknown error shapes.
// % Ekstrak pesan paling relevan dari berbagai bentuk error yang tidak pasti.
export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;

  if (error instanceof FlowProcessError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string; error?: string } };
  };

  return (
    maybeError.response?.data?.message ??
    maybeError.response?.data?.error ??
    maybeError.message ??
    "Gagal memproses absensi wajah."
  );
};
