// * Frontend module: karyawan-web/src/pages/admin/MasterDataKeamanan/Rbac.tsx
// & This file defines frontend UI or logic for Rbac.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk Rbac.tsx.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import type { Column } from "../../../components/tables/DataTables/DataTable";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import { Modal } from "../../../components/ui/modal";
import { useRbac } from "../../../hooks/useRbac";
import type { RbacRole } from "../../../types/rbac.types";

function RoleStatusBadge({ role }: { role: RbacRole }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
          role.isActive
            ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
        }`}
      >
        {role.isActive ? "Aktif" : "Nonaktif"}
      </span>
      {role.isSystem && (
        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          Sistem
        </span>
      )}
    </div>
  );
}

function CreateRoleModal({
  isOpen,
  loading,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
    onSubmit: (payload: { name: string; key?: string; canAccessAdmin?: boolean }) => Promise<void>;
  }) {
    const [name, setName] = useState("");
    const [key, setKey] = useState("");
    const [canAccessAdmin, setCanAccessAdmin] = useState(false);

    useEffect(() => {
      if (!isOpen) {
        setName("");
        setKey("");
        setCanAccessAdmin(false);
      }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit({
        name: name.trim(),
        key: key.trim() || undefined,
        canAccessAdmin,
      });
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
        <div className="mb-5 flex flex-col gap-2 text-center sm:text-left">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Buat Role Baru
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Isikan detail role yang ingin dibuat.
          </p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Role <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Admin Divisi"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Key Role
          </label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Contoh: ADMIN_DIVISI"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-400">
            Opsional. Jika kosong, key akan digenerate otomatis.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={canAccessAdmin}
              onChange={(e) => setCanAccessAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            Bisa Akses Admin Web
          </label>
        </div>

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
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}


export default function Rbac() {
  const navigate = useNavigate();
  const {
    roles,
    meta,
    loading,
    error,
    fetchRoles,
    handleQueryChange,
    createRole,
  } = useRbac();

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles({ page: 1, limit: 10, search: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRole = async (payload: { name: string; key?: string; canAccessAdmin?: boolean }) => {
    setSaving(true);
    try {
      await createRole(payload);
      toast.success("Role berhasil dibuat.");
      setCreateOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<RbacRole>[] = [
    {
      header: "Role",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">{row.name}</p>
          <p className="font-mono text-xs text-gray-400">{row.key}</p>
        </div>
      ),
    },
    {
      header: "Pengguna",
      width: "w-28",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {row._count?.users ?? 0}
        </span>
      ),
    },
    {
      header: "Status",
      width: "w-32",
      render: (row) => <RoleStatusBadge role={row} />,
    },
    {
      header: "Aksi",
      width: "w-32",
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/rbac/${row.id}`)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Kelola
        </button>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="RBAC Role Management"
        description="Kelola role, parent resource, dan child permission CRUD+A"
      />
      <PageBreadcrumb pageTitle="RBAC" />

      <div className="space-y-6">
        <ComponentCard
          title="Role Access Control"
          desc={`${meta.total.toLocaleString("id-ID")} role terdaftar`}
        >
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Tambah Role
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <DataTableOnline
            columns={columns}
            data={roles}
            meta={meta}
            loading={loading}
            onQueryChange={handleQueryChange}
            searchPlaceholder="Cari role berdasarkan nama atau key..."
          />
        </ComponentCard>
      </div>

      <CreateRoleModal
        isOpen={createOpen}
        loading={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateRole}
      />
    </>
  );
}
