import { ChevronDown, Edit2, Filter, Plus, Trash2 } from "lucide-react";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import {
  AturanPoinBottomCards,
  AturanPoinSummaryCards,
} from "./AturanPoin/components";
import { BOOLEAN_VALUE_OPTIONS } from "./AturanPoin/constants";
import { useAturanPoinPage } from "./AturanPoin/hooks";

export default function AturanPoin() {
  const {
    conditionFields,
    filteredRules,
    loading,
    error,
    showModal,
    setShowModal,
    editingRule,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    deleteError,
    setDeleteError,
    form,
    setForm,
    saving,
    activeFilter,
    setActiveFilter,
    roleLoading,
    targetRoleOptions,
    resolveTargetRoleLabel,
    selectedConditionField,
    allowedConditionOps,
    isBetweenCondition,
    isBooleanCondition,
    isTimeCondition,
    isNumberCondition,
    canShowNarrativePreview,
    conditionNarrative,
    pointActionMeta,
    targetRoleNarrative,
    currentPage,
    totalPages,
    pageNumbers,
    limit,
    totalRules,
    totalActive,
    totalDistributed,
    safeRules,
    handleOpenCreate,
    handleOpenEdit,
    handleConditionFieldChange,
    handleConditionOpChange,
    handleSave,
    handleOpenDelete,
    handleDelete,
    handlePageChange,
    normalizeRoleValue,
  } = useAturanPoinPage();

  return (
    <>
      <PageMeta
        title="Manajemen Aturan Poin"
        description="Konfigurasi parameter integritas dan perhitungan poin otomatis"
      />
      <PageBreadcrumb pageTitle="Aturan Poin" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manajemen Aturan Poin
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Konfigurasi parameter integritas dan perhitungan poin otomatis.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30"
          >
            <Plus size={18} />
            Tambah Aturan Baru
          </button>
        </div>

        <AturanPoinSummaryCards
          totalRules={totalRules}
          totalActive={totalActive}
          totalDistributed={totalDistributed}
        />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Daftar Aturan Aktif
              </h3>
              <div className="ml-4 flex flex-wrap gap-1">
                {targetRoleOptions.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setActiveFilter(role.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === role.value
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {role.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-600 dark:text-gray-400">
              <Filter size={14} />
              {roleLoading ? "Memuat role..." : "Filter role"}
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Rule Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Target
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Logic Condition
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Modifier
                  </th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skel-${index}`}>
                      {Array.from({ length: 5 }).map((__, innerIndex) => (
                        <td key={innerIndex} className="px-6 py-4">
                          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRules.length > 0 ? (
                  filteredRules.map((rule) => (
                    <tr
                      key={rule.id}
                      className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {rule.ruleName}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {rule.description || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            rule.targetRole === "*"
                              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                              : "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                          }`}
                        >
                          {rule.targetRole === "*"
                            ? "SEMUA"
                            : resolveTargetRoleLabel(
                                normalizeRoleValue(rule.targetRole),
                              ).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {rule.conditionField} {rule.conditionOp} "{rule.conditionValue}"
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-bold ${
                            rule.pointModifier > 0
                              ? "text-success-600 dark:text-success-400"
                              : "text-error-600 dark:text-error-400"
                          }`}
                        >
                          {rule.pointModifier > 0 ? "+" : ""}
                          {rule.pointModifier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(rule)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(rule)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-400 dark:text-gray-500"
                    >
                      Tidak ada aturan poin ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {totalRules ? (currentPage - 1) * limit + 1 : 0}
              </span>
              {" - "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {Math.min(currentPage * limit, totalRules)}
              </span>
              {" dari "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {totalRules}
              </span>
              {" Aturan Poin"}
            </p>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {pageNumbers.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-brand-500 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>

        <AturanPoinBottomCards rulesCount={safeRules.length} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        className="max-w-lg p-6 sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingRule ? "EDIT" : "CREATE"} Point Rule
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Konfigurasi otomasisasi perhitungan poin integritas
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Aturan
            </label>
            <input
              type="text"
              value={form.ruleName}
              onChange={(event) =>
                setForm({ ...form, ruleName: event.target.value })
              }
              placeholder="Contoh: Datang Pagi Banget"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              JIKA (CONDITION)
            </label>
            <div className="relative">
              <select
                value={form.conditionField}
                onChange={(event) =>
                  handleConditionFieldChange(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Pilih Trigger Kondisi...</option>
                {conditionFields.map((conditionField) => (
                  <option key={conditionField.value} value={conditionField.value}>
                    {conditionField.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Operator
              </label>
              <select
                value={form.conditionOp}
                onChange={(event) => handleConditionOpChange(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {allowedConditionOps.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nilai
              </label>
              {isBooleanCondition ? (
                <select
                  value={form.conditionValue || "true"}
                  onChange={(event) =>
                    setForm({ ...form, conditionValue: event.target.value })
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {BOOLEAN_VALUE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : isTimeCondition && !isBetweenCondition ? (
                <input
                  type="time"
                  step={60}
                  value={form.conditionValue}
                  onChange={(event) =>
                    setForm({ ...form, conditionValue: event.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              ) : isNumberCondition && !isBetweenCondition ? (
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.conditionValue}
                  onChange={(event) =>
                    setForm({ ...form, conditionValue: event.target.value })
                  }
                  placeholder={selectedConditionField?.placeholder ?? "0"}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              ) : (
                <input
                  type="text"
                  value={form.conditionValue}
                  onChange={(event) =>
                    setForm({ ...form, conditionValue: event.target.value })
                  }
                  placeholder={
                    isBetweenCondition
                      ? (selectedConditionField?.betweenPlaceholder ?? "min,max")
                      : (selectedConditionField?.placeholder ?? "Isi nilai kondisi")
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              )}
              {selectedConditionField && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {selectedConditionField.valueType === "time" && !isBetweenCondition
                    ? "Format jam: HH:mm"
                    : selectedConditionField.valueType === "time" && isBetweenCondition
                      ? "Format BETWEEN jam: HH:mm,HH:mm"
                      : selectedConditionField.valueType === "number" && isBetweenCondition
                        ? "Format BETWEEN angka: min,max"
                        : selectedConditionField.valueType === "number"
                          ? "Nilai harus angka bulat >= 0"
                          : "Nilai boolean: true atau false"}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              MAKA POIN (ACTION)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.pointModifier}
                onChange={(event) =>
                  setForm({
                    ...form,
                    pointModifier: parseInt(event.target.value, 10) || 0,
                  })
                }
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <span className="text-sm font-medium text-gray-500">POIN</span>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, pointModifier: form.pointModifier + 1 })
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                +
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, pointModifier: form.pointModifier - 1 })
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                -
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Role
            </label>
            <select
              value={form.targetRole}
              onChange={(event) =>
                setForm({ ...form, targetRole: event.target.value })
              }
              className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {targetRoleOptions.map((targetRoleOption) => (
                <option key={targetRoleOption.value} value={targetRoleOption.value}>
                  {targetRoleOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              Pratinjau Narasi Aturan
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
              {canShowNarrativePreview ? (
                <>
                  Ketika {conditionNarrative}, sistem akan menerapkan dampak
                  <span className={`font-bold ${pointActionMeta.toneClassName}`}>
                    {pointActionMeta.label}
                  </span>
                  untuk {targetRoleNarrative}, sehingga proses evaluasi
                  integritas menjadi lebih konsisten dan
                  {pointActionMeta.impactNarrative}.
                </>
              ) : (
                "Lengkapi kondisi dan nilai aturan untuk melihat narasi otomatis yang menjelaskan dampak poin integritas."
              )}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              KETERANGAN ATURAN
            </label>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Contoh: Memberikan reward bagi karyawan yang disiplin..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Save Rule"}
          </button>
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        itemName={deleteTarget?.ruleName ?? ""}
        onConfirm={handleDelete}
        loading={deleteLoading}
        errorMessage={deleteError}
      />
    </>
  );
}
