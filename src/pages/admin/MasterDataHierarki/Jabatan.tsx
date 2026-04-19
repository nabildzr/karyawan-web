// * Frontend module: karyawan-web/src/pages/admin/MasterDataHierarki/Jabatan.tsx
// & This file defines frontend UI or logic for Jabatan.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk Jabatan.tsx.

import { useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, {
  Column,
} from "../../../components/tables/DataTables/DataTable";
import Badge from "../../../components/ui/badge/Badge";
import { Modal } from "../../../components/ui/modal";
import { useDivisi } from "../../../hooks/useDivisi";
import { useJabatan } from "../../../hooks/useJabatan";
import type { CreatePositionInput, Position } from "../../../types/hierarki.types";

// ── Detail Modal ──────────────────────────────────────────────
function JabatanDetailModal({
  position,
  onClose,
}: {
  position: Position | null;
  onClose: () => void;
}) {
  if (!position) return null;
  return (
    <Modal
      isOpen={!!position}
      onClose={onClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
        {position.name}
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Detail jabatan
      </p>

      {/* Info */}
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Divisi</p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            {position.division?.name ?? (
              <span className="italic text-gray-400">Tidak ada divisi</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Gaji Pokok</p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            {position.gajiPokok.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Tipe</p>
          <div className="mt-1">
            <Badge
              color={position.isManagerial ? "primary" : "light"}
              size="sm"
            >
              {position.isManagerial ? "Manajerial" : "Staf"}
            </Badge>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Jumlah Karyawan
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            {position.employees?.length ?? 0} orang
          </p>
        </div>
      </div>

      {/* Employee list */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Karyawan di Jabatan Ini
        </p>
        {position.employees && position.employees.length > 0 ? (
          <ul className="max-h-52 space-y-1.5 overflow-y-auto">
            {position.employees.map((emp) => (
              <li
                key={emp.id}
                className="rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-white/[0.06] dark:text-gray-300"
              >
                {emp.fullName}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-gray-400 dark:text-gray-500">
            Belum ada karyawan di jabatan ini.
          </p>
        )}
      </div>
    </Modal>
  );
}

// ── Form Modal (Create / Edit) ────────────────────────────────
interface JabatanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePositionInput) => Promise<void>;
  initialData?: Position | null;
  divisiOptions: { id: string; name: string }[];
  loading?: boolean;
  errorMessage?: string | null;
}

function JabatanFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  divisiOptions,
  loading = false,
  errorMessage,
}: JabatanFormModalProps) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<CreatePositionInput>({
    name: initialData?.name ?? "",
    gajiPokok: initialData?.gajiPokok ?? 0,
    isManagerial: initialData?.isManagerial ?? false,
    divisionId: initialData?.divisionId ?? "",
  });

  // Sync form when initialData changes (e.g. opening edit for a different row)
  const [lastId, setLastId] = useState<string | undefined>(initialData?.id);
  if (initialData?.id !== lastId) {
    setLastId(initialData?.id);
    setForm({
      name: initialData?.name ?? "",
      gajiPokok: initialData?.gajiPokok ?? 0,
      isManagerial: initialData?.isManagerial ?? false,
      divisionId: initialData?.divisionId ?? "",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
        {isEdit ? "Edit Jabatan" : "Tambah Jabatan"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Jabatan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Software Engineer"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
          />
        </div>

        {/* Gaji Pokok */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Gaji Pokok <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min={0}
            value={form.gajiPokok}
            onChange={(e) =>
              setForm((f) => ({ ...f, gajiPokok: Number(e.target.value) }))
            }
            placeholder="Contoh: 10000000"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
          />
        </div>

        {/* Divisi */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Divisi <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.divisionId}
            onChange={(e) =>
              setForm((f) => ({ ...f, divisionId: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
          >
            <option value="">-- Pilih Divisi --</option>
            {divisiOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Is Manajerial */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Jabatan Manajerial
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Aktifkan jika ini adalah posisi manajerial
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, isManagerial: !f.isManagerial }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.isManagerial
                ? "bg-brand-500"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.isManagerial ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {errorMessage}
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
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Jabatan() {
  const { positions, loading, error, create, update, remove } = useJabatan();
  const { divisions } = useDivisi();

  // Detail modal state
  const [detailPosition, setDetailPosition] = useState<Position | null>(null);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Position | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (pos: Position) => {
    setEditTarget(pos);
    setFormError(null);
    setFormOpen(true);
  };

  const openDelete = (pos: Position) => {
    setDeleteTarget(pos);
    setDeleteError(null);
  };

  const handleFormSubmit = async (data: CreatePositionInput) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        toast.success(`Jabatan "${editTarget.name}" berhasil diperbarui.`);
      } else {
        await create(data);
        toast.success(`Jabatan "${data.name}" berhasil ditambahkan.`);
      }
      setFormOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan data.";
      setFormError(msg);
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
      toast.success(`Jabatan "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus data.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const divisiOptions = divisions.map((d) => ({ id: d.id, name: d.name }));

  const columns: Column<Position>[] = [
    {
      header: "Nama Jabatan",
      accessor: "name",
    },
    {
      header: "Gaji Pokok",
      render: (row) =>
        row.gajiPokok.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }),
    },
    {
      header: "Tipe",
      width: "w-28",
      render: (row) => (
        <Badge color={row.isManagerial ? "primary" : "light"} size="sm">
          {row.isManagerial ? "Manajerial" : "Staf"}
        </Badge>
      ),
    },
    {
      header: "Divisi",
      render: (row) =>
        row.division?.name ?? <span className="italic text-gray-400">—</span>,
    },
    {
      header: "Karyawan",
      width: "w-24",
      render: (row) => `${row.employees?.length ?? 0} orang`,
    },
    {
      header: "Aksi",
      width: "w-44",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setDetailPosition(row)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Detail
          </button>
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
      <PageMeta title="Jabatan" description="Manajemen data jabatan karyawan" />
      <PageBreadcrumb pageTitle="Jabatan" />
      <div className="space-y-6">
        <ComponentCard
          title="Data Jabatan"
          desc={`${positions.length} jabatan terdaftar`}
          action={
            // Header actions
            <div className=" flex justify-end">
              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
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
                Tambah Jabatan
              </button>
            </div>
          }
        >
          {/* Error state */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={positions}
              pageSize={10}
              searchKeys={["name"]}
            />
          )}
        </ComponentCard>
      </div>

      {/* Detail Modal */}
      <JabatanDetailModal
        position={detailPosition}
        onClose={() => setDetailPosition(null)}
      />

      {/* Form Modal */}
      <JabatanFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        divisiOptions={divisiOptions}
        loading={formLoading}
        errorMessage={formError}
      />

      {/* Delete Modal */}
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
    </>
  );
}
