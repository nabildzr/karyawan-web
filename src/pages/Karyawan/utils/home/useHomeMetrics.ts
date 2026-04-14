// * This file provides a React hook to fetch, derive, and expose employee home metrics.
import { useEffect, useMemo, useState } from "react";
import { attendancesService } from "../../../../services/attendances.service";
import { DEFAULT_METRICS } from "./constants";
import { buildSummaryCards, deriveMetrics } from "./metrics";
import type { HomeMetrics } from "./types";

export function useHomeMetrics() {
  // & Initialize metrics with safe defaults before asynchronous data is available.
  // % Inisialisasi metrik dengan default aman sebelum data async tersedia.
  const [metrics, setMetrics] = useState<HomeMetrics>(DEFAULT_METRICS);

  // & Track loading state to control placeholder rendering in UI cards.
  // % Melacak state loading untuk mengontrol placeholder pada kartu UI.
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // & Store user-facing error message when history fetch fails.
  // % Menyimpan pesan error untuk pengguna saat pengambilan riwayat gagal.
  const [metricsError, setMetricsError] = useState<string | null>(null);

  useEffect(() => {
    // & Use mounted flag to avoid setting state after component unmount.
    // % Menggunakan flag mounted untuk menghindari set state setelah komponen unmount.
    let mounted = true;

    const loadMetrics = async () => {
      // & Reset loading and error states before each fetch attempt.
      // % Mereset state loading dan error sebelum setiap percobaan fetch.
      setLoadingMetrics(true);
      setMetricsError(null);
      try {
        // & Request monthly attendance history used for summary metric derivation.
        // % Meminta riwayat absensi bulanan yang dipakai untuk turunan metrik ringkasan.
        const history = await attendancesService.getMyHistory({
          page: 1,
          limit: 120,
          period: "month",
          filter: "all",
        });

        // & Abort state update when component is no longer mounted.
        // % Membatalkan update state ketika komponen sudah tidak mounted.
        if (!mounted) return;

        // & Transform raw history data into normalized metrics payload.
        // % Mentransformasi data riwayat mentah menjadi payload metrik ternormalisasi.
        setMetrics(deriveMetrics(history));
      } catch (error: unknown) {
        // & Abort error state update when component is no longer mounted.
        // % Membatalkan update state error ketika komponen sudah tidak mounted.
        if (!mounted) return;

        // & Normalize unknown error shape into a user-friendly message.
        // % Menormalkan bentuk error yang tidak dikenal menjadi pesan ramah pengguna.
        setMetricsError(
          error instanceof Error
            ? error.message
            : "Gagal memuat ringkasan absensi.",
        );
      } finally {
        // & Stop loading only when the component is still active.
        // % Menghentikan loading hanya saat komponen masih aktif.
        if (mounted) setLoadingMetrics(false);
      }
    };

    // & Execute initial metrics fetch when hook consumer mounts.
    // % Menjalankan fetch metrik awal saat pemakai hook pertama kali mount.
    loadMetrics();

    // & Cleanup callback flips mounted flag to prevent late async updates.
    // % Callback cleanup membalik flag mounted untuk mencegah update async terlambat.
    return () => {
      mounted = false;
    };
  }, []);

  // & Memoize summary cards to avoid unnecessary recalculation on unrelated renders.
  // % Memoisasi kartu ringkasan untuk menghindari kalkulasi ulang pada render yang tidak terkait.
  const summaryCards = useMemo(
    () => buildSummaryCards(metrics, loadingMetrics),
    [loadingMetrics, metrics],
  );

  // & Expose all derived states needed by home page components.
  // % Mengekspos seluruh state turunan yang dibutuhkan komponen halaman beranda.
  return {
    metrics,
    loadingMetrics,
    metricsError,
    summaryCards,
  };
}
