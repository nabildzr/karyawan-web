// * File route karyawan: attendanceFlow/utils/attendanceAction.ts
// & This utility resolves allowed attendance action from today-context payload.
// % Utility ini menentukan aksi absensi yang diizinkan dari payload konteks hari ini.
import type { TodayAttendanceContext } from "../../../../../types/attendances.types";
import type { AttendanceFlowActionType } from "../flowStore";

// * Utility ini menentukan aksi absensi yang valid dari konteks hari ini.

// & Resolve CHECK_IN or CHECK_OUT action based on attendance status.
// % Tentukan aksi CHECK_IN atau CHECK_OUT berdasarkan status kehadiran.
export const resolveAttendanceAction = (context?: TodayAttendanceContext | null) => {
  if (!context) {
    return {
      actionType: null as AttendanceFlowActionType | null,
      lockReason: null as string | null,
    };
  }

  if (context.canCheckOut && context.attendance?.checkIn && !context.attendance?.checkOut) {
    return {
      actionType: "CHECK_OUT" as const,
      lockReason: null,
    };
  }

  if (context.canCheckIn) {
    return {
      actionType: "CHECK_IN" as const,
      lockReason: null,
    };
  }

  return {
    actionType: null as AttendanceFlowActionType | null,
    lockReason:
      context.checkOutLockReason ??
      context.checkInLockReason ??
      context.lockReason ??
      "Absensi sedang terkunci.",
  };
};
