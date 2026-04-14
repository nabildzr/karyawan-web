import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import type { Column } from "../../../components/tables/DataTables/DataTable";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import { Modal } from "../../../components/ui/modal";
import { useHolidays } from "../../../hooks/useHolidays";
import type {
  CreateHolidayInput,
  PublicHoliday,
  UpdateHolidayInput,
} from "../../../types/holidays.types";

// ── Helpers ───────────────────────────────────────────────────
function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDateInputValue(isoStr: string | null | undefined): string {
  if (!isoStr) return "";
  return isoStr.slice(0, 10);
}

// ── Shared input style ────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500";

// ── Holiday Form Modal (Create & Edit) ────────────────────────
interface HolidayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHolidayInput | UpdateHolidayInput) => Promise<void>;
  initialData?: PublicHoliday | null;
  loading?: boolean;
}

function HolidayFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: HolidayFormModalProps) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: "",
    date: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form when initialData changes
  const [lastId, setLastId] = useState<string | undefined>(initialData?.id);
  if (initialData?.id !== lastId) {
    setLastId(initialData?.id);
    setForm({
      name: initialData?.name ?? "",
      date: toDateInputValue(initialData?.date),
    });
  }

  // Reset form on open (for create mode)
  useEffect(() => {
    if (isOpen && !initialData) {
      setForm({ name: "", date: "" });
      setErrorMsg(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await onSubmit({ name: form.name, date: form.date });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      {/* Icon header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
          <svg
            className="h-5 w-5 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isEdit ? "Edit Hari Libur" : "Tambah Hari Libur"}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isEdit
              ? `Perbarui data "${initialData?.name}"`
              : "Tambah hari libur secara manual"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Hari Libur */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Hari Libur <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Hari Kemerdekaan"
            className={inputCls}
          />
        </div>

        {/* Tanggal */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={inputCls}
          />
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {loading
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Sync Confirm Modal ────────────────────────────────────────
function SyncConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
          <svg
            className="h-7 w-7 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>

        <div>
          <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
            Sinkronisasi Data Hari Libur
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seluruh data hari libur yang ada akan{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              dihapus dan digantikan
            </span>{" "}
            dengan data terbaru dari sumber eksternal. Tindakan ini tidak bisa
            dibatalkan.
          </p>
        </div>

        <div className="flex w-full gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
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
                Menyinkronkan...
              </span>
            ) : (
              "Ya, Sinkronkan"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ManajemenLibur() {
  const {
    holidays,
    meta,
    loading,
    error,
    syncing,
    fetchAll,
    create,
    update,
    remove,
    sync,
  } = useHolidays();

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PublicHoliday | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PublicHoliday | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [syncOpen, setSyncOpen] = useState(false);

  // Year filter state — keep in both state (for controlled select) and ref (for DataTableOnline callback closure)
  const [yearFilter, setYearFilter] = useState<string>("");
  const yearFilterRef = useRef<string>("");

  // Initial fetch
  useEffect(() => {
    fetchAll({ page: 1, limit: 5, search: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (h: PublicHoliday) => {
    setEditTarget(h);
    setFormOpen(true);
  };

  const openDelete = (h: PublicHoliday) => {
    setDeleteTarget(h);
    setDeleteError(null);
  };

  const handleFormSubmit = async (
    data: CreateHolidayInput | UpdateHolidayInput,
  ) => {
    setFormLoading(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data as UpdateHolidayInput);
        toast.success(`Hari libur "${editTarget.name}" berhasil diperbarui.`);
      } else {
        await create(data as CreateHolidayInput);
        toast.success(
          `Hari libur "${(data as CreateHolidayInput).name}" berhasil ditambahkan.`,
        );
      }
      setFormOpen(false);
      setEditTarget(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await remove(deleteTarget.id);
      toast.success(`Hari libur "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Gagal menghapus data.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const inserted = await sync();
      toast.success(`Sinkronisasi berhasil. ${inserted} hari libur disimpan.`);
      setSyncOpen(false);
    } catch {
      // error already toasted by apiClient interceptor
    }
  };

  const handleYearFilter = (year: string) => {
    setYearFilter(year);
    yearFilterRef.current = year;
    fetchAll({
      page: 1,
      limit: meta.limit,
      search: "",
      year: year ? Number(year) : undefined,
    });
  };

  // Generate year options (current year ± 3)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const columns: Column<PublicHoliday>[] = [
    {
      header: "Nama Hari Libur",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Date badge */}
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
            <span className="text-xs font-bold leading-none text-brand-600 dark:text-brand-400">
              {new Date(row.date).toLocaleDateString("id-ID", { day: "2-digit" })}
            </span>
            <span className="text-[9px] font-medium uppercase leading-none text-brand-400 dark:text-brand-500">
              {new Date(row.date).toLocaleDateString("id-ID", { month: "short" })}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(row.date).toLocaleDateString("id-ID", {
                weekday: "long",
              })}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Tanggal",
      render: (row) => (
        <span className="text-sm">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      header: "Tahun",
      width: "w-20",
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {new Date(row.date).getFullYear()}
        </span>
      ),
    },
    {
      header: "Aksi",
      width: "w-36",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => openEdit(row)}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
          >
            Edit
          </button>
          <button
            onClick={() => openDelete(row)}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Manajemen Hari Libur"
        description="Kelola hari libur nasional perusahaan"
      />
      <PageBreadcrumb pageTitle="Manajemen Hari Libur" />

      <div className="space-y-6">
        <ComponentCard
          title="Data Hari Libur"
          desc={`${meta.total} hari libur terdaftar`}
          action={
            <div className="flex items-center gap-2">
              {/* Year filter */}
              <select
                value={yearFilter}
                onChange={(e) => handleYearFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
              >
                <option value="">Semua Tahun</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Sync button */}
              <button
                onClick={() => setSyncOpen(true)}
                disabled={syncing}
                title="Sinkronisasi data dari sumber eksternal (wipe & replace)"
                className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
              >
                <svg
                  className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {syncing ? "Menyinkronkan..." : "Sinkronisasi"}
              </button>

              {/* Add button */}
              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah
              </button>
            </div>
          }
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <DataTableOnline
            columns={columns}
            data={holidays}
            meta={meta}
            loading={loading}
            onQueryChange={(params) => {
              fetchAll({
                ...params,
                year: yearFilterRef.current
                  ? Number(yearFilterRef.current)
                  : undefined,
              });
            }}
            searchPlaceholder="Cari nama hari libur..."
          />
        </ComponentCard>
      </div>

      {/* Form Modal (Create / Edit) */}
      <HolidayFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        loading={formLoading}
      />

      {/* Delete Confirm */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        itemName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        loading={deleteLoading}
        errorMessage={deleteError}
      />

      {/* Sync Confirm */}
      <SyncConfirmModal
        isOpen={syncOpen}
        onClose={() => setSyncOpen(false)}
        onConfirm={handleSync}
        loading={syncing}
      />
    </>
  );
}
