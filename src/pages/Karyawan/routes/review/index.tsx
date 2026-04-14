// * This file defines route module logic for src/pages/Karyawan/routes/review/index.tsx.

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../../context/AuthContext";
import { assessmentsService } from "../../../../services/assessments.service";
import type { MyResultsResponse } from "../../../../types/assessments.types";
import { getPredikat } from "../../../../types/assessments.types";
import { formatDateTime, formatPeriod } from "../../utils/review/formatter";
import { getReviewCategories } from "../../utils/review/getReviewCategories";
import { handleDownloadPdf } from "../../utils/review/handleDownloadPdf";
import {
    buildMonthOptions,
    buildYearOptions,
    clampMonthForYear,
    getValidPeriodRange,
} from "../../utils/review/period";
import InfoEvaluasiSection from "./components/InfoEvaluasiSection";
import NilaiRataRataSection from "./components/NilaiRataRataSection";
import { RadarChart } from "./components/RadarChart";
import SelectReviewMonth from "./components/SelectReviewMonth";
import SelectReviewYear from "./components/SelectReviewYear";
import SkorPerKategoriSection from "./components/SkorPerKategoriSection";
import type { RadarPoint } from "./types/RadarTypes";

// & This function component/helper defines KaryawanReviewPage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanReviewPage untuk file route ini.
const KaryawanReviewPage = () => {
  // & Process the main execution steps of KaryawanReviewPage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanReviewPage di dalam body fungsi ini.
  const { user } = useAuthContext();
  // & This memo derives valid review period boundaries based on employee join date.
  // % Memo ini menurunkan batas periode review yang valid berdasarkan tanggal gabung karyawan.
  const periodRange = useMemo(
    () => getValidPeriodRange(user?.employees?.joinDate),
    [user?.employees?.joinDate],
  );

  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    () => new Date().getMonth() + 1,
  );

  // & This effect clamps selected year/month so they always stay inside the valid period range.
  // % Effect ini mengunci tahun/bulan terpilih agar selalu berada dalam rentang periode valid.
  useEffect(() => {
    const minYear = periodRange.start.getFullYear();
    const maxYear = periodRange.end.getFullYear();

    let nextYear = selectedYear;
    if (nextYear < minYear) nextYear = minYear;
    if (nextYear > maxYear) nextYear = maxYear;

    const nextMonth = clampMonthForYear(nextYear, selectedMonth, periodRange);

    if (nextYear !== selectedYear) {
      setSelectedYear(nextYear);
    }

    if (nextMonth !== selectedMonth) {
      setSelectedMonth(nextMonth);
    }
  }, [periodRange, selectedYear, selectedMonth]);

  // & This memo builds available year options from the current period range.
  // % Memo ini menyusun opsi tahun yang tersedia dari rentang periode saat ini.
  const yearOptions = useMemo(
    () => buildYearOptions(periodRange),
    [periodRange],
  );

  // & This memo builds month options for the selected year with range constraints.
  // % Memo ini menyusun opsi bulan untuk tahun terpilih dengan batas rentang periode.
  const monthOptions = useMemo(
    () => buildMonthOptions(selectedYear, periodRange),
    [selectedYear, periodRange],
  );

  // & This memo formats period key used for API request and UI labels.
  // % Memo ini memformat kunci periode yang dipakai untuk request API dan label UI.
  const period = useMemo(
    () => formatPeriod(selectedMonth, selectedYear),
    [selectedMonth, selectedYear],
  );

  // & This query fetches employee self-review data for the selected period.
  // % Query ini mengambil data review diri karyawan untuk periode yang dipilih.
  const query = useQuery<MyResultsResponse | null>({
    queryKey: ["assessments", "my-results", period],
    queryFn: () => assessmentsService.getMyResults(period),
    enabled: Boolean(user),
    retry: 1,
  });

  const review = query.data?.currentReview ?? null;
  // & This memo maps API review categories into normalized display categories.
  // % Memo ini memetakan kategori review dari API menjadi kategori tampilan yang ternormalisasi.
  const categories = useMemo(() => getReviewCategories(review), [review]);
  // & This memo transforms category scores into radar chart points.
  // % Memo ini mengubah skor kategori menjadi titik data radar chart.
  const radarData = useMemo<RadarPoint[]>(
    () =>
      categories.map((category) => ({
        label: category.label,
        value: category.score,
        max: category.maxScore,
      })),
    [categories],
  );

  const averageScore = review ? Number(review.averageScore ?? 0) : 0;
  const safeAverageScore = Number.isFinite(averageScore) ? averageScore : 0;
  const predikat = review?.predikat || getPredikat(safeAverageScore);

  const evaluatorName =
    review?.managerInfo?.name ||
    review?.evaluator?.employees?.fullName ||
    "Admin HR";

  const evaluatorPosition =
    review?.managerInfo?.position ||
    review?.evaluator?.employees?.position?.name ||
    "Manajemen";

  const statusLabel = review?.status || "Selesai";
  const periodLabel = review?.period || period;
  const completedLabel = formatDateTime(
    review?.completedAt || review?.assessmentDate,
  );
  const feedback = review?.generalNotes?.trim() || "";
  const hasReview = Boolean(review);

  const errorMessage =
    query.error instanceof Error
      ? query.error.message
      : "Gagal memuat data review.";

  // & This function component/helper defines handleYearChange behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku handleYearChange untuk file route ini.
  const handleYearChange = (nextYearRaw: string) => {
    // & Process the main execution steps of handleYearChange inside this function body.
    // % Memproses langkah eksekusi utama handleYearChange di dalam body fungsi ini.
    const nextYear = Number(nextYearRaw);
    if (!Number.isFinite(nextYear)) return;

    setSelectedYear(nextYear);
    setSelectedMonth((prevMonth) =>
      clampMonthForYear(nextYear, prevMonth, periodRange),
    );
  };

  // & This function component/helper defines handleMonthChange behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku handleMonthChange untuk file route ini.
  const handleMonthChange = (nextMonthRaw: string) => {
    // & Process the main execution steps of handleMonthChange inside this function body.
    // % Memproses langkah eksekusi utama handleMonthChange di dalam body fungsi ini.
    const nextMonth = Number(nextMonthRaw);
    if (!Number.isFinite(nextMonth)) return;
    setSelectedMonth(nextMonth);
  };

  return (
    <div className="min-h-full bg-gray-50 p-3">
      <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-gray-800">
              Hasil Review Saya
            </h1>
            <p className="text-xs text-gray-500">
              Pilih periode untuk melihat hasil evaluasi terbaru.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleDownloadPdf({
                review,
                categories,
                evaluatorName,
                evaluatorPosition,
                completedLabel,
                periodLabel,
                safeAverageScore,
                predikat,
                feedback,
              })
            }
            disabled={!hasReview || query.isLoading}
            className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Download PDF
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectReviewYear
            selectedYear={selectedYear}
            handleYearChange={handleYearChange}
            yearOptions={yearOptions}
          />

          <SelectReviewMonth
            selectedMonth={selectedMonth}
            handleMonthChange={handleMonthChange}
            monthOptions={monthOptions}
          />
        </div>

        {query.isFetching && !query.isLoading && (
          <p className="mt-3 text-xs font-medium text-gray-500">
            Memuat data periode {period}...
          </p>
        )}
      </section>

      {query.isLoading && (
        <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        </section>
      )}

      {query.isError && (
        <section className="mb-4 rounded-2xl border border-error-200 bg-error-50 p-4 shadow-theme-xs">
          <p className="text-sm font-semibold text-error-700">
            Gagal memuat review
          </p>
          <p className="mt-1 text-xs text-error-700">{errorMessage}</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-3 rounded-lg bg-error-600 px-3 py-2 text-xs font-semibold text-white hover:bg-error-700"
          >
            Coba Lagi
          </button>
        </section>
      )}

      {!query.isLoading && !query.isError && !hasReview && (
        <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
          <h2 className="text-sm font-semibold text-gray-800">
            Belum Ada Review
          </h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Belum ada data review pada periode {period}. Pilih bulan atau tahun
            lain untuk mengecek periode sebelumnya.
          </p>
        </section>
      )}

      {!query.isLoading && !query.isError && hasReview && (
        <>
          <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
            <h2 className="text-sm font-semibold text-gray-800">
              Radar Penilaian
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Visual distribusi skor dari seluruh kategori.
            </p>
            <div className="mt-4">
              <RadarChart data={radarData} />
            </div>
          </section>

          <NilaiRataRataSection
            averageScore={safeAverageScore}
            predikat={predikat}
          />

          <SkorPerKategoriSection categories={categories} />

          <InfoEvaluasiSection
            evaluatorName={evaluatorName}
            evaluatorPosition={evaluatorPosition}
            statusLabel={statusLabel}
            completedLabel={completedLabel}
            periodLabel={periodLabel}
          />

          <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
            <h2 className="text-sm font-semibold text-gray-800">Umpan Balik</h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {feedback || "Belum ada umpan balik tertulis dari evaluator."}
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default KaryawanReviewPage;
