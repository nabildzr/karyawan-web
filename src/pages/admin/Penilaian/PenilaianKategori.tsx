import { useEffect, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import { useAssessments } from "../../../hooks/useAssessments";
import type { AssessmentCategory, CreateCategoryInput, UpdateCategoryInput } from "../../../types/assessments.types";

// ── Helpers ───────────────────────────────────────────────────
const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Form Modal ────────────────────────────────────────────────
function CategoryFormModal({
  isOpen,
  onClose,
  existing,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  existing: AssessmentCategory | null;
  onSave: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(existing?.name ?? "");
      setDescription(existing?.description ?? "");
      setType(existing?.type ?? "");
      setIsActive(existing?.isActive ?? true);
      setIsVisible(existing?.isVisibleToEmployee ?? true);
    }
  }, [isOpen, existing]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Nama kategori wajib diisi."); return; }
    setSaving(true);
    try {
      await onSave({ name, description: description || null, type: type || null, isActive, isVisibleToEmployee: isVisible });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <h3 className="mb-5 text-base font-semibold text-gray-800 dark:text-white">
        {existing ? "Edit Kategori" : "Tambah Kategori Baru"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Nama Kategori *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Kedisiplinan" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Deskripsi</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat kategori..." className={`${inputCls} resize-none`} />
        </div>
       
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded accent-brand-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Aktif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-4 w-4 rounded accent-brand-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Tampilkan ke karyawan</span>
          </label>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} disabled={saving} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Batal
        </button>
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
          {saving ? "Menyimpan..." : (existing ? "Simpan Perubahan" : "Tambah Kategori")}
        </button>
      </div>
    </Modal>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────
function ConfirmDeleteModal({
  category,
  onClose,
  onConfirm,
}: {
  category: AssessmentCategory | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => {
    setDeleting(true);
    try { await onConfirm(); onClose(); }
    finally { setDeleting(false); }
  };
  return (
    <Modal isOpen={!!category} onClose={onClose} className="max-w-sm p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
        <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">Hapus Kategori?</h3>
      <p className="mb-1 text-sm text-gray-500">Kategori <strong className="text-gray-700 dark:text-gray-300">{category?.name}</strong> akan dihapus permanen.</p>
      <p className="text-xs text-amber-600 dark:text-amber-400">Jika sudah dipakai dalam penilaian, gunakan Nonaktifkan saja.</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} disabled={deleting} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Batal
        </button>
        <button onClick={handleConfirm} disabled={deleting} className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50">
          {deleting ? "Menghapus..." : "Ya, Hapus"}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
type Filter = "all" | "active" | "inactive";

export default function PenilaianKategori() {
  const { categories, categoryStats, categoriesLoading, fetchCategories, createCategory, updateCategory, deleteCategory, toggleActive } = useAssessments();

  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AssessmentCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssessmentCategory | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const isActive = filter === "all" ? undefined : filter === "active" ? "true" : "false";
    fetchCategories(isActive ? { isActive } : {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleToggle = async (cat: AssessmentCategory) => {
    setToggling(cat.id);
    try { await toggleActive(cat.id, !cat.isActive); }
    finally { setToggling(null); }
  };

  return (
    <>
      <PageMeta title="Penilaian Kategori" description="Kelola kategori indikator penilaian karyawan" />
      <PageBreadcrumb pageTitle="Penilaian Kategori" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Evaluation Categories</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and organize your HR performance indicators across distinct categories.
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setFormOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Tambah Indikator Baru
          </button>
        </div>

        {/* Table card */}
        <ComponentCard title="">
          {/* Tabs */}
          <div className="mb-5 flex gap-1 border-b border-gray-100 dark:border-gray-800">
            {(["all", "active", "inactive"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${filter === f ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
                {f === "all" ? "All Categories" : f === "active" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-100 pb-3 dark:border-gray-800">
            <div className="col-span-5 text-xs font-semibold uppercase tracking-wider text-gray-400">Category Name</div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Type</div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</div>
            <div className="col-span-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</div>
          </div>

          {categoriesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">Tidak ada kategori ditemukan.</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {categories.map((cat) => (
                <div key={cat.id} className="grid grid-cols-12 items-center gap-4 py-4">
                  {/* Name */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                      <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-400 line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{cat.type || "—"}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cat.isActive ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cat.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    {/* Edit */}
                    <button onClick={() => { setEditTarget(cat); setFormOpen(true); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-brand-500 dark:border-gray-700 dark:hover:bg-gray-800">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>

                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggle(cat)}
                      disabled={toggling === cat.id}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${cat.isActive ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400" : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400"}`}
                    >
                      {toggling === cat.id ? (
                        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      ) : (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
                      )}
                      {cat.isActive ? "Deactivate" : "Activate"}
                    </button>

                    {/* Delete */}
                    <button onClick={() => setDeleteTarget(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:border-gray-700 dark:hover:bg-red-500/10">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ComponentCard>

        {/* Bottom stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Categories</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{categoryStats.totalCategories}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Active Indicators</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{categoryStats.activeIndicators}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Last Update</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{fmtDate(categoryStats.lastUpdate)}</p>
            </div>
          </div>
        </div>
      </div>

      <CategoryFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        existing={editTarget}
        onSave={async (data) => {
          if (editTarget) {
            await updateCategory(editTarget.id, data);
            return;
          }

          await createCategory(data as CreateCategoryInput);
        }}
      />
      <ConfirmDeleteModal
        category={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteCategory(deleteTarget!.id, deleteTarget!.name)}
      />
    </>
  );
}
