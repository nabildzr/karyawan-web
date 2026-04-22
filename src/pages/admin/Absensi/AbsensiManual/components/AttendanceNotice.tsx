// * Notice block for admin AbsensiManual page.
// & This component explains the manual attendance time window and audit behavior.
// % Komponen ini menjelaskan batas waktu input manual dan perilaku audit log.

import { MAX_PAST_DAYS } from "../constants";

export default function AttendanceNotice() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 dark:border-blue-500/20 dark:bg-blue-500/10">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Important Notice
          </p>
          <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400/80">
            Input absensi manual hanya diperbolehkan untuk <strong>maksimal {MAX_PAST_DAYS} hari</strong> ke belakang dari hari ini. Semua record tercatat di Audit Log: <code className="rounded bg-blue-100 px-1 py-0.5 font-mono dark:bg-blue-500/20">CREATE_ATTENDANCE_MANUAL</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
