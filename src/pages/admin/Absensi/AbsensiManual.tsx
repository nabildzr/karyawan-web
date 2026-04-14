import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "../../../components/form/date-picker";
import { useAttendances } from "../../../hooks/useAttendances";
import { karyawanService } from "../../../services/karyawan.service";
import type {
  Employee,
  EmployeeDetail2,
  WorkingScheduleDay,
} from "../../../types/karyawan.types";
import type { AttendanceStatus } from "../../../types/attendances.types";

// ── Constants ─────────────────────────────────────────────────
const MAX_PAST_DAYS = 7;
const TODAY_DATE = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();
const DAYS_ID: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

// ── Helpers ───────────────────────────────────────────────────
function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function buildIso(datePart: string, timePart: string) {
  return new Date(`${datePart}T${timePart}:00`).toISOString();
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysDiff(dateStr: string): number {
  const t = new Date(dateStr);
  t.setHours(0, 0, 0, 0);
  return Math.round((TODAY_DATE.getTime() - t.getTime()) / 86400000);
}

function isWithinGrace(dateStr: string): boolean {
  if (!dateStr) return false;
  const diff = daysDiff(dateStr);
  return diff >= 0 && diff <= MAX_PAST_DAYS;
}

// ── Styles ────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500/20";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ── Employee Search ───────────────────────────────────────────
function EmployeeSearch({
  value,
  onChange,
}: {
  value: Employee | null;
  onChange: (e: Employee | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await karyawanService.getAll({
        page: 1,
        limit: 8,
        search: q,
      });
      setResults(res.data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const select = (emp: Employee) => {
    onChange(emp);
    setQuery(emp.fullName);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="text"
          value={value ? `${value.fullName}  ·  NIP ${value.user?.nip}` : query}
          onChange={(e) => {
            const q = e.target.value;
            setQuery(q);
            if (value) onChange(null);
            if (debounce.current) clearTimeout(debounce.current);
            debounce.current = setTimeout(() => search(q), 350);
          }}
          onFocus={() => query && results.length && setOpen(true)}
          placeholder="Ketik nama atau NIP karyawan..."
          className={`${inputCls} pl-10 pr-8`}
        />
        {loading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 animate-spin text-brand-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </span>
        )}
        {value && !loading && (
          <button
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {results.map((emp) => (
            <button
              key={emp.id}
              onClick={() => select(emp)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
                {(emp.fullName ?? "?").charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {emp.fullName}
                </p>
                <p className="text-xs text-gray-400">
                  NIP {emp.user?.nip} · {emp.position?.name ?? "—"} ·{" "}
                  {emp.position?.division?.name ?? "—"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && !loading && !results.length && query && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          Tidak ditemukan.
        </div>
      )}
    </div>
  );
}

// ── Field Row (read-only from schedule) ──────────────────────
function ScheduleField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          Auto · Jadwal Kerja
        </span>
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/5">
        <svg
          className="h-4 w-4 shrink-0 text-brand-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AbsensiManual() {
  const { createManual } = useAttendances();

  // Employee
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empDetail, setEmpDetail] = useState<EmployeeDetail2 | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Attendance date (drives schedule lookup)
  const [attendanceDate, setAttendanceDate] = useState<string>(
    toDateStr(TODAY_DATE),
  );
  const [dateKey, setDateKey] = useState(0); // for remounting DatePicker

  // Form fields
  const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived schedule for selected date
  const scheduleDay: WorkingScheduleDay | null = (() => {
    if (!empDetail?.workingSchedules?.days || !attendanceDate) return null;
    const dayName = DAYS_ID[new Date(attendanceDate).getDay()];
    return (
      empDetail.workingSchedules.days.find((d) => d.dayOfWeek === dayName) ??
      null
    );
  })();

  const isWorkDay = !!scheduleDay?.isActive;
  const isOffDay = !!(scheduleDay && !scheduleDay.isActive);
  const hasNoSchedule = !!empDetail && !empDetail.workingSchedules;

  // Auto-computed expected times
  const shiftName = scheduleDay?.shift?.name ?? "";
  const expectedCheckIn =
    scheduleDay?.shift && attendanceDate
      ? buildIso(attendanceDate, scheduleDay.shift.startTime)
      : "";
  const expectedCheckOut = (() => {
    if (!scheduleDay?.shift || !attendanceDate) return "";
    const d = new Date(attendanceDate);
    if (scheduleDay.shift.isCrossDay) d.setDate(d.getDate() + 1);
    return buildIso(toDateStr(d), scheduleDay.shift.endTime);
  })();

  // Grace period
  const diff = attendanceDate ? daysDiff(attendanceDate) : 0;
  const withinGrace = isWithinGrace(attendanceDate);

  // Date is valid for submission?
  const dateInvalid = !withinGrace && !!attendanceDate;
  const dateInFuture = diff < 0;

  // Load employee detail when selected
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
    setDateKey((k) => k + 1);
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
      setError(
        `Batas waktu input absensi manual adalah ${MAX_PAST_DAYS} hari ke belakang.`,
      );
      return;
    }
    if (dateInFuture) {
      setError("Tanggal tidak boleh di masa depan.");
      return;
    }
    if (!shiftName && !hasNoSchedule) {
      setError("Tidak ada jadwal aktif di hari ini.");
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
      await createManual({
        employeeId: selectedEmp.id,
        shiftName: shiftName || "Manual",
        expectedCheckIn:
          expectedCheckIn ||
          new Date(`${attendanceDate}T08:00:00`).toISOString(),
        expectedCheckOut: expectedCheckOut || undefined,
        status,
        note,
        reason,
      });
      toast.success(
        `Absensi manual ${selectedEmp.fullName} berhasil disimpan.`,
      );
      handleReset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Absensi Manual"
        description="Record absensi manual untuk karyawan"
      />
      <PageBreadcrumb pageTitle="Absensi Manual" />

      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Record Manual Attendance
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Jadwal check‑in, check‑out, dan nama shift diisi otomatis dari
            jadwal kerja karyawan.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Card title */}
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
            {/* ── 1. Search Employee ── */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Karyawan <span className="text-red-500">*</span>
              </label>
              <EmployeeSearch
                value={selectedEmp}
                onChange={(e) => {
                  setSelectedEmp(e);
                  setError(null);
                }}
              />

              {detailLoading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-brand-500">
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Memuat jadwal kerja...
                </div>
              )}

              {/* Employee info pill */}
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
                      {empDetail.position?.name ?? "—"} ·{" "}
                      {empDetail.position?.division?.name ?? "—"}
                      {empDetail.workingSchedules ? (
                        <>
                          {" "}
                          · <strong>{empDetail.workingSchedules.name}</strong>
                        </>
                      ) : (
                        <>
                          {" "}
                          ·{" "}
                          <span className="text-amber-600 dark:text-amber-400">
                            Belum ada jadwal kerja
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 shrink-0 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* ── 2. Attendance Date ── */}
            <div key={`date-${dateKey}`}>
              <DatePicker
                id={`att-date-${dateKey}`}
                label="Tanggal Absensi *"
                placeholder="Pilih tanggal..."
                maxDate={toDateStr(TODAY_DATE)}
                defaultDate={attendanceDate}
                onChange={(_d, str) => {
                  setAttendanceDate(str);
                  setError(null);
                }}
              />

              {/* Grace period feedback */}
              {attendanceDate && diff > 0 && withinGrace && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                  ⏱ {diff} hari yang lalu — sisa {MAX_PAST_DAYS - diff} hari
                  untuk input.
                </p>
              )}
              {dateInvalid && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  ❌ Batas waktu terlewati ({diff} hari, maks {MAX_PAST_DAYS}{" "}
                  hari). Tidak dapat disubmit.
                </p>
              )}
            </div>

            {/* ── 3. Schedule info from working schedule ── */}
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
                        {DAYS_ID[new Date(attendanceDate).getDay()]} — Hari
                        Libur/Tidak Aktif
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Hari ini di luar jadwal kerja aktif. Anda tetap dapat
                        merekam absensi manual jika diperlukan.
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
                        {scheduleDay.shift.name} ·{" "}
                        {DAYS_ID[new Date(attendanceDate).getDay()]}
                      </p>
                      <p className="text-xs text-brand-600 dark:text-brand-400">
                        Masuk: <strong>{scheduleDay.shift.startTime}</strong> ·
                        Keluar: <strong>{scheduleDay.shift.endTime}</strong>
                        {scheduleDay.shift.isCrossDay && " · Cross-day"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── 4. Shift Name ── */}
            <ScheduleField
              label="Shift"
              value={shiftName || (isOffDay ? "Libur/Off" : "Tidak ada jadwal")}
            />

            {/* ── 5. Jadwal Check-In & Check-Out ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ScheduleField
                label="Jadwal Check-In"
                value={fmtDateTime(expectedCheckIn)}
              />
              <ScheduleField
                label="Jadwal Check-Out"
                value={fmtDateTime(expectedCheckOut)}
              />
            </div>

            {/* ── 6. Status ── */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status Kehadiran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="h-4 w-4"
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
                </span>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as AttendanceStatus)
                  }
                  className={`${selectCls} pl-10`}
                >
                  <option value="PRESENT">Hadir</option>
                  <option value="LATE">Terlambat</option>
                  <option value="ABSENT">Absen</option>
                  <option value="LEAVE">Cuti / Izin</option>
                </select>
              </div>
            </div>

            {/* ── 7. Reason ── */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Alasan (Reason for Manual Entry){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`${selectCls} pl-10`}
                >
                  <option value="">Pilih alasan...</option>
                  <option value="Lupa absen">Lupa absen</option>
                  <option value="Masalah teknis sistem">
                    Masalah teknis sistem
                  </option>
                  <option value="Sakit & tidak bisa absen sendiri">
                    Sakit &amp; tidak bisa absen sendiri
                  </option>
                  <option value="Tugas lapangan">Tugas lapangan</option>
                  <option value="Keterlambatan GPS / geolokasi">
                    Keterlambatan GPS / geolokasi
                  </option>
                  <option value="Cuti mendadak">Cuti mendadak</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* ── 8. Catatan ── */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Catatan HRD <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Berikan keterangan lebih lanjut jika diperlukan..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* ── Error ── */}
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
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSubmit}
                disabled={saving || dateInvalid || dateInFuture}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {saving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Submit Attendance Record
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Notice */}
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
                Input absensi manual hanya diperbolehkan untuk{" "}
                <strong>maksimal {MAX_PAST_DAYS} hari</strong> ke belakang dari
                hari ini. Semua record tercatat di Audit Log:{" "}
                <code className="rounded bg-blue-100 px-1 py-0.5 font-mono dark:bg-blue-500/20">
                  CREATE_ATTENDANCE_MANUAL
                </code>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
