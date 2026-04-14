import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, {
  Column,
} from "../../../components/tables/DataTables/DataTable";
import { Modal } from "../../../components/ui/modal";
import { useDivisi } from "../../../hooks/useDivisi";
import type {
  CreateDivisionInput,
  Division,
  UpdateDivisionInput,
} from "../../../types/hierarki.types";

// ── Detail Modal ──────────────────────────────────────────────
function DivisiDetailModal({
  division,
  onClose,
}: {
  division: Division | null;
  onClose: () => void;
}) {
  if (!division) return null;

  // Kumpulkan semua karyawan dari seluruh posisi dalam divisi
  const allEmployees = (division.positions ?? []).flatMap(
    (pos) => pos.employees ?? [],
  );
  // Deduplicate by id
  const uniqueEmployees = allEmployees.filter(
    (emp, idx, self) => self.findIndex((e) => e.id === emp.id) === idx,
  );

  return (
    <Modal
      isOpen={!!division}
      onClose={onClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
        {division.name}
      </h3>
      {division.description && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {division.description}
        </p>
      )}

      {/* Info */}
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Manager</p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            {division.manager?.employees?.fullName ?? (
              <span className="italic text-gray-400">Tidak ada</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Jumlah Jabatan
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            {division.positions?.length ?? 0} jabatan
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Total Karyawan
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            {uniqueEmployees.length} orang
          </p>
        </div>
      </div>

      {/* Positions list */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Jabatan di Divisi Ini
        </p>
        {division.positions && division.positions.length > 0 ? (
          <ul className="space-y-1.5">
            {division.positions.map((pos) => (
              <li
                key={pos.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-white/[0.06]"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {pos.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {pos.employees?.length ?? 0} karyawan
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-gray-400 dark:text-gray-500">
            Belum ada jabatan di divisi ini.
          </p>
        )}
      </div>

      {/* Employee list */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Semua Karyawan di Divisi Ini
        </p>
        {uniqueEmployees.length > 0 ? (
          <ul className="max-h-48 space-y-1.5 overflow-y-auto">
            {uniqueEmployees.map((emp) => (
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
            Belum ada karyawan di divisi ini.
          </p>
        )}
      </div>
    </Modal>
  );
}

// ── Form Modal (Create / Edit) ────────────────────────────────
interface DivisiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDivisionInput | UpdateDivisionInput) => Promise<void>;
  initialData?: Division | null;
  loading?: boolean;
  errorMessage?: string | null;
}

function DivisiFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  errorMessage,
}: DivisiFormModalProps) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    managerId: initialData?.managerId ?? "",
  });

  const [lastId, setLastId] = useState<string | undefined>(initialData?.id);
  if (initialData?.id !== lastId) {
    setLastId(initialData?.id);
    setForm({
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      managerId: initialData?.managerId ?? "",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateDivisionInput | UpdateDivisionInput = {
      name: form.name,
      description: form.description || undefined,
      managerId: form.managerId || (isEdit ? null : undefined),
    };
    await onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
        {isEdit ? "Edit Divisi" : "Tambah Divisi"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Divisi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Human Resources"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Deskripsi
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Deskripsi singkat tentang divisi ini (opsional)"
            className="w-full resize-none rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
          />
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
export default function Divisi() {
  const navigate = useNavigate();
  const { divisions, loading, error, create, update, remove } = useDivisi();

  // Detail modal state
  const [detailDivision, setDetailDivision] = useState<Division | null>(null);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Division | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Division | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (div: Division) => {
    setEditTarget(div);
    setFormError(null);
    setFormOpen(true);
  };

  const openDelete = (div: Division) => {
    setDeleteTarget(div);
    setDeleteError(null);
  };

  const handleFormSubmit = async (
    data: CreateDivisionInput | UpdateDivisionInput,
  ) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editTarget) {
        await update(editTarget.id, data as UpdateDivisionInput);
        toast.success(`Divisi "${editTarget.name}" berhasil diperbarui.`);
      } else {
        await create(data as CreateDivisionInput);
        toast.success(
          `Divisi "${(data as CreateDivisionInput).name}" berhasil ditambahkan.`,
        );
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
      toast.success(`Divisi "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus data.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Division>[] = [
    {
      header: "Nama Divisi",
      accessor: "name",
    },
    {
      header: "Deskripsi",
      render: (row) =>
        row.description ? (
          <span className="line-clamp-1">{row.description}</span>
        ) : (
          <span className="italic text-gray-400">—</span>
        ),
    },
    {
      header: "Manager",
      render: (row) =>
        row.manager?.employees?.fullName ?? (
          <span className="italic text-gray-400">—</span>
        ),
    },
    {
      header: "Jabatan",
      width: "w-24",
      render: (row) => `${row.positions?.length ?? 0} jabatan`,
    },
    {
      header: "Karyawan",
      width: "w-24",
      render: (row) => {
        const total = (row.positions ?? []).reduce(
          (acc, pos) => acc + (pos.employees?.length ?? 0),
          0,
        );
        return `${total} orang`;
      },
    },
    {
      header: "Aksi",
      width: "w-64",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              navigate(`/admin/penilaian-per-divisi/${row.id}/dashboard`, {
                state: { divisionName: row.name },
              })
            }
            className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10"
          >
            Penilaian
          </button>
          <button
            onClick={() => setDetailDivision(row)}
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
      <PageMeta title="Divisi" description="Manajemen data divisi perusahaan" />
      <PageBreadcrumb pageTitle="Divisi" />
      <div className="space-y-6">
        <ComponentCard
          title="Data Divisi"
          desc={`${divisions.length} divisi terdaftar`}
          action={
            // Header actions */}
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
                Tambah Divisi
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
              data={divisions}
              pageSize={10}
              searchKeys={["name"]}
            />
          )}
        </ComponentCard>
      </div>

      {/* Detail Modal */}
      <DivisiDetailModal
        division={detailDivision}
        onClose={() => setDetailDivision(null)}
      />

      {/* Form Modal */}
      <DivisiFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
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
