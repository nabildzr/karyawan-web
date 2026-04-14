import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import type { Column } from "../../../components/tables/DataTables/DataTable";
import DataTable from "../../../components/tables/DataTables/DataTable";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import type { PaginationMeta } from "../../../components/tables/DataTables/DataTableOnline";
import { Modal } from "../../../components/ui/modal";
import { useWorkingSchedules } from "../../../hooks/useWorkingSchedules";
import { karyawanService } from "../../../services/karyawan.service";
import { workingSchedulesService } from "../../../services/workingSchedules.service";
import type { Employee } from "../../../types/karyawan.types";
import type {
  CreateWorkingScheduleInput,
  DayInput,
  ScheduleDay,
  ScheduleEmployeeBasic,
  UpdateWorkingScheduleInput,
  WorkingSchedule,
  WorkingScheduleDetail,
} from "../../../types/workingSchedules.types";
import {
  DAY_LABELS,
  DAYS_OF_WEEK,
} from "../../../types/workingSchedules.types";

// ── Helpers ───────────────────────────────────────────────────
function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500";

// ── Toggle Switch ─────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Day row state ─────────────────────────────────────────────
interface DayRowState {
  dayOfWeek: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  isCrossDay: boolean;
}

function defaultDayRows(): DayRowState[] {
  return DAYS_OF_WEEK.map((d) => ({
    dayOfWeek: d,
    isActive: !["Saturday", "Sunday"].includes(d),
    startTime: "08:00",
    endTime: "17:00",
    isCrossDay: false,
  }));
}

function fromScheduleDays(days: ScheduleDay[]): DayRowState[] {
  return DAYS_OF_WEEK.map((d) => {
    const found = days.find((day) => day.dayOfWeek === d);
    if (found) {
      return {
        dayOfWeek: d,
        isActive: found.isActive,
        startTime: found.shift?.startTime ?? "08:00",
        endTime: found.shift?.endTime ?? "17:00",
        isCrossDay: found.shift?.isCrossDay ?? false,
      };
    }
    return { dayOfWeek: d, isActive: false, startTime: "08:00", endTime: "17:00", isCrossDay: false };
  });
}

function toDayInputs(rows: DayRowState[]): DayInput[] {
  return rows.map((r) =>
    r.isActive
      ? { dayOfWeek: r.dayOfWeek, isActive: true, startTime: r.startTime, endTime: r.endTime, isCrossDay: r.isCrossDay }
      : { dayOfWeek: r.dayOfWeek, isActive: false },
  );
}

// ── Schedule Form Modal (Create & Edit) ───────────────────────
interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Returns the created/updated schedule ID so we can open assign modal */
  onSaved: (id: string, name: string, goToAssign: boolean) => void;
  initialData?: WorkingScheduleDetail | null;
  loading?: boolean;
}

function ScheduleFormModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
}: ScheduleFormModalProps) {
  const { create, update } = useWorkingSchedules();
  const isEdit = !!initialData;

  const [name, setName] = useState("");
  const [days, setDays] = useState<DayRowState[]>(defaultDayRows());
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync when initialData changes
  const lastId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!isOpen) return;
    if (initialData?.id !== lastId.current) {
      lastId.current = initialData?.id;
      setName(initialData?.name ?? "");
      setDays(initialData?.days ? fromScheduleDays(initialData.days) : defaultDayRows());
      setErrorMsg(null);
    }
    if (!initialData) {
      setName("");
      setDays(defaultDayRows());
      setErrorMsg(null);
    }
  }, [isOpen, initialData]);

  const updateDay = (index: number, patch: Partial<DayRowState>) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const handleSave = async (goNext: boolean) => {
    if (!name.trim()) { setErrorMsg("Nama jadwal wajib diisi."); return; }
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload: CreateWorkingScheduleInput | UpdateWorkingScheduleInput = {
        name,
        days: toDayInputs(days),
      };
      let savedId = "";
      if (isEdit && initialData) {
        const res = await update(initialData.id, payload);
        savedId = res.id;
      } else {
        const res = await create(payload as CreateWorkingScheduleInput);
        savedId = res.id;
      }
      onSaved(savedId, name, goNext);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan jadwal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
        {isEdit ? "Edit Jadwal Kerja" : "Tambah Jadwal Baru"}
      </h3>

      {/* Name */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nama Jadwal <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Jadwal Shift Pagi"
          className={inputCls}
        />
      </div>

      {/* Day rows */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pengaturan Hari Kerja</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status &amp; Shift</p>
        </div>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 dark:divide-white/[0.05] dark:border-white/[0.06]">
          {days.map((day, idx) => (
            <div key={day.dayOfWeek} className="flex items-center gap-3 px-4 py-3">
              {/* Toggle */}
              <Toggle checked={day.isActive} onChange={(v) => updateDay(idx, { isActive: v })} />
              {/* Day name */}
              <span className={`w-20 text-sm font-medium ${day.isActive ? "text-gray-700 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}`}>
                {DAY_LABELS[day.dayOfWeek]}
              </span>

              {/* Shift inputs */}
              <div className="ml-auto flex items-center gap-2">
                {day.isActive ? (
                  <>
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateDay(idx, { startTime: e.target.value })}
                      className="rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                    />
                    <span className="text-xs text-gray-400">–</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateDay(idx, { endTime: e.target.value })}
                      className="rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={day.isCrossDay}
                        onChange={(e) => updateDay(idx, { isCrossDay: e.target.checked })}
                        className="h-3.5 w-3.5 rounded accent-brand-500"
                      />
                      Cross Day
                    </label>
                  </>
                ) : (
                  <span className="text-xs italic text-gray-300 dark:text-gray-600">Libur↯</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="rounded-lg border border-brand-300 px-4 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50 disabled:opacity-50 dark:border-brand-500/30 dark:text-brand-400"
        >
          {saving ? "Menyimpan..." : isEdit ? "Simpan" : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="ml-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : isEdit ? "Update & Selanjutnya" : "Simpan & Selanjutnya"}
        </button>
      </div>
    </Modal>
  );
}

// ── Ganti Jadwal Sub-modal ────────────────────────────────────
interface GantiJadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScheduleId: string;
  currentScheduleName: string;
  allSchedules: WorkingSchedule[];
  onConfirm: (newScheduleId: string, newScheduleName: string) => void;
}

function GantiJadwalModal({
  isOpen,
  onClose,
  currentScheduleId,
  currentScheduleName,
  allSchedules,
  onConfirm,
}: GantiJadwalModalProps) {
  const [selected, setSelected] = useState<string>("");
  const [search, setSearch] = useState("");

  const filtered = allSchedules.filter(
    (s) => s.id !== currentScheduleId && s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConfirm = () => {
    if (!selected) return;
    const s = allSchedules.find((x) => x.id === selected);
    if (s) onConfirm(s.id, s.name);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
          <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Ganti Jadwal</h3>
      </div>

      {/* Current */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Jadwal Aktif Saat Ini</p>
        <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <svg className="h-4 w-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentScheduleName}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Aktif
          </span>
        </div>
      </div>

      {/* Search + list */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Pilih Jadwal Baru</p>
        <div className="relative mb-3">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari jadwal kerja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
          />
        </div>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Tidak ada jadwal lain</p>
          ) : (
            filtered.map((s) => (
              <label
                key={s.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                  selected === s.id
                    ? "border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10"
                    : "border-gray-100 hover:bg-gray-50 dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.name}</p>
                    <p className="text-xs text-gray-400">{s._count.employees} karyawan</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="ganti-jadwal"
                  value={s.id}
                  checked={selected === s.id}
                  onChange={() => setSelected(s.id)}
                  className="h-4 w-4 accent-brand-500"
                />
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Batal
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="ml-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-40"
        >
          Ganti Jadwal
        </button>
      </div>
    </Modal>
  );
}

// ── Assign / Edit Penugasan Modal ─────────────────────────────
interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  scheduleName: string;
  allSchedules: WorkingSchedule[];
  /** Callback after assignment saved */
  onSaved: () => void;
}

const ASSIGN_META_DEFAULT: PaginationMeta = { total: 0, page: 1, limit: 5, totalPages: 1 };

function AssignModal({
  isOpen,
  onClose,
  scheduleId,
  scheduleName,
  allSchedules,
  onSaved,
}: AssignModalProps) {
  const { assign } = useWorkingSchedules();

  const [currentScheduleId, setCurrentScheduleId] = useState(scheduleId);
  const [currentScheduleName, setCurrentScheduleName] = useState(scheduleName);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empMeta, setEmpMeta] = useState<PaginationMeta>(ASSIGN_META_DEFAULT);
  const [empLoading, setEmpLoading] = useState(false);
  const empSearchRef = useRef<string>("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Ganti Jadwal sub-modal
  const [gantiOpen, setGantiOpen] = useState(false);

  // Fetch employees with pagination
  const fetchEmployees = useCallback(async (params: { page: number; limit: number; search: string }) => {
    setEmpLoading(true);
    empSearchRef.current = params.search;
    try {
      const res = await karyawanService.getAll(params);
      setEmployees(res.data);
      setEmpMeta(res.meta);
    } catch {
      // error toasted by interceptor
    } finally {
      setEmpLoading(false);
    }
  }, []);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentScheduleId(scheduleId);
      setCurrentScheduleName(scheduleName);
      setSelectedIds(new Set());
      fetchEmployees({ page: 1, limit: 5, search: "" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, scheduleId]);

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await assign(currentScheduleId, { employeeIds: Array.from(selectedIds) });
      toast.success(`${selectedIds.size} karyawan berhasil di-assign ke jadwal "${currentScheduleName}".`);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const empColumns: Column<Employee>[] = [
    {
      header: "",
      width: "w-10",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleEmployee(row.id)}
          className="h-4 w-4 rounded accent-brand-500"
        />
      ),
    },
    {
      header: "Karyawan",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
            {row.fullName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{row.fullName}</p>
            <p className="text-xs text-gray-400">{row.email ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "NIP",
      render: (row) => <span className="text-xs font-mono">{row.user.nip}</span>,
    },
    {
      header: "Divisi & Posisi",
      render: (row) => (
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300">{row.position?.division?.name ?? "—"}</p>
          <p className="text-xs text-gray-400">{row.position?.name ?? "—"}</p>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6 sm:p-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Penugasan Jadwal</h3>
          </div>
        </div>

        {/* Info bar */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Mengedit penugasan untuk Jadwal:{" "}
              <span className="font-semibold text-brand-600 dark:text-brand-400">{currentScheduleName}</span>
            </p>
          </div>
          <button
            onClick={() => setGantiOpen(true)}
            className="flex items-center gap-1 text-sm font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
          >
            Ganti Jadwal
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Employee table */}
        <div className="mb-4 max-h-96 overflow-y-auto">
          <DataTableOnline
            columns={empColumns}
            data={employees}
            meta={empMeta}
            loading={empLoading}
            showIndex={false}
            onQueryChange={fetchEmployees}
            searchPlaceholder="Cari nama karyawan atau divisi..."
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-sm">
            <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedIds.size} Karyawan</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">terpilih</span>
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={saving} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Batal
            </button>
            <button onClick={handleSave} disabled={saving || selectedIds.size === 0} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan Pembaruan"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ganti Jadwal sub-modal */}
      <GantiJadwalModal
        isOpen={gantiOpen}
        onClose={() => setGantiOpen(false)}
        currentScheduleId={currentScheduleId}
        currentScheduleName={currentScheduleName}
        allSchedules={allSchedules}
        onConfirm={(newId, newName) => {
          setCurrentScheduleId(newId);
          setCurrentScheduleName(newName);
          setSelectedIds(new Set());
          setGantiOpen(false);
          // Reload employees for new context
          fetchEmployees({ page: 1, limit: 5, search: "" });
        }}
      />
    </>
  );
}

// ── Detail Modal ──────────────────────────────────────────────
interface DetailModalProps {
  scheduleId: string | null;
  onClose: () => void;
}

function DetailModal({ scheduleId, onClose }: DetailModalProps) {
  const [detail, setDetail] = useState<WorkingScheduleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!scheduleId) { setDetail(null); return; }
    setLoadingDetail(true);
    workingSchedulesService.getById(scheduleId)
      .then((d) => { setDetail(d); })
      .catch(() => toast.error("Gagal memuat detail jadwal"))
      .finally(() => setLoadingDetail(false));
  }, [scheduleId]);

  const empColumns: Column<ScheduleEmployeeBasic>[] = [
    {
      header: "Karyawan",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
            {row.fullName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{row.fullName}</p>
            <p className="text-xs text-gray-400">NIP: {row.user?.nip ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Posisi",
      render: (row) => (
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300">{row.position?.name ?? "—"}</p>
          <p className="text-xs text-gray-400">{row.position?.division?.name ?? "—"}</p>
        </div>
      ),
    },
    {
      header: "Email",
      render: (row) => <span className="text-xs">{row.email ?? "—"}</span>,
    },
  ];

  return (
    <Modal isOpen={!!scheduleId} onClose={onClose} className="max-w-3xl p-6 sm:p-8">
      {loadingDetail ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : detail ? (
        <>
          {/* Header */}
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{detail.name}</h3>
              <p className="text-xs text-gray-400">Dibuat: {formatDate(detail.createdAt)} · {detail._count.employees} karyawan</p>
            </div>
          </div>

          {/* Days schedule */}
          <div className="mb-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Pengaturan Hari Kerja</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {DAYS_OF_WEEK.map((d) => {
                const found = detail.days?.find((day) => day.dayOfWeek === d);
                const active = found?.isActive ?? false;
                return (
                  <div
                    key={d}
                    className={`rounded-xl border p-3 ${active ? "border-brand-100 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/10" : "border-gray-100 bg-gray-50 dark:border-white/[0.04] dark:bg-white/[0.02]"}`}
                  >
                    <p className={`text-xs font-semibold ${active ? "text-brand-600 dark:text-brand-400" : "text-gray-400"}`}>
                      {DAY_LABELS[d]}
                    </p>
                    {active && found?.shift ? (
                      <>
                        <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                          {found.shift.startTime} – {found.shift.endTime}
                        </p>
                        {found.shift.isCrossDay && (
                          <span className="mt-1 inline-block rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            Cross Day
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-xs italic text-gray-300 dark:text-gray-600">Libur</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employees */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Karyawan yang Ter-assign
            </p>
            {detail.employees.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Belum ada karyawan yang di-assign ke jadwal ini.</p>
            ) : (
              <DataTable
                columns={empColumns}
                data={detail.employees}
                showIndex={false}
              />
            )}
          </div>
        </>
      ) : null}
    </Modal>
  );
}

// ── Stats Card ────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function JadwalKerja() {
  const { schedules, stats, loading, error, fetchAll } = useWorkingSchedules();

  // Form (create/edit) modal
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkingScheduleDetail | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Assign modal
  const [assignScheduleId, setAssignScheduleId] = useState<string>("");
  const [assignScheduleName, setAssignScheduleName] = useState<string>("");
  const [assignOpen, setAssignOpen] = useState(false);

  // Detail modal
  const [detailId, setDetailId] = useState<string | null>(null);

  // Delete modal (no API endpoint — disabled, but kept for structure)
  const [deleteTarget, setDeleteTarget] = useState<WorkingSchedule | null>(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = async (s: WorkingSchedule) => {
    setEditLoading(true);
    try {
      const detail = await workingSchedulesService.getById(s.id);
      setEditTarget(detail);
      setFormOpen(true);
    } catch {
      toast.error("Gagal memuat detail jadwal");
    } finally {
      setEditLoading(false);
    }
  };

  const openAssign = (id: string, name: string) => {
    setAssignScheduleId(id);
    setAssignScheduleName(name);
    setAssignOpen(true);
  };

  // After schedule saved — if goToAssign, open assign modal
  const handleScheduleSaved = (id: string, name: string, goToAssign: boolean) => {
    setFormOpen(false);
    setEditTarget(null);
    toast.success(`Jadwal "${name}" berhasil ${editTarget ? "diperbarui" : "dibuat"}.`);
    if (goToAssign) openAssign(id, name);
  };

  const columns: Column<WorkingSchedule>[] = [
    {
      header: "Nama Jadwal",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
            <svg className="h-4 w-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{row.name}</p>
            <p className="text-xs text-gray-400">ID: {row.id.slice(0, 8)}…</p>
          </div>
        </div>
      ),
    },
    {
      header: "Dibuat",
      render: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Karyawan",
      width: "w-36",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          {row._count.employees} Karyawan
        </span>
      ),
    },
    {
      header: "Aksi",
      width: "w-52",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            onClick={() => setDetailId(row.id)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Detail
          </button>
          <button
            onClick={() => openEdit(row)}
            disabled={editLoading}
            className="rounded-lg bg-brand-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={() => openAssign(row.id, row.name)}
            className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
          >
            Penugasan
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Jadwal Kerja" description="Manajemen jadwal kerja karyawan" />
      <PageBreadcrumb pageTitle="Jadwal Kerja" />

      <div className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Jadwal"
            value={stats.totalSchedules}
            color="bg-brand-50 dark:bg-brand-500/10"
            icon={
              <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Active Assignments"
            value={stats.activeAssignments}
            color="bg-green-50 dark:bg-green-500/10"
            icon={
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="Recent Changes (7 hari terakhir)"
            value={stats.recentChanges}
            color="bg-amber-50 dark:bg-amber-500/10"
            icon={
              <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Table */}
        <ComponentCard
          title="Daftar Jadwal Kerja"
          desc={`${schedules.length} jadwal terdaftar`}
          action={
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Jadwal
            </button>
          }
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={schedules}
              pageSize={10}
              searchKeys={["name"]}
            />
          )}
        </ComponentCard>
      </div>

      {/* Schedule Form Modal */}
      <ScheduleFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={handleScheduleSaved}
        initialData={editTarget}
      />

      {/* Assign Modal */}
      <AssignModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        scheduleId={assignScheduleId}
        scheduleName={assignScheduleName}
        allSchedules={schedules}
        onSaved={fetchAll}
      />

      {/* Detail Modal */}
      <DetailModal
        scheduleId={detailId}
        onClose={() => setDetailId(null)}
      />

      {/* Delete (no DELETE endpoint — placeholder) */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name ?? ""}
        onConfirm={() => {
          toast.error("Endpoint DELETE belum tersedia di API.");
          setDeleteTarget(null);
        }}
        loading={false}
      />
    </>
  );
}
