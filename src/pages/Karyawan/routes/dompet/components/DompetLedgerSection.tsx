// * This file defines route module logic for src/pages/Karyawan/routes/dompet/components/DompetLedgerSection.tsx.

import { History, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import type { PointLedgerEntry } from "../../../../../types/integrity.types";
import { formatLedgerDateTime } from "../../../utils/dompet/formatter";
import DompetPagination from "./DompetPagination";

interface DompetLedgerSectionProps {
  loading: boolean;
  entries: PointLedgerEntry[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

const parseAttendanceId = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const [candidate] = value.split(":");
  if (candidate && UUID_REGEX.test(candidate)) {
    return candidate;
  }

  const matched = value.match(UUID_REGEX);
  return matched?.[0] ?? null;
};

const resolveAttendanceDetailId = (entry: PointLedgerEntry): string | null => {
  const fromReference = parseAttendanceId(entry.referenceId);
  if (fromReference) return fromReference;

  return parseAttendanceId(entry.description);
};

// & This function component/helper defines DompetLedgerSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku DompetLedgerSection untuk file route ini.
const DompetLedgerSection = ({
  loading,
  entries,
  page,
  totalPages,
  onPageChange,
}: DompetLedgerSectionProps) => {
  // & Process the main execution steps of DompetLedgerSection inside this function body.
  // % Memproses langkah eksekusi utama DompetLedgerSection di dalam body fungsi ini.
  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Riwayat Transaksi Poin
        </h3>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))
        ) : entries.length > 0 ? (
          entries.map((entry) => {
            const isNeutralMutation = entry.amount === 0;
            const isTokenUsageMutation =
              entry.referenceEntity === "ATTENDANCE_TOKEN_OVERRIDE";
            const isAttendanceRelatedMutation =
              entry.referenceEntity === "ATTENDANCE_TOKEN_OVERRIDE" ||
              entry.referenceEntity === "ATTENDANCE_RULE";
            const attendanceDetailId = isAttendanceRelatedMutation
              ? resolveAttendanceDetailId(entry)
              : null;

            const iconContainerClass = isNeutralMutation
              ? "bg-gray-100 dark:bg-gray-700/60"
              : entry.amount > 0
                ? "bg-success-50 dark:bg-success-500/10"
                : "bg-error-50 dark:bg-error-500/10";

            const amountClass = isNeutralMutation
              ? "text-gray-500 dark:text-gray-300"
              : entry.amount > 0
                ? "text-success-600 dark:text-success-400"
                : "text-error-600 dark:text-error-400";

            const displayTitle = isTokenUsageMutation
              ? entry.description ?? "Token telah digunakan"
              : entry.description ?? "Transaksi Poin";

            const displayAmount = isNeutralMutation
              ? "0"
              : `${entry.amount > 0 ? "+" : ""}${entry.amount?.toLocaleString("id-ID")}`;

            return (
              <article
                key={entry.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${iconContainerClass}`}
                >
                  {isNeutralMutation ? (
                    <History className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                  ) : entry.amount > 0 ? (
                    <TrendingUp className="h-5 w-5 text-success-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-error-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {displayTitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatLedgerDateTime(entry.createdAt)}
                  </p>
                  {attendanceDetailId && (
                    <Link
                      to={`/karyawan/absensi/detail/${attendanceDetailId}`}
                      className="mt-1 inline-flex items-center text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      Lihat Detail Absensi
                    </Link>
                  )}
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${amountClass}`}>
                    {displayAmount}
                  </p>
                  <p className="text-xs text-gray-400">
                    Saldo: {entry.currentBalance?.toLocaleString("id-ID")}
                  </p>
                </div>
              </article>
            );
          })
        ) : (
          <div className="px-6 py-12 text-center">
            <History className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Belum ada riwayat transaksi
            </p>
          </div>
        )}
      </div>

      {!loading && (
        <DompetPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
};

export default DompetLedgerSection;
