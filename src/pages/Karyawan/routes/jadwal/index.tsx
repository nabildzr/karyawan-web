// * This file defines route module logic for src/pages/Karyawan/routes/jadwal/index.tsx.

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { workingSchedulesService } from "../../../../services/workingSchedules.service";
import {
  buildMonthOptions,
  getMonthBounds,
  toMonthValue,
} from "../../utils/jadwal/formatter";
import { mapSummaryToWeeks } from "../../utils/jadwal/mapper";
import HeaderSection from "./components/HeaderSection";
import ScheduleList from "./components/ScheduleList";
import WeekSelector from "./components/WeekSelector";

export { default as HeaderSection } from "./components/HeaderSection";

// & This function component/helper defines KaryawanJadwalPage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanJadwalPage untuk file route ini.
const KaryawanJadwalPage = () => {
  // & Process the main execution steps of KaryawanJadwalPage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanJadwalPage di dalam body fungsi ini.
  // & Initialize month selector with current month in YYYY-MM format.
  // % Inisialisasi pemilih bulan dengan bulan saat ini dalam format YYYY-MM.
  const [selectedMonth, setSelectedMonth] = useState<string>(() => toMonthValue(new Date()));
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [hasSyncedWithServerDate, setHasSyncedWithServerDate] = useState<boolean>(false);

  // & This memo derives API date bounds for the selected month.
  // % Memo ini menurunkan batas tanggal API berdasarkan bulan terpilih.
  const monthBounds = useMemo(() => getMonthBounds(selectedMonth), [selectedMonth]);

  // & This query fetches monthly schedule summary for the selected month and timezone.
  // % Query ini mengambil ringkasan jadwal bulanan untuk bulan dan zona waktu terpilih.
  const {
    data: mobileSummary,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["karyawan-jadwal", "mobile-summary", selectedMonth],
    queryFn: () =>
      workingSchedulesService.getMobileSummary({
        ...monthBounds,
        timezone: "Asia/Jakarta",
      }),
    enabled: Boolean(selectedMonth),
    staleTime: 30 * 1000,
    retry: 1,
  });

  // & This memo builds available month options using join date and current server date.
  // % Memo ini menyusun opsi bulan berdasarkan tanggal gabung dan tanggal server saat ini.
  const monthOptions = useMemo(() => {
    return buildMonthOptions(
      mobileSummary?.joinDate,
      mobileSummary?.serverDate,
      selectedMonth,
      3,
    );
  }, [mobileSummary?.joinDate, mobileSummary?.serverDate, selectedMonth]);

  // & This memo groups daily summaries into week buckets for UI rendering.
  // % Memo ini mengelompokkan ringkasan harian menjadi bucket mingguan untuk tampilan UI.
  const weeksByMonth = useMemo(
    () => mapSummaryToWeeks(mobileSummary?.weeklySummary ?? []),
    [mobileSummary?.weeklySummary],
  );

  // & This effect ensures selected month always exists in latest month options.
  // % Effect ini memastikan bulan terpilih selalu ada di opsi bulan terbaru.
  useEffect(() => {
    if (monthOptions.length === 0) {
      return;
    }

    // & Validate whether currently selected month still exists in refreshed option list.
    // % Validasi apakah bulan terpilih saat ini masih ada di daftar opsi yang diperbarui.
    const hasSelectedMonth = monthOptions.some((month) => month.value === selectedMonth);
    if (!hasSelectedMonth) {
      setSelectedMonth(monthOptions[0]?.value ?? selectedMonth);
      setHasSyncedWithServerDate(false);
    }
  }, [monthOptions, selectedMonth]);

  // & This effect aligns selected month/week with serverDate and joinDate constraints once.
  // % Effect ini menyelaraskan bulan/minggu terpilih dengan batas serverDate dan joinDate sekali sinkron.
  useEffect(() => {
    const serverDate = mobileSummary?.serverDate;
    const joinDate = mobileSummary?.joinDate;

    if (!serverDate || !joinDate) {
      return;
    }

    const joinMonth = joinDate.slice(0, 7);
    const serverMonth = serverDate.slice(0, 7);
    const targetMonth = serverMonth < joinMonth ? joinMonth : serverMonth;

    if (selectedMonth < joinMonth) {
      setSelectedMonth(joinMonth);
      return;
    }

    if (hasSyncedWithServerDate) {
      return;
    }

    if (selectedMonth !== targetMonth) {
      setSelectedMonth(targetMonth);
      return;
    }

    // & Find week bucket that contains server date so week selector jumps to current week.
    // % Cari bucket minggu yang memuat tanggal server agar selector minggu lompat ke minggu berjalan.
    const activeWeekByServerDate = weeksByMonth.find((week) =>
      week.items.some((item) => item.id === serverDate),
    );

    if (!activeWeekByServerDate) {
      setSelectedWeek(1);
      setHasSyncedWithServerDate(true);
      return;
    }

    setSelectedWeek(activeWeekByServerDate.weekNumber);
    setHasSyncedWithServerDate(true);
  }, [
    hasSyncedWithServerDate,
    mobileSummary?.serverDate,
    mobileSummary?.joinDate,
    selectedMonth,
    weeksByMonth,
  ]);

  // & This effect keeps selected week valid whenever the available week list changes.
  // % Effect ini menjaga minggu terpilih tetap valid saat daftar minggu berubah.
  useEffect(() => {
    if (weeksByMonth.length === 0) {
      setSelectedWeek(1);
      return;
    }

    // & Ensure the selected week still exists after summary data changes.
    // % Pastikan minggu terpilih masih ada setelah data ringkasan berubah.
    const hasSelectedWeek = weeksByMonth.some((week) => week.weekNumber === selectedWeek);

    if (!hasSelectedWeek) {
      setSelectedWeek(weeksByMonth[0]?.weekNumber ?? 1);
    }
  }, [selectedWeek, weeksByMonth]);

  // & This memo resolves active week data used by the schedule list section.
  // % Memo ini menentukan data minggu aktif yang dipakai pada section daftar jadwal.
  const activeWeekData = useMemo(() => {
    return weeksByMonth.find((week) => week.weekNumber === selectedWeek) ?? null;
  }, [selectedWeek, weeksByMonth]);

  const selectedMonthLabel =
    monthOptions.find((option) => option.value === selectedMonth)?.label ?? "Bulan terpilih";

  const errorMessage = error instanceof Error ? error.message : "Gagal memuat jadwal kerja.";
  const isBusy = isLoading || isFetching;

  return (
    <div className="min-h-full px-4 pb-28 pt-6">
      <HeaderSection
        title="Jadwal & Shift"
        description={`Kelola dan pantau jadwal kerja mingguan Anda untuk ${selectedMonthLabel}`}
      />

      <WeekSelector
        selectedMonth={selectedMonth}
        monthOptions={monthOptions}
        selectedWeek={selectedWeek}
        weeks={weeksByMonth}
        disabled={isBusy}
        onMonthChange={setSelectedMonth}
        onWeekChange={setSelectedWeek}
      />

      {isBusy && (
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-theme-xs">
          Memuat jadwal kerja...
        </section>
      )}

      {isError && !isBusy && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-theme-xs">
          <p className="text-sm font-semibold text-red-800">Terjadi kendala saat memuat jadwal</p>
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Coba lagi
          </button>
        </section>
      )}

      {!isBusy && !isError && weeksByMonth.length === 0 && (
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-theme-xs">
          Jadwal kerja belum tersedia untuk bulan ini.
        </section>
      )}

      {!isBusy && !isError && activeWeekData && (
        <ScheduleList title="Daftar Jadwal Mingguan" weekData={activeWeekData} />
      )}
    </div>
  );
};

export default KaryawanJadwalPage;
