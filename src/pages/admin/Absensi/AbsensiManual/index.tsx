// * Frontend module: admin/Absensi/AbsensiManual page.
// & This file orchestrates the manual attendance form while delegating UI pieces to local components.
// % File ini mengorkestrasi form absensi manual sambil memecah UI ke komponen lokal.

import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import DatePicker from "../../../../components/form/date-picker";
import { useAttendances } from "../../../../hooks/useAttendances";
import { karyawanService } from "../../../../services/karyawan.service";
import type { AttendanceStatus } from "../../../../types/attendances.types";
import type {
    Employee,
    EmployeeDetail2,
    WorkingScheduleDay,
} from "../../../../types/karyawan.types";
import AttendanceNotice from "./components/AttendanceNotice";
import EmployeeSearch from "./components/EmployeeSearch";
import ScheduleField from "./components/ScheduleField";
import {
    DAYS_EN,
    DAYS_ID,
    MAX_PAST_DAYS,
    TODAY_DATE,
    inputCls,
    selectCls,
} from "./constants";
import {
    buildIso,
    daysDiff,
    fmtDateTime,
    getLocalDayIndex,
    isWithinGrace,
    toCanonicalDay,
    toDateStr,
} from "./utils";

export default function AbsensiManual() {
  const { createManual } = useAttendances();

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empDetail, setEmpDetail] = useState<EmployeeDetail2 | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [attendanceDate, setAttendanceDate] = useState<string>(
    toDateStr(TODAY_DATE),
  );
  const [dateKey, setDateKey] = useState(0);

  const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDayIndex = attendanceDate ? getLocalDayIndex(attendanceDate) : 0;
  const selectedDayLabel = DAYS_ID[selectedDayIndex];
  const selectedDayCanonical = toCanonicalDay(DAYS_EN[selectedDayIndex]);

  const scheduleDay: WorkingScheduleDay | null = (() => {
    if (!empDetail?.workingSchedules?.days || !attendanceDate) return null;

    return (
      empDetail.workingSchedules.days.find(
        (day) => toCanonicalDay(day.dayOfWeek) === selectedDayCanonical,
      ) ?? null
    );
  })();

  const isWorkDay = !!scheduleDay?.isActive;
  const isOffDay = !!(scheduleDay && !scheduleDay.isActive);
  const hasNoSchedule = !!empDetail && !empDetail.workingSchedules;

  const shiftName = scheduleDay?.shift?.name ?? "";
  const expectedCheckIn =
    scheduleDay?.shift && attendanceDate
      ? buildIso(attendanceDate, scheduleDay.shift.startTime)
      : "";
  const expectedCheckOut = (() => {
    if (!scheduleDay?.shift || !attendanceDate) return "";

    const date = new Date(attendanceDate);
    if (scheduleDay.shift.isCrossDay) {
      date.setDate(date.getDate() + 1);
    }

    return buildIso(toDateStr(date), scheduleDay.shift.endTime);
  })();

  const diff = attendanceDate ? daysDiff(attendanceDate) : 0;
  const withinGrace = isWithinGrace(attendanceDate);
  const dateInvalid = !withinGrace && !!attendanceDate;
  const dateInFuture = diff < 0;

  useEffect(() => {
    if (!selectedEmp) {
      setEmpDetail(null);
      return;
    }

    setDetailLoading(true);
    karyawanService
      .getById(selectedEmp.id)
      .then(setEmpDetail)
      .catch(() => toast.error("Gagal memuat jadwal kerja karyawan."))
      .finally(() => setDetailLoading(false));
  }, [selectedEmp]);

  const handleReset = () => {
    setSelectedEmp(null);
    setEmpDetail(null);
    setAttendanceDate(toDateStr(TODAY_DATE));
    setStatus("PRESENT");
    setReason("");
    setNote("");
    setError(null);
    setDateKey((value) => value + 1);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedEmp) {
      setError("Pilih karyawan terlebih dahulu.");
      return;
    }
    if (!attendanceDate) {
      setError("Pilih tanggal absensi.");
      return;
    }
    if (dateInvalid) {
      setError(`Batas waktu input absensi manual adalah ${MAX_PAST_DAYS} hari ke belakang.`);
      return;
    }
    if (dateInFuture) {
      setError("Tanggal tidak boleh di masa depan.");
      return;
    }
    if (!shiftName && !hasNoSchedule) {
      setError("Tidak ada jadwal aktif di tanggal yang dipilih.");
      return;
    }
    if (!reason) {
      setError("Pilih alasan manual entry.");
      return;
    }
    if (!note.trim()) {
      setError("Catatan HRD wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const resolvedExpectedCheckIn =
        expectedCheckIn || new Date(`${attendanceDate}T08:00:00`).toISOString();
      const resolvedExpectedCheckOut =
        expectedCheckOut || new Date(`${attendanceDate}T17:00:00`).toISOString();

      await createManual({
        employeeId: selectedEmp.id,
        shiftName: shiftName || "Manual",
        expectedCheckIn: resolvedExpectedCheckIn,
        expectedCheckOut: resolvedExpectedCheckOut,
        checkIn: resolvedExpectedCheckIn,
        checkOut: resolvedExpectedCheckOut,
        status,
        note,
        reason,
      });
      toast.success(`Absensi manual ${selectedEmp.fullName} berhasil disimpan.`);
      handleReset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Absensi Manual" description="Record absensi manual untuk karyawan" />
      <PageBreadcrumb pageTitle="Absensi Manual" />

      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Record Manual Attendance
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Jadwal check-in, check-out, dan nama shift diisi otomatis dari jadwal kerja karyawan.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <svg
                className="h-4 w-4 text-brand-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
              Attendance Details
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Karyawan <span className="text-red-500">*</span>
              </label>
              <EmployeeSearch
                value={selectedEmp}
                onChange={(employee) => {
                  setSelectedEmp(employee);
                  setError(null);
                }}
              />

              {detailLoading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-brand-500">
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Memuat jadwal kerja...
                </div>
              )}

              {empDetail && !detailLoading && (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-2.5 dark:border-green-500/20 dark:bg-green-500/10">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-700 text-xs font-bold dark:bg-green-500/20 dark:text-green-400">
                    {(empDetail.fullName ?? "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-green-800 dark:text-green-300">
                      {empDetail.fullName}
                    </p>
                    <p className="truncate text-xs text-green-600 dark:text-green-500">
                      {empDetail.position?.name ?? "—"} · {empDetail.position?.division?.name ?? "—"}
                      {empDetail.workingSchedules ? (
                        <>
                          {" "}· <strong>{empDetail.workingSchedules.name}</strong>
                        </>
                      ) : (
                        <>
                          {" "}· <span className="text-amber-600 dark:text-amber-400">Belum ada jadwal kerja</span>
                        </>
                      )}
                    </p>
                  </div>
                  <svg className="h-5 w-5 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div key={`date-${dateKey}`}>
              <DatePicker
                id={`att-date-${dateKey}`}
                label="Tanggal Absensi *"
                placeholder="Pilih tanggal..."
                maxDate={toDateStr(TODAY_DATE)}
                defaultDate={attendanceDate}
                onChange={(_date, dateString) => {
                  setAttendanceDate(dateString);
                  setError(null);
                }}
              />

              {attendanceDate && diff > 0 && withinGrace && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                  ⏱ {diff} hari yang lalu — sisa {MAX_PAST_DAYS - diff} hari untuk input.
                </p>
              )}
              {dateInvalid && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  ❌ Batas waktu terlewati ({diff} hari, maks {MAX_PAST_DAYS} hari). Tidak dapat disubmit.
                </p>
              )}
            </div>

            {empDetail && attendanceDate && (
              <>
                {isOffDay && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                        {selectedDayLabel} — Hari Libur/Tidak Aktif
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Tanggal ini di luar jadwal kerja aktif. Anda tetap dapat merekam absensi manual jika diperlukan.
                      </p>
                    </div>
                  </div>
                )}

                {isWorkDay && scheduleDay?.shift && (
                  <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/10">
                    <svg
                      className="h-5 w-5 shrink-0 text-brand-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                        {scheduleDay.shift.name} · {selectedDayLabel}
                      </p>
                      <p className="text-xs text-brand-600 dark:text-brand-400">
                        Masuk: <strong>{scheduleDay.shift.startTime}</strong> · Keluar: <strong>{scheduleDay.shift.endTime}</strong>
                        {scheduleDay.shift.isCrossDay && " · Cross-day"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            <ScheduleField label="Shift" value={shiftName || (isOffDay ? "Libur/Off" : "Tidak ada jadwal")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <ScheduleField label="Jadwal Check-In" value={fmtDateTime(expectedCheckIn)} />
              <ScheduleField label="Jadwal Check-Out" value={fmtDateTime(expectedCheckOut)} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status Kehadiran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as AttendanceStatus)}
                  className={`${selectCls} pl-10`}
                >
                  <option value="PRESENT">Hadir</option>
                  <option value="LATE">Terlambat</option>
                  <option value="ABSENT">Absen</option>
                  <option value="LEAVE">Cuti / Izin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Alasan (Reason for Manual Entry) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className={`${selectCls} pl-10`}
                >
                  <option value="">Pilih alasan...</option>
                  <option value="Lupa absen">Lupa absen</option>
                  <option value="Masalah teknis sistem">Masalah teknis sistem</option>
                  <option value="Sakit & tidak bisa absen sendiri">Sakit &amp; tidak bisa absen sendiri</option>
                  <option value="Tugas lapangan">Tugas lapangan</option>
                  <option value="Keterlambatan GPS / geolokasi">Keterlambatan GPS / geolokasi</option>
                  <option value="Cuti mendadak">Cuti mendadak</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Catatan HRD <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Berikan keterangan lebih lanjut jika diperlukan..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
                <svg
                  className="h-5 w-5 shrink-0 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || dateInvalid || dateInFuture}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {saving ? "Menyimpan..." : "Submit Attendance Record"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <AttendanceNotice />
      </div>
    </>
  );
}
