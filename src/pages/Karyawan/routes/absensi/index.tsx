// * This file defines route module logic for src/pages/Karyawan/routes/absensi/index.tsx.

import { ArrowLeft, Fingerprint } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthContext } from "../../../../context/AuthContext";
import { resetAttendanceFlowResult } from "../attendanceFlow/flowStore";
import AbsensiClockSection from "./components/AbsensiClockSection";
import AbsensiMapSection from "./components/AbsensiMapSection";
import AbsensiUserHeader from "./components/AbsensiUserHeader";
import LocationRequiredModal from "./components/LocationRequiredModal";
import NearestOfficeSection from "./components/NearestOfficeSection";
import useAbsensiClock from "./hooks/useAbsensiClock";
import useAbsensiComputedState from "./hooks/useAbsensiComputedState";
import useAbsensiLocation from "./hooks/useAbsensiLocation";
import useAbsensiQueries from "./hooks/useAbsensiQueries";
import useCurrentLocation from "./hooks/useCurrentLocation";

// & This function component/helper defines KaryawanAbsensiPage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanAbsensiPage untuk file route ini.
const KaryawanAbsensiPage = () => {
  // & Process the main execution steps of KaryawanAbsensiPage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanAbsensiPage di dalam body fungsi ini.
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const { now, currentDateLabel, currentTimeLabel } = useAbsensiClock();
  const {
    locationState,
    locationError,
    recenterTrigger,
    currentCoordinates,
    requestLocation,
  } = useAbsensiLocation();

  // & This callback navigates back safely using history index fallback to karyawan root.
  // % Callback ini menavigasi kembali dengan aman memakai fallback ke root karyawan jika history tidak tersedia.
  const handleBack = useCallback(() => {
    const historyState = window.history.state as { idx?: number } | null;

    if (typeof historyState?.idx === "number" && historyState.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/karyawan");
  }, [navigate]);

  // & This effect triggers initial location fetch when page mounts.
  // % Effect ini memicu pengambilan lokasi awal saat halaman pertama kali dimuat.
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const { selfDetail, myHistory, todayContext, officeLocations, geocodedLocationLabel } =
    useAbsensiQueries({
      employeeId: user?.employees?.id,
      hasUser: !!user,
      locationState,
      currentCoordinates,
    });

  const {
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
  } = useAbsensiComputedState({
    now,
    locationState,
    currentCoordinates,
    officeLocations,
    selfDetail,
    myHistory,
    todayContext,
  });

  // & This callback validates attendance prerequisites and routes user into capture flow.
  // % Callback ini memvalidasi prasyarat absensi lalu mengarahkan user ke alur capture.
  const handleProceedAttendance = useCallback(() => {
    if (locationState !== "ready") {
      requestLocation();
      return;
    }

    if (!todayContext || !preferredAction.actionType) {
      toast.error(activeLockReason ?? "Absensi belum bisa diproses saat ini.");
      return;
    }

    resetAttendanceFlowResult();
    navigate("/karyawan/absensi/capture");
  }, [
    activeLockReason,
    locationState,
    navigate,
    preferredAction.actionType,
    requestLocation,
    todayContext,
  ]);

  const { currentLocationLabel } = useCurrentLocation({
    currentCoordinates,
    geocodedLocationLabel,
  });

  return (
    <div className="min-h-full bg-gray-50 px-4 pb-28 pt-6 text-gray-900">
      <button
        type="button"
        onClick={handleBack}
        className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <AbsensiUserHeader
        fullName={user?.employees?.fullName}
        role={user?.role}
        nip={user?.nip}
        isCheckOutMode={isCheckOutMode}
      />

      <AbsensiClockSection
        currentDateLabel={currentDateLabel}
        currentTimeLabel={currentTimeLabel}
        attendanceInfoLabel={attendanceInfoLabel}
      />

      {!isCheckOutMode && todayContext?.attendance?.checkIn && !todayContext?.attendance?.checkOut && (
        <section className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-xs text-brand-700 shadow-theme-xs">
          Jam masuk sudah terkunci karena Anda sudah check-in. Lanjutkan absensi untuk check-out saat jam pulang.
        </section>
      )}

      {isCheckOutMode && !todayContext?.attendance?.checkIn && (
        <section className="mb-4 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs text-warning-800 shadow-theme-xs">
          Anda belum check-in hari ini. Check-out hanya dapat dilakukan setelah check-in.
        </section>
      )}

      {activeLockReason && (
        <section className="mb-4 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs text-warning-800 shadow-theme-xs">
          {activeLockReason}
        </section>
      )}

      <AbsensiMapSection
        currentCoordinates={currentCoordinates}
        recenterTrigger={recenterTrigger}
        nearestOffices={nearestOffices}
        nearestOffice={nearestOffice}
        lineCoordinates={lineCoordinates}
        currentLocationLabel={currentLocationLabel}
        isInsideArea={isInsideArea}
        onCompassClick={requestLocation}
      />

      <NearestOfficeSection nearestOffices={nearestOffices} />

      <button
        type="button"
        onClick={handleProceedAttendance}
        disabled={isAttendanceButtonDisabled}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-blue-500 px-5 py-4 text-lg font-extrabold uppercase tracking-[0.04em] text-white shadow-theme-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        <Fingerprint className="h-6 w-6" />
        {attendanceButtonLabel}
      </button>

      <LocationRequiredModal
        locationState={locationState}
        locationError={locationError}
        onRetryLocation={requestLocation}
        onBack={handleBack}
      />
    </div>
  );
};

export default KaryawanAbsensiPage;
