// * This file defines route module logic for src/pages/Karyawan/routes/home/index.tsx.

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../../../context/AuthContext";
import { attendancesService } from "../../../../services/attendances.service";
import { formatSubmissionTypeLabel, formatUnlockTimeLabel } from "../../utils/home/formatter";
import { useHomeMetrics } from "../../utils/home/useHomeMetrics";
import HomeActionSection from "./components/HomeActionSection";
import HomeHeaderSection from "./components/HomeHeaderSection";
import HomeMenuSection from "./components/HomeMenuSection";
import HomeSummaryCardsSection from "./components/HomeSummaryCardsSection";

// & This function component/helper defines KaryawanHomePage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanHomePage untuk file route ini.
const KaryawanHomePage = () => {
  // & Process the main execution steps of KaryawanHomePage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanHomePage di dalam body fungsi ini.
  const navigate = useNavigate();
  const { metricsError, summaryCards } = useHomeMetrics();
  const { user, canAccessAdminPortal } = useAuthContext();

  // & This query loads live attendance context so dashboard actions can reflect current shift state.
  // % Query ini memuat konteks absensi terkini agar aksi dashboard mengikuti status shift saat ini.
  const { data: todayContext } = useQuery({
    queryKey: ["attendances", "today-context", "home"],
    queryFn: () => attendancesService.getTodayContext("Asia/Jakarta"),
    enabled: !!user,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });

  // & This memo formats Jakarta date text shown on the home header.
  // % Memo ini memformat teks tanggal Jakarta yang ditampilkan di header home.
  const todayDisplay = useMemo(
    () =>
      new Date(todayContext?.now ?? Date.now()).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }),
    [todayContext?.now],
  );

  // & This memo derives shift time range for header summary.
  // % Memo ini menurunkan rentang jam shift untuk ringkasan header.
  const shiftDisplay = useMemo(() => {
    if (todayContext?.shift) {
      return `${todayContext.shift.startTime} - ${todayContext.shift.endTime}`;
    }

    return "Tidak ada shift";
  }, [todayContext?.shift]);

  // & This memo resolves readable shift status based on holiday, submission, and runtime shift state.
  // % Memo ini menentukan status shift yang mudah dibaca berdasarkan libur, pengajuan, dan status shift runtime.
  const shiftStatus = useMemo(() => {
    if (todayContext?.isHoliday) {
      return todayContext.holidayName
        ? `Libur: ${todayContext.holidayName}`
        : "Libur Nasional";
    }

    if (todayContext?.activeSubmission) {
      return `${formatSubmissionTypeLabel(todayContext.activeSubmission.type)} (${todayContext.activeSubmission.status})`;
    }

    if (todayContext?.shiftState === "COMPLETED") {
      return "Completed";
    }

    if (todayContext?.shiftState === "ONGOING") {
      return `Sedang berjalan ${todayContext.shiftProgressPercent}%`;
    }

    if (todayContext?.shiftState === "NOT_STARTED") {
      return "Belum mulai";
    }

    if (todayContext?.shiftState === "OFF") {
      return "Tidak ada shift";
    }

    return "Memuat status shift...";
  }, [todayContext]);

  // & This memo normalizes progress value for special non-working states.
  // % Memo ini menormalkan nilai progres untuk kondisi khusus non-shift.
  const shiftProgressPercent = useMemo(() => {
    if (!todayContext) return 0;

    if (todayContext.shiftState === "HOLIDAY" || todayContext.shiftState === "SUBMISSION") {
      return 100;
    }

    return todayContext.shiftProgressPercent;
  }, [todayContext]);

  const checkInButtonDisabled = !todayContext?.canCheckIn;
  const checkOutButtonDisabled = !todayContext?.canCheckOut;

  // & This memo computes helper text that explains why check-in is available or locked.
  // % Memo ini menghitung teks bantuan yang menjelaskan alasan check-in tersedia atau terkunci.
  const checkInHint = useMemo(() => {
    if (todayContext?.canCheckIn) {
      return "Siap absen masuk";
    }

    return todayContext?.checkInLockReason ?? "Check-in tidak tersedia";
  }, [todayContext?.canCheckIn, todayContext?.checkInLockReason]);

  // & This memo computes checkout hint including unlock timing for late-shift checkout window.
  // % Memo ini menghitung petunjuk checkout termasuk waktu buka pada jendela checkout akhir shift.
  const checkOutHint = useMemo(() => {
    if (todayContext?.canCheckOut) {
      return "Siap absen keluar";
    }

    const unlockTimeLabel = formatUnlockTimeLabel(todayContext?.checkOutUnlockAt);
    if (unlockTimeLabel && todayContext?.attendance?.checkIn && !todayContext?.attendance?.checkOut) {
      return `Buka mulai ${unlockTimeLabel} WIB (5% akhir shift)`;
    }

    return todayContext?.checkOutLockReason ?? "Check-out belum tersedia";
  }, [
    todayContext?.attendance?.checkIn,
    todayContext?.attendance?.checkOut,
    todayContext?.canCheckOut,
    todayContext?.checkOutLockReason,
    todayContext?.checkOutUnlockAt,
  ]);

  // & This function component/helper defines handlePortalChange behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku handlePortalChange untuk file route ini.
  const handlePortalChange = (nextPortal: string) => {
    // & Process the main execution steps of handlePortalChange inside this function body.
    // % Memproses langkah eksekusi utama handlePortalChange di dalam body fungsi ini.
    if (nextPortal === "admin") {
      if (!canAccessAdminPortal) return;
      navigate("/admin");
      return;
    }

    navigate("/karyawan");
  };

  // & This function component/helper defines handleMenuClick behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku handleMenuClick untuk file route ini.
  const handleMenuClick = (title: string) => {
    // & Process the main execution steps of handleMenuClick inside this function body.
    // % Memproses langkah eksekusi utama handleMenuClick di dalam body fungsi ini.
    if (title === "Pengajuan") {
      navigate("/karyawan/pengajuan");
      return;
    }

    if (title === "Riwayat Absensi") {
      navigate("/karyawan/jadwal");
      return;
    }

    if (title === "Review Saya") {
      navigate("/karyawan/review");
      return;
    }

    if (title === "Pengaturan") {
      navigate("/karyawan/akun");
      return;
    }
  };

  return (
    <div className="min-h-full bg-gray-50 p-3">
      {metricsError && (
        <div className="mb-3 rounded-xl border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700">
          {metricsError}
        </div>
      )}

      <HomeHeaderSection
        todayDisplay={todayDisplay}
        shiftDisplay={shiftDisplay}
        shiftProgressPercent={shiftProgressPercent}
        shiftStatus={shiftStatus}
        fullName={user?.employees?.fullName}
        nip={user?.nip}
        canAccessAdminPortal={canAccessAdminPortal}
        onPortalChange={handlePortalChange}
      />

      <HomeActionSection
        checkInButtonDisabled={checkInButtonDisabled}
        checkOutButtonDisabled={checkOutButtonDisabled}
        checkInHint={checkInHint}
        checkOutHint={checkOutHint}
        onOpenAttendance={() => navigate("/karyawan/absensi")}
      />

      <HomeSummaryCardsSection summaryCards={summaryCards} />

      <HomeMenuSection onMenuClick={handleMenuClick} />
    </div>
  );
};

export default KaryawanHomePage;
