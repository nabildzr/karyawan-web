// * File route karyawan: absensi/hooks/useAbsensiComputedState.ts
import { useMemo } from "react";
import type { MyAttendanceHistoryData } from "../../../../../services/attendances.service";
import type { TodayAttendanceContext } from "../../../../../types/attendances.types";
import type { Geofence } from "../../../../../types/geofences.types";
import type { EmployeeDetail2 } from "../../../../../types/karyawan.types";
import {
    formatDistance,
    formatIsoToTime24,
    formatShiftStart24,
    formatSubmissionTypeLabel,
} from "../../../utils/absensi/formatters";
import {
    distanceInMeters,
    getTodayScheduleStart,
    isSameLocalDay,
    resolvePreferredAction,
} from "../../../utils/absensi/logic";
import type { GeofenceWithDistance, LocationState } from "../types/AbsensiTypes";

type UseAbsensiComputedStateParams = {
  now: Date;
  locationState: LocationState;
  currentCoordinates: [number, number];
  officeLocations?: Geofence[];
  selfDetail?: EmployeeDetail2;
  myHistory?: MyAttendanceHistoryData;
  todayContext?: TodayAttendanceContext;
};

// & This hook centralizes derived attendance UI state to keep page component lean.
// % Hook ini memusatkan state turunan UI absensi agar komponen halaman tetap ringkas.
const useAbsensiComputedState = ({
  now,
  locationState,
  currentCoordinates,
  officeLocations,
  selfDetail,
  myHistory,
  todayContext,
}: UseAbsensiComputedStateParams) => {
  const nearestOffices = useMemo<GeofenceWithDistance[]>(() => {
    const offices = officeLocations ?? [];

    return offices
      .map((office) => {
        const officeCoordinates: [number, number] = [office.latitude, office.longitude];
        const distanceMeters = distanceInMeters(currentCoordinates, officeCoordinates);

        return {
          ...office,
          distanceMeters,
          distanceLabel: formatDistance(distanceMeters),
          isInside: distanceMeters <= office.radius,
        };
      })
      .sort((firstOffice, secondOffice) => firstOffice.distanceMeters - secondOffice.distanceMeters);
  }, [currentCoordinates, officeLocations]);

  const nearestOffice = nearestOffices[0] ?? null;
  const insideOffice = nearestOffices.find((office) => office.isInside) ?? null;
  const isInsideArea = !!insideOffice;

  const lineCoordinates: [number, number][] = nearestOffice
    ? [currentCoordinates, [nearestOffice.latitude, nearestOffice.longitude]]
    : [];

  const scheduleMasukLabel = useMemo(() => {
    const scheduleStart = getTodayScheduleStart(selfDetail?.workingSchedules?.days ?? []);
    if (scheduleStart) {
      return `${formatShiftStart24(scheduleStart)} WIB`;
    }

    const records = myHistory?.records ?? [];
    const todayRecord = records.find(
      (record) =>
        isSameLocalDay(record.expectedCheckInSnapshot) ||
        isSameLocalDay(record.checkIn) ||
        isSameLocalDay(record.createdAt),
    );

    if (todayRecord?.expectedCheckInSnapshot) {
      const expectedCheckIn = formatIsoToTime24(todayRecord.expectedCheckInSnapshot);
      if (expectedCheckIn) {
        return `${expectedCheckIn} WIB`;
      }
    }

    const latestRecordWithExpected = records.find((record) => !!record.expectedCheckInSnapshot);
    if (latestRecordWithExpected?.expectedCheckInSnapshot) {
      const expectedCheckIn = formatIsoToTime24(latestRecordWithExpected.expectedCheckInSnapshot);
      if (expectedCheckIn) {
        return `${expectedCheckIn} WIB`;
      }
    }

    return "08:00 WIB";
  }, [myHistory?.records, selfDetail?.workingSchedules?.days]);

  const hasShiftStarted = useMemo(() => {
    const shiftStartIso = todayContext?.shift?.shiftStart;
    if (!shiftStartIso) return false;

    const shiftStart = new Date(shiftStartIso);
    if (Number.isNaN(shiftStart.getTime())) return false;

    return now >= shiftStart;
  }, [now, todayContext?.shift?.shiftStart]);

  const isShiftEnded = useMemo(() => {
    const shiftEndIso = todayContext?.shift?.shiftEnd;
    if (!shiftEndIso) return false;

    const shiftEnd = new Date(shiftEndIso);
    if (Number.isNaN(shiftEnd.getTime())) return false;

    return now >= shiftEnd;
  }, [now, todayContext?.shift?.shiftEnd]);

  const attendanceInfoLabel = useMemo(() => {
    if (todayContext?.isHoliday) {
      return `Libur: ${todayContext.holidayName ?? "Hari ini libur"}`;
    }

    if (todayContext?.activeSubmission) {
      return `Pengajuan ${formatSubmissionTypeLabel(todayContext.activeSubmission.type)} (${todayContext.activeSubmission.status})`;
    }

    if (todayContext?.shift) {
      const isAlphaLocked =
        todayContext.attendance?.status === "ABSENT" ||
        (todayContext.action === "LOCKED" &&
          (todayContext.lockReason?.toLowerCase().includes("alpha") ?? false));

      if (isAlphaLocked || (isShiftEnded && !todayContext.attendance?.checkIn)) {
        return "Jam kerja telah selesai, Anda alpha";
      }

      const shouldShowCheckOut =
        hasShiftStarted ||
        (!!todayContext.attendance?.checkIn && !todayContext.attendance?.checkOut) ||
        todayContext.action === "CHECK_OUT";

      if (shouldShowCheckOut) {
        return `Jam Keluar: ${todayContext.shift.endTime} WIB`;
      }

      return `Jam Masuk: ${todayContext.shift.startTime} WIB`;
    }

    return `Jadwal Masuk: ${scheduleMasukLabel}`;
  }, [hasShiftStarted, isShiftEnded, scheduleMasukLabel, todayContext]);

  const preferredAction = useMemo(() => resolvePreferredAction(todayContext), [todayContext]);
  const isCheckOutMode = preferredAction.actionType === "CHECK_OUT";

  const attendanceButtonLabel = useMemo(() => {
    if (locationState !== "ready") return "AKTIFKAN LOKASI";
    if (preferredAction.actionType === "CHECK_OUT") return "ABSEN KELUAR";
    if (preferredAction.actionType === "CHECK_IN") return "ABSEN MASUK";
    return "ABSENSI TERKUNCI";
  }, [locationState, preferredAction.actionType]);

  const canProceedAttendance = !!preferredAction.actionType;
  const activeLockReason = preferredAction.lockReason;

  const isAttendanceButtonDisabled =
    locationState !== "ready" || !todayContext || !canProceedAttendance;

  return {
    nearestOffices,
    nearestOffice,
    isInsideArea,
    lineCoordinates,
    attendanceInfoLabel,
    preferredAction,
    isCheckOutMode,
    attendanceButtonLabel,
    activeLockReason,
    isAttendanceButtonDisabled,
  };
};

export default useAbsensiComputedState;
