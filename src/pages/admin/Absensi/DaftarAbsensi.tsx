import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "../../../components/form/date-picker";
import type { Column } from "../../../components/tables/DataTables/DataTable";
import type { PaginationMeta } from "../../../components/tables/DataTables/DataTableOnline";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import { Modal } from "../../../components/ui/modal";
import { useAttendances } from "../../../hooks/useAttendances";
import { attendancesService } from "../../../services/attendances.service";
import { karyawanService } from "../../../services/karyawan.service";
import type {
    AttendanceRecord,
    AttendanceStats,
    AttendanceStatus,
    GetAdminAttendancesParams,
    ManualAttendanceInput,
} from "../../../types/attendances.types";
import type { Employee } from "../../../types/karyawan.types";

// ── Helpers ───────────────────────────────────────────────────
const today = new Date().toLocaleDateString("sv-SE", {
  timeZone: "Asia/Jakarta",
});

function getMonthRange() {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return { start, end: today };
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; cls: string }> = {
  PRESENT: { label: "Hadir", cls: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" },
  LATE:    { label: "Terlambat", cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  ABSENT:  { label: "Absen", cls: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
  LEAVE:   { label: "Cuti/Izin", cls: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
};

function StatusBadge({ status }: { status?: AttendanceStatus | null }) {
  if (!status) return <span className="text-gray-400">—</span>;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ABSENT;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500";

// ── Stats Cards ───────────────────────────────────────────────
function StatsCards({ stats, loading }: { stats: AttendanceStats; loading: boolean }) {
  const cards = [
    {
      label: "Tepat Waktu",
      value: stats.present,
      pct: stats.total ? Math.round((stats.present / stats.total) * 100) : 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      bar: "bg-green-500",
    },
    {
      label: "Terlambat",
      value: stats.late,
      pct: stats.total ? Math.round((stats.late / stats.total) * 100) : 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      bar: "bg-amber-500",
    },
    {
      label: "Absen",
      value: stats.absent,
      pct: stats.total ? Math.round((stats.absent / stats.total) * 100) : 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      bar: "bg-red-500",
    },
    {
      label: "Cuti / Izin",
      value: stats.leave,
      pct: stats.total ? Math.round((stats.leave / stats.total) * 100) : 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      bar: "bg-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-3 flex items-center justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
              {card.icon}
            </div>
            <span className="text-xs font-medium text-gray-400">{card.pct}%</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
          ) : (
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{card.value.toLocaleString("id-ID")}</p>
          )}
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all ${card.bar}`}
              style={{ width: `${card.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────
function DetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [detail, setDetail] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setDetail(null); return; }
    setLoading(true);
    attendancesService.getById(id)
      .then(setDetail)
      .catch(() => toast.error("Gagal memuat detail absensi"))
      .finally(() => setLoading(false));
  }, [id]);

  const emp = detail?.employee;

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="min-w-[140px] text-xs text-gray-400">{label}</span>
      <span className="text-right text-xs font-medium text-gray-700 dark:text-gray-300">{value ?? "—"}</span>
    </div>
  );

  return (
    <Modal isOpen={!!id} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : detail ? (
        <>
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {emp?.fullName ?? "—"}
              </h3>
              <p className="text-sm text-gray-400">
                NIP: {emp?.user?.nip ?? "—"} · {emp?.position?.name ?? "—"} · {emp?.position?.division?.name ?? "—"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={detail.status} />
              {detail.isManualEntry && (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                  Manual
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Check-in / out */}
            <div className="rounded-xl border border-gray-100 px-4 py-3 dark:border-white/[0.06]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Absensi Masuk</p>
              <InfoRow label="Shift" value={detail.shiftNameSnapshot} />
              <InfoRow label="Terjadwal" value={formatTime(detail.expectedCheckInSnapshot)} />
              <InfoRow label="Aktual" value={formatTime(detail.checkIn)} />
              <InfoRow label="Status" value={STATUS_CONFIG[detail.status]?.label} />
              <InfoRow label="Lokasi" value={detail.geofences?.name} />
            </div>

            <div className="rounded-xl border border-gray-100 px-4 py-3 dark:border-white/[0.06]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Absensi Keluar</p>
              <InfoRow label="Terjadwal" value={formatTime(detail.expectedCheckOutSnapshot)} />
              <InfoRow label="Aktual" value={formatTime(detail.checkOut)} />
              <InfoRow label="Status" value={detail.statusCheckOut ? STATUS_CONFIG[detail.statusCheckOut]?.label : "—"} />
              <InfoRow label="Lokasi" value={detail.geofencesCheckOut?.name} />
            </div>

            {/* Employee info */}
            <div className="rounded-xl border border-gray-100 px-4 py-3 dark:border-white/[0.06]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Info Karyawan</p>
              <InfoRow label="Email" value={emp?.email} />
              <InfoRow label="No. HP" value={emp?.phoneNumber} />
              <InfoRow label="Jadwal" value={emp?.workingSchedules?.name} />
              <InfoRow label="Tanggal" value={formatDateShort(detail.createdAt)} />
              <InfoRow label="Device" value={detail.deviceInfo} />
            </div>

            {/* Manual info */}
            {detail.isManualEntry ? (
              <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 dark:border-purple-500/20 dark:bg-purple-500/10">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Entry Manual</p>
                <InfoRow label="Oleh" value={detail.manualEntryUser?.employees?.fullName ?? detail.manualEntryByRole} />
                <InfoRow label="Role" value={detail.manualEntryByRole} />
                <InfoRow label="Waktu" value={formatDateTime(detail.manualEntryAt)} />
                <InfoRow label="Catatan" value={detail.manualNotes} />
                <InfoRow label="Alasan" value={detail.manualReason} />
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 px-4 py-3 dark:border-white/[0.06]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Koordinat Check-In</p>
                <InfoRow label="Latitude" value={detail.latitudeCheckInSnapshot?.toString()} />
                <InfoRow label="Longitude" value={detail.longitudeCheckInSnapshot?.toString()} />
                <InfoRow label="Radius" value={detail.radiusCheckInSnapshot ? `${detail.radiusCheckInSnapshot} m` : undefined} />
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Tutup
            </button>
          </div>
        </>
      ) : null}
    </Modal>
  );
}

// ── Manual Attendance Modal ───────────────────────────────────
const EMP_META_DEFAULT: PaginationMeta = { total: 0, page: 1, limit: 5, totalPages: 1 };

function ManualModal({ isOpen, onClose, onSaved }: { isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const { createManual } = useAttendances();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empMeta, setEmpMeta] = useState<PaginationMeta>(EMP_META_DEFAULT);
  const [empLoading, setEmpLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const [form, setForm] = useState<Partial<ManualAttendanceInput>>({
    status: "PRESENT",
    shiftName: "",
    expectedCheckIn: "",
    expectedCheckOut: "",
    checkIn: "",
    checkOut: "",
    note: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchEmployees = async (params: { page: number; limit: number; search: string }) => {
    setEmpLoading(true);
    try {
      const res = await karyawanService.getAll(params);
      setEmployees(res.data);
      setEmpMeta(res.meta);
    } catch { /* toasted */ } finally { setEmpLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedEmp(null);
      setForm({ status: "PRESENT", shiftName: "", expectedCheckIn: "", expectedCheckOut: "", checkIn: "", checkOut: "", note: "", reason: "" });
      setErrorMsg(null);
      fetchEmployees({ page: 1, limit: 5, search: "" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = async () => {
    if (!selectedEmp) { setErrorMsg("Pilih karyawan terlebih dahulu."); return; }
    if (!form.shiftName || !form.expectedCheckIn || !form.status || !form.note || !form.reason) {
      setErrorMsg("Lengkapi semua field wajib (*).");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      await createManual({
        employeeId: selectedEmp.id,
        ...form,
      } as ManualAttendanceInput);
      toast.success("Absensi manual berhasil dibuat.");
      onSaved();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal membuat absensi manual.");
    } finally {
      setSaving(false);
    }
  };

  const empColumns: Column<Employee>[] = [
    {
      header: "Karyawan",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
            {(row.fullName ?? "?").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{row.fullName}</p>
            <p className="text-xs text-gray-400">NIP: {row.user?.nip}</p>
          </div>
        </div>
      ),
    },
    { header: "Posisi", render: (row) => <span className="text-xs">{row.position?.name ?? "—"}</span> },
    {
      header: "",
      width: "w-20",
      render: (row) => (
        <button
          onClick={() => setSelectedEmp(row)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedEmp?.id === row.id ? "bg-green-500 text-white" : "bg-brand-500 text-white hover:bg-brand-600"}`}
        >
          {selectedEmp?.id === row.id ? "✓ Dipilih" : "Pilih"}
        </button>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">Absensi Manual</h3>

      {/* Employee picker */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Pilih Karyawan <span className="text-red-500">*</span>
          {selectedEmp && <span className="ml-2 text-green-600 text-xs">→ {selectedEmp.fullName}</span>}
        </p>
        <DataTableOnline columns={empColumns} data={employees} meta={empMeta} loading={empLoading} showIndex={false} onQueryChange={fetchEmployees} searchPlaceholder="Cari nama karyawan..." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Nama Shift <span className="text-red-500">*</span></label>
          <input type="text" placeholder="Shift Pagi" value={form.shiftName} onChange={(e) => setForm((p) => ({ ...p, shiftName: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Status <span className="text-red-500">*</span></label>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as AttendanceStatus }))} className={inputCls}>
            <option value="PRESENT">Hadir</option>
            <option value="LATE">Terlambat</option>
            <option value="ABSENT">Absen</option>
            <option value="LEAVE">Cuti/Izin</option>
          </select>
        </div>
        <div>
          <DatePicker
            id="manual-expected-checkin"
            label="Jadwal Check-In *"
            enableTime
            placeholder="Pilih tanggal & jam..."
            defaultDate={form.expectedCheckIn || undefined}
            onChange={(_dates, dateStr) => setForm((p) => ({ ...p, expectedCheckIn: dateStr }))}
          />
        </div>
        <div>
          <DatePicker
            id="manual-expected-checkout"
            label="Jadwal Check-Out"
            enableTime
            placeholder="Pilih tanggal & jam..."
            defaultDate={form.expectedCheckOut || undefined}
            onChange={(_dates, dateStr) => setForm((p) => ({ ...p, expectedCheckOut: dateStr }))}
          />
        </div>
        <div>
          <DatePicker
            id="manual-actual-checkin"
            label="Check-In Aktual"
            enableTime
            placeholder="Pilih tanggal & jam..."
            defaultDate={form.checkIn || undefined}
            onChange={(_dates, dateStr) => setForm((p) => ({ ...p, checkIn: dateStr }))}
          />
        </div>
        <div>
          <DatePicker
            id="manual-actual-checkout"
            label="Check-Out Aktual"
            enableTime
            placeholder="Pilih tanggal & jam..."
            defaultDate={form.checkOut || undefined}
            onChange={(_dates, dateStr) => setForm((p) => ({ ...p, checkOut: dateStr }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Catatan HRD <span className="text-red-500">*</span></label>
          <textarea rows={2} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Catatan untuk karyawan..." className={`${inputCls} resize-none`} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Alasan (AuditLog) <span className="text-red-500">*</span></label>
          <textarea rows={2} value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Alasan untuk audit trail..." className={`${inputCls} resize-none`} />
        </div>
      </div>

      {errorMsg && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{errorMsg}</div>}

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} disabled={saving} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Batal
        </button>
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan Absensi"}
        </button>
      </div>
    </Modal>
  );
}

// ── Export Modal ──────────────────────────────────────────────
function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const range = getMonthRange();
  const [startDate, setStartDate] = useState(range.start);
  const [endDate, setEndDate] = useState(range.end);
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (endDate > today) { toast.error("Tanggal akhir tidak boleh melebihi hari ini."); return; }
    setExporting(true);
    try {
      await attendancesService.export({ startDate, endDate, format });
      toast.success(`File ${format.toUpperCase()} berhasil diunduh.`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengekspor data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">Export Laporan Absensi</h3>
      <div className="space-y-4">
        <DatePicker
          id="export-start-date"
          label="Tanggal Mulai"
          placeholder="Pilih tanggal..."
          maxDate={today}
          defaultDate={startDate}
          onChange={(_dates, dateStr) => setStartDate(dateStr)}
        />
        <DatePicker
          id="export-end-date"
          label="Tanggal Akhir"
          placeholder="Pilih tanggal..."
          maxDate={today}
          defaultDate={endDate}
          onChange={(_dates, dateStr) => setEndDate(dateStr)}
        />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as "xlsx" | "csv")} className={inputCls}>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Batal
        </button>
        <button onClick={handleExport} disabled={exporting} className="ml-auto flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
          {exporting ? "Mengunduh..." : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function DaftarAbsensi() {
  const { attendances, meta, stats, loading, statsLoading, error, fetchAll, fetchStats, handleQueryChange } = useAttendances();

  const [detailId, setDetailId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Filter state
  const range = getMonthRange();
  const [filters, setFilters] = useState<GetAdminAttendancesParams>({
    startDate: range.start,
    endDate: range.end,
    status: "" as AttendanceStatus | "",
  });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    const q = { page: 1, limit: 10, search: "", ...filters };
    fetchAll(q);
    fetchStats({ startDate: filters.startDate, endDate: filters.endDate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const q = { page: 1, limit: meta.limit, search: "", ...filtersRef.current };
    fetchAll(q);
    fetchStats({ startDate: filtersRef.current.startDate, endDate: filtersRef.current.endDate });
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: "Karyawan",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
            {(row.employee?.fullName ?? "?").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{row.employee?.fullName ?? "—"}</p>
            <p className="text-xs text-gray-400">NIP: {row.employee?.user?.nip ?? "—"}</p>
          </div>
        </div>
      ),
    },
    { header: "Divisi", render: (row) => <span className="text-xs">{row.employee?.position?.division?.name ?? "—"}</span> },
    { header: "Tanggal", render: (row) => <span className="text-sm">{formatDateShort(row.createdAt)}</span> },
    { header: "Shift", render: (row) => <span className="text-xs">{row.shiftNameSnapshot ?? "—"}</span> },
    {
      header: "Check-In",
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatTime(row.checkIn)}</p>
          <p className="text-xs text-gray-400">Jadwal: {formatTime(row.expectedCheckInSnapshot)}</p>
        </div>
      ),
    },
    {
      header: "Check-Out",
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatTime(row.checkOut)}</p>
          <p className="text-xs text-gray-400">Jadwal: {formatTime(row.expectedCheckOutSnapshot)}</p>
        </div>
      ),
    },
    { header: "Status Masuk", width: "w-28", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Status Keluar", width: "w-28", render: (row) => <StatusBadge status={row.statusCheckOut} /> },
    {
      header: "Tipe",
      width: "w-20",
      render: (row) => row.isManualEntry ? (
        <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">Manual</span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">Sendiri</span>
      ),
    },
    {
      header: "Aksi",
      width: "w-20",
      render: (row) => (
        <button
          onClick={() => setDetailId(row.id)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Detail
        </button>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Daftar Absensi" description="Monitor dan kelola absensi seluruh karyawan" />
      <PageBreadcrumb pageTitle="Daftar Absensi" />

      <div className="space-y-6">
        {/* Stats */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Filters bar */}
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div>
            <DatePicker
              id="filter-start-date"
              label="Dari"
              placeholder="Pilih tanggal..."
              maxDate={today}
              defaultDate={filters.startDate}
              onChange={(_dates, dateStr) => setFilters((p) => ({ ...p, startDate: dateStr }))}
            />
          </div>
          <div>
            <DatePicker
              id="filter-end-date"
              label="Sampai"
              placeholder="Pilih tanggal..."
              maxDate={today}
              defaultDate={filters.endDate}
              onChange={(_dates, dateStr) => setFilters((p) => ({ ...p, endDate: dateStr }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
            <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as AttendanceStatus | "" }))}
              className="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white">
              <option value="">Semua Status</option>
              <option value="PRESENT">Hadir</option>
              <option value="LATE">Terlambat</option>
              <option value="ABSENT">Absen</option>
              <option value="LEAVE">Cuti/Izin</option>
            </select>
          </div>
          <button onClick={applyFilters} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
            Terapkan
          </button>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setExportOpen(true)} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <ComponentCard
          title="Data Absensi"
          desc={`${meta.total.toLocaleString("id-ID")} record ditemukan`}
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
          )}
          <DataTableOnline
            columns={columns}
            data={attendances}
            meta={meta}
            loading={loading}
            onQueryChange={(p) => { handleQueryChange({ ...p }); }}
            searchPlaceholder="Cari nama karyawan..."
          />
        </ComponentCard>
      </div>

      <DetailModal id={detailId} onClose={() => setDetailId(null)} />
      <ManualModal isOpen={manualOpen} onClose={() => setManualOpen(false)} onSaved={() => applyFilters()} />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </>
  );
}
