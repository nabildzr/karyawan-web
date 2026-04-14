import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "../../../components/form/date-picker";
import type { Column } from "../../../components/tables/DataTables/DataTable";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import { Modal } from "../../../components/ui/modal";
import { useAttendances } from "../../../hooks/useAttendances";
import { attendancesService } from "../../../services/attendances.service";
import type {
  AttendanceRecord,
  AttendanceStatus,
  CorrectAttendanceInput,
  GetAdminAttendancesParams,
} from "../../../types/attendances.types";

// ── Helpers (same as DaftarAbsensi) ──────────────────────────
const today = new Date().toISOString().split("T")[0];

function toLocalDatetimeValue(iso?: string | null): string {
  if (!iso) return "";
  // datetime-local input needs "YYYY-MM-DDTHH:MM"
  return iso.slice(0, 16);
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
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ABSENT;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500";

// ── Correction Modal ──────────────────────────────────────────
interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: AttendanceRecord | null;
  onSaved: () => void;
}

function CorrectionModal({ isOpen, onClose, target, onSaved }: CorrectionModalProps) {
  const { correct } = useAttendances();

  const [form, setForm] = useState<CorrectAttendanceInput>({
    checkIn: "",
    checkOut: "",
    status: undefined,
    statusCheckOut: undefined,
    note: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate from target
  useEffect(() => {
    if (isOpen && target) {
      setForm({
        checkIn: toLocalDatetimeValue(target.checkIn),
        checkOut: toLocalDatetimeValue(target.checkOut),
        status: target.status ?? undefined,
        statusCheckOut: target.statusCheckOut ?? undefined,
        note: "",
        reason: "",
      });
      setErrorMsg(null);
    }
  }, [isOpen, target]);

  const handleSave = async () => {
    if (!target) return;
    if (!form.note.trim()) { setErrorMsg("Catatan alasan koreksi wajib diisi."); return; }
    setSaving(true);
    setErrorMsg(null);
    try {
      // Convert datetime-local string back to ISO
      const payload: CorrectAttendanceInput = {
        ...form,
        checkIn: form.checkIn ? new Date(form.checkIn).toISOString() : undefined,
        checkOut: form.checkOut ? new Date(form.checkOut).toISOString() : undefined,
      };
      await correct(target.id, payload);
      toast.success("Absensi berhasil dikoreksi.");
      onSaved();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengkoreksi absensi.");
    } finally {
      setSaving(false);
    }
  };

  const emp = target?.employee;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      {/* Header */}
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
          <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Koreksi Absensi</h3>
          <p className="text-sm text-gray-400">
            {emp?.fullName ?? "—"} · {formatDateShort(target?.createdAt)}
          </p>
        </div>
      </div>

      {/* Current data banner */}
      {target && (
        <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Data Saat Ini</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Shift</span><span className="font-medium">{target.shiftNameSnapshot ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status Masuk</span><StatusBadge status={target.status} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Check-In</span><span className="font-medium">{formatTime(target.checkIn)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status Keluar</span><StatusBadge status={target.statusCheckOut} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Check-Out</span><span className="font-medium">{formatTime(target.checkOut)}</span></div>
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <DatePicker
            id="correct-checkin"
            label="Check-In Baru"
            enableTime
            placeholder="Pilih tanggal & jam..."
            defaultDate={form.checkIn || undefined}
            onChange={(_dates, dateStr) => setForm((p) => ({ ...p, checkIn: dateStr }))}
          />
        </div>
        <div>
          <DatePicker
            id="correct-checkout"
            label="Check-Out Baru"
            enableTime
            placeholder="Pilih tanggal & jam..."
            defaultDate={form.checkOut || undefined}
            onChange={(_dates, dateStr) => setForm((p) => ({ ...p, checkOut: dateStr }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Status Masuk Baru</label>
          <select value={form.status ?? ""} onChange={(e) => setForm((p) => ({ ...p, status: (e.target.value || undefined) as AttendanceStatus | undefined }))} className={inputCls}>
            <option value="">Tidak diubah</option>
            <option value="PRESENT">Hadir</option>
            <option value="LATE">Terlambat</option>
            <option value="ABSENT">Absen</option>
            <option value="LEAVE">Cuti/Izin</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Status Keluar Baru</label>
          <select value={form.statusCheckOut ?? ""} onChange={(e) => setForm((p) => ({ ...p, statusCheckOut: (e.target.value || undefined) as AttendanceStatus | undefined }))} className={inputCls}>
            <option value="">Tidak diubah</option>
            <option value="PRESENT">Hadir</option>
            <option value="LATE">Terlambat</option>
            <option value="ABSENT">Absen</option>
            <option value="LEAVE">Cuti/Izin</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Catatan Koreksi <span className="text-red-500">*</span>
          </label>
          <textarea rows={2} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            placeholder="Contoh: Koreksi — check-in tercatat terlambat karena bug GPS"
            className={`${inputCls} resize-none`} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Keterangan Tambahan (AuditLog)</label>
          <textarea rows={2} value={form.reason ?? ""} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="Keterangan untuk audit trail..."
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{errorMsg}</div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} disabled={saving} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Batal
        </button>
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan Koreksi"}
        </button>
      </div>
    </Modal>
  );
}

// ── Detail Modal (reusable inline) ────────────────────────────
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
      <span className="min-w-[130px] text-xs text-gray-400">{label}</span>
      <span className="text-right text-xs font-medium text-gray-700 dark:text-gray-300">{value ?? "—"}</span>
    </div>
  );

  return (
    <Modal isOpen={!!id} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : detail ? (
        <>
          <div className="mb-5 flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Detail Absensi</h3>
            {detail.isManualEntry && (
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">Manual/Dikoreksi</span>
            )}
          </div>
          <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-300">{emp?.fullName ?? "—"} · {formatDateShort(detail.createdAt)}</p>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            <InfoRow label="Shift" value={detail.shiftNameSnapshot} />
            <InfoRow label="Terjadwal Masuk" value={formatTime(detail.expectedCheckInSnapshot)} />
            <InfoRow label="Check-In Aktual" value={formatTime(detail.checkIn)} />
            <InfoRow label="Terjadwal Keluar" value={formatTime(detail.expectedCheckOutSnapshot)} />
            <InfoRow label="Check-Out Aktual" value={formatTime(detail.checkOut)} />
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-400">Status Masuk</span>
              <StatusBadge status={detail.status} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-400">Status Keluar</span>
              <StatusBadge status={detail.statusCheckOut} />
            </div>
            {detail.isManualEntry && (
              <>
                <InfoRow label="Koreksi Oleh" value={detail.manualEntryUser?.employees?.fullName ?? detail.manualEntryByRole} />
                <InfoRow label="Catatan" value={detail.manualNotes} />
                <InfoRow label="Alasan" value={detail.manualReason} />
              </>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Tutup
            </button>
          </div>
        </>
      ) : null}
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function KoreksiAbsensi() {
  const { attendances, meta, loading, error, fetchAll, handleQueryChange } = useAttendances();

  const [correctionTarget, setCorrectionTarget] = useState<AttendanceRecord | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<GetAdminAttendancesParams>({
    startDate: "",
    endDate: "",
    status: "" as AttendanceStatus | "",
  });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    fetchAll({ page: 1, limit: 10, search: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    fetchAll({ page: 1, limit: meta.limit, search: "", ...filtersRef.current });
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: "Karyawan",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold dark:bg-amber-500/10 dark:text-amber-400">
            {(row.employee?.fullName ?? "?").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{row.employee?.fullName ?? "—"}</p>
            <p className="text-xs text-gray-400">NIP: {row.employee?.user?.nip ?? "—"}</p>
          </div>
        </div>
      ),
    },
    { header: "Tanggal", render: (row) => <span className="text-sm">{formatDateShort(row.createdAt)}</span> },
    { header: "Shift", render: (row) => <span className="text-xs">{row.shiftNameSnapshot ?? "—"}</span> },
    {
      header: "Check-In",
      render: (row) => (
        <div>
          <p className="text-sm font-mono">{formatTime(row.checkIn)}</p>
          <p className="text-xs text-gray-400">Jadwal: {formatTime(row.expectedCheckInSnapshot)}</p>
        </div>
      ),
    },
    {
      header: "Check-Out",
      render: (row) => (
        <div>
          <p className="text-sm font-mono">{formatTime(row.checkOut)}</p>
          <p className="text-xs text-gray-400">Jadwal: {formatTime(row.expectedCheckOutSnapshot)}</p>
        </div>
      ),
    },
    {
      header: "Status",
      width: "w-28",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={row.status} />
          {row.statusCheckOut && <StatusBadge status={row.statusCheckOut} />}
        </div>
      ),
    },
    {
      header: "Tipe",
      width: "w-24",
      render: (row) => row.isManualEntry ? (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">Manual</span>
          {row.manualEntryByRole && <span className="text-xs text-gray-400">{row.manualEntryByRole}</span>}
        </div>
      ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">Organik</span>
      ),
    },
    {
      header: "Aksi",
      width: "w-36",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDetailId(row.id)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
          >
            Detail
          </button>
          <button
            onClick={() => setCorrectionTarget(row)}
            className="rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600"
          >
            Koreksi
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Koreksi Absensi" description="Koreksi record absensi karyawan" />
      <PageBreadcrumb pageTitle="Koreksi Absensi" />

      <div className="space-y-6">
        {/* Info banner */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
          <svg className="h-5 w-5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Koreksi absensi akan tercatat di <span className="font-semibold">AuditLog</span> dengan action <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-500/20">CORRECT_ATTENDANCE</code>.
            Semua perubahan memerlukan catatan wajib.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div>
            <DatePicker
              id="koreksi-filter-start"
              label="Dari"
              placeholder="Pilih tanggal..."
              maxDate={today}
              defaultDate={filters.startDate}
              onChange={(_dates, dateStr) => setFilters((p) => ({ ...p, startDate: dateStr }))}
            />
          </div>
          <div>
            <DatePicker
              id="koreksi-filter-end"
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
        </div>

        {/* Table */}
        <ComponentCard
          title="Daftar Record Absensi"
          desc="Klik Koreksi untuk mengubah data absensi yang salah"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
          )}
          <DataTableOnline
            columns={columns}
            data={attendances}
            meta={meta}
            loading={loading}
            onQueryChange={(p) => { handleQueryChange({ ...p, ...filtersRef.current }); }}
            searchPlaceholder="Cari nama karyawan..."
          />
        </ComponentCard>
      </div>

      {/* Modals */}
      <CorrectionModal
        isOpen={!!correctionTarget}
        onClose={() => setCorrectionTarget(null)}
        target={correctionTarget}
        onSaved={applyFilters}
      />
      <DetailModal id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}
