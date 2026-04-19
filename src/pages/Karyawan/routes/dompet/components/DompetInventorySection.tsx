// * This file defines route module logic for src/pages/Karyawan/routes/dompet/components/DompetInventorySection.tsx.

import { Package, Zap } from "lucide-react";
import { Link } from "react-router";
import type { UserToken } from "../../../../../types/integrity.types";
import { formatLedgerDate } from "../../../utils/dompet/formatter";
import DompetPagination from "./DompetPagination";

interface DompetInventorySectionProps {
  loading: boolean;
  tokens: UserToken[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// & This function component/helper defines DompetInventorySection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku DompetInventorySection untuk file route ini.
const DompetInventorySection = ({
  loading,
  tokens,
  page,
  totalPages,
  onPageChange,
}: DompetInventorySectionProps) => {
  // & Process the main execution steps of DompetInventorySection inside this function body.
  // % Memproses langkah eksekusi utama DompetInventorySection di dalam body fungsi ini.
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Token Kelonggaran Anda
      </h3>

      {loading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
        ))
      ) : tokens.length > 0 ? (
        <>
          {tokens.map((token) => (
            <article
              key={token.id}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  token.status === "AVAILABLE"
                    ? "bg-success-50 dark:bg-success-500/10"
                    : token.status === "USED"
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "bg-error-50 dark:bg-error-500/10"
                }`}
              >
                <Zap
                  className={`h-6 w-6 ${
                    token.status === "AVAILABLE"
                      ? "text-success-500"
                      : token.status === "USED"
                        ? "text-gray-400"
                        : "text-error-500"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {token.item?.itemName ?? "Token"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Diperoleh: {formatLedgerDate(token.createdAt)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Kedaluwarsa: {formatLedgerDate(token.expiresAt)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sisa hari: {token.status === "AVAILABLE" ? (token.remainingDays ?? 0) : 0}
                </p>
                {token.usedAtAttendanceId && (
                  <Link
                    to={`/karyawan/absensi/detail/${token.usedAtAttendanceId}`}
                    className="inline-flex items-center text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Lihat Detail Absensi
                  </Link>
                )}
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  token.status === "AVAILABLE"
                    ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                    : token.status === "USED"
                      ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                }`}
              >
                {token.status === "AVAILABLE"
                  ? "Tersedia"
                  : token.status === "USED"
                    ? "Digunakan"
                    : "Expired"}
              </span>
            </article>
          ))}

          <DompetPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Package className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Belum ada token di inventory Anda
          </p>
        </div>
      )}
    </section>
  );
};

export default DompetInventorySection;
