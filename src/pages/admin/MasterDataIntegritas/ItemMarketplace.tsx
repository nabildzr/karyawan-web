import { Package, Plus } from "lucide-react";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import {
  ItemMarketplaceSummaryCards,
  MarketplaceItemCard,
} from "./ItemMarketplace/components";
import {
  CONDITION_FIELD_OPTIONS,
  ITEM_TYPES,
  STATUS_VALUE_OPTIONS,
} from "./ItemMarketplace/constants";
import { useItemMarketplacePage } from "./ItemMarketplace/hooks";
import {
  computeHighestPointCost,
  computeLowestPointCost,
  formatDateTimeLocal,
  parseDateTimeLocal,
} from "./ItemMarketplace/utils";

export default function ItemMarketplace() {
  const {
    safeItems,
    loading,
    error,
    showModal,
    setShowModal,
    editingItem,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    deleteError,
    setDeleteError,
    form,
    setForm,
    saving,
    currentPage,
    totalItems,
    totalPages,
    tokenExpiryPreview,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
    handleOpenDelete,
    handleDelete,
    handlePageChange,
  } = useItemMarketplacePage();

  const lowestPointCost = computeLowestPointCost(safeItems);
  const highestPointCost = computeHighestPointCost(safeItems);

  return (
    <>
      <PageMeta
        title="Item Marketplace"
        description="Kelola katalog item penukaran poin integritas"
      />
      <PageBreadcrumb pageTitle="Item Marketplace" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Item Marketplace
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola katalog token kelonggaran yang dapat ditukar karyawan.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30"
          >
            <Plus size={18} />
            Tambah Item
          </button>
        </div>

        <ItemMarketplaceSummaryCards
          totalItems={totalItems}
          lowestPointCost={lowestPointCost}
          highestPointCost={highestPointCost}
        />

        {error && (
          <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        ) : safeItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {safeItems.map((item, index) => (
              <MarketplaceItemCard
                key={item.id}
                item={item}
                index={index}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Belum ada item marketplace
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400"
            >
              Sebelumnya
            </button>
            <span className="flex items-center px-3 text-sm text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        className="max-w-lg p-6 sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingItem ? "Edit" : "Tambah"} Item Marketplace
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Konfigurasi item yang dapat ditukar dengan poin integritas
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Item
            </label>
            <input
              type="text"
              value={form.itemName}
              onChange={(event) =>
                setForm({ ...form, itemName: event.target.value })
              }
              placeholder="Contoh: Work from Home 1 Hari"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Harga Poin
              </label>
              <input
                type="number"
                value={form.pointCost}
                onChange={(event) =>
                  setForm({
                    ...form,
                    pointCost: parseInt(event.target.value, 10) || 0,
                  })
                }
                min={1}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipe Item
              </label>
              <select
                value={form.itemType}
                onChange={(event) =>
                  setForm({ ...form, itemType: event.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {ITEM_TYPES.map((itemType) => (
                  <option key={itemType.value} value={itemType.value}>
                    {itemType.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durasi (Hari)
              </label>
              <input
                type="number"
                value={form.durationDays}
                onChange={(event) =>
                  setForm({
                    ...form,
                    durationDays: parseInt(event.target.value, 10) || 1,
                  })
                }
                min={1}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maks per Bulan
              </label>
              <input
                type="number"
                value={form.maxPerMonth ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    maxPerMonth: event.target.value
                      ? parseInt(event.target.value, 10) || null
                      : null,
                  })
                }
                min={1}
                placeholder="Kosong = tanpa batas"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Condition Field
              </label>
              <select
                value={form.conditionField ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    conditionField: event.target.value
                      ? (event.target.value as typeof form.conditionField)
                      : null,
                    conditionValue: event.target.value ? form.conditionValue : "",
                  })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {CONDITION_FIELD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {form.conditionField &&
                (() => {
                  const selectedOption = CONDITION_FIELD_OPTIONS.find(
                    (option) => option.value === form.conditionField,
                  );
                  return selectedOption && "hint" in selectedOption ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedOption.hint}
                    </p>
                  ) : null;
                })()}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Condition Value
              </label>

              {form.conditionField === "attendance.status" ? (
                <select
                  value={form.conditionValue ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, conditionValue: event.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Pilih status</option>
                  {STATUS_VALUE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={
                    form.conditionField === "attendance.lateMinutes"
                      ? "number"
                      : "text"
                  }
                  value={form.conditionValue ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, conditionValue: event.target.value })
                  }
                  placeholder={
                    form.conditionField === "attendance.lateMinutes"
                      ? "Contoh: 15 (menit)"
                      : "Kosongkan jika tanpa auto-apply"
                  }
                  min={
                    form.conditionField === "attendance.lateMinutes"
                      ? 1
                      : undefined
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              )}

              {form.conditionField === "attendance.status" && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  ABSENT {"->"} LEAVE, LATE {"->"} PRESENT saat token dipakai.
                </p>
              )}
              {!form.conditionField && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Token tidak akan otomatis dipakai saat absensi.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL Ikon (opsional)
            </label>
            <input
              type="url"
              value={form.iconUrl ?? ""}
              onChange={(event) =>
                setForm({ ...form, iconUrl: event.target.value })
              }
              placeholder="https://... (URL gambar dari Cloudinary, dsb)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Listing Kedaluwarsa (opsional)
            </label>
            <input
              type="datetime-local"
              value={formatDateTimeLocal(form.expiredAt)}
              onChange={(event) =>
                setForm({
                  ...form,
                  expiredAt: parseDateTimeLocal(event.target.value),
                })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Jika terisi, item otomatis tidak tampil di marketplace setelah
              waktu ini.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deskripsi
            </label>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Deskripsi item..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
            Perkiraan token dari item ini akan kedaluwarsa:
            <span className="font-semibold"> {tokenExpiryPreview}</span>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Item aktif (tampil di marketplace jika belum expired)
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Item"}
          </button>
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        itemName={deleteTarget?.itemName ?? ""}
        onConfirm={handleDelete}
        loading={deleteLoading}
        errorMessage={deleteError}
      />
    </>
  );
}
