import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useFlexibilityItems } from "../../../../../hooks/useIntegrity";
import type {
    CreateFlexibilityItemInput,
    FlexibilityItem,
    UpdateFlexibilityItemInput,
} from "../../../../../types/integrity.types";
import { EMPTY_FORM, MARKETPLACE_PAGE_LIMIT } from "../utils/constants";

export function useItemMarketplacePage() {
  const { items, meta, loading, error, fetchAll, create, update, remove } =
    useFlexibilityItems();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FlexibilityItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlexibilityItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFlexibilityItemInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const safeItems = Array.isArray(items) ? items : [];

  useEffect(() => {
    fetchAll({ page: 1, limit: MARKETPLACE_PAGE_LIMIT });
  }, [fetchAll]);

  useEffect(() => {
    if (meta?.page && meta.page !== currentPage) {
      setCurrentPage(meta.page);
    }
  }, [meta?.page, currentPage]);

  const tokenExpiryPreview = useMemo(() => {
    const durationDays = Number(form.durationDays || 0);
    if (!Number.isInteger(durationDays) || durationDays <= 0) {
      return "Durasi belum valid";
    }

    const preview = new Date();
    preview.setDate(preview.getDate() + durationDays);
    return preview.toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });
  }, [form.durationDays]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (item: FlexibilityItem) => {
    setEditingItem(item);
    setForm({
      itemName: item.itemName,
      pointCost: item.pointCost,
      itemType: item.itemType,
      durationDays: item.durationDays,
      maxPerMonth: item.maxPerMonth,
      conditionField: item.conditionField,
      conditionValue: item.conditionValue ?? "",
      expiredAt: item.expiredAt,
      description: item.description ?? "",
      iconUrl: item.iconUrl ?? "",
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.itemName.trim() || form.pointCost <= 0) {
      toast.error("Nama item dan harga poin wajib diisi.");
      return;
    }

    if (!Number.isInteger(form.durationDays) || form.durationDays <= 0) {
      toast.error("Durasi token harus berupa angka bulat lebih dari 0.");
      return;
    }

    if (
      form.maxPerMonth != null &&
      (!Number.isInteger(form.maxPerMonth) || form.maxPerMonth <= 0)
    ) {
      toast.error("Maksimal pembelian per bulan harus angka bulat lebih dari 0.");
      return;
    }

    if (form.conditionField && !form.conditionValue?.trim()) {
      toast.error("conditionValue wajib diisi jika conditionField dipilih.");
      return;
    }

    if (form.conditionField === "attendance.lateMinutes") {
      const lateLimit = Number(form.conditionValue);
      if (!Number.isInteger(lateLimit) || lateLimit <= 0) {
        toast.error("conditionValue untuk lateMinutes harus angka bulat > 0.");
        return;
      }
    }

    if (form.conditionField === "attendance.status") {
      const normalized = String(form.conditionValue || "")
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean);

      if (
        !normalized.length ||
        normalized.some((value) => !["LATE", "ABSENT"].includes(value))
      ) {
        toast.error("conditionValue status hanya mendukung LATE atau ABSENT.");
        return;
      }
    }

    if (form.expiredAt && Number.isNaN(new Date(form.expiredAt).getTime())) {
      toast.error("Tanggal kedaluwarsa listing tidak valid.");
      return;
    }

    const payload: CreateFlexibilityItemInput = {
      itemName: form.itemName.trim(),
      pointCost: form.pointCost,
      itemType: form.itemType,
      durationDays: form.durationDays,
      maxPerMonth: form.maxPerMonth ?? null,
      conditionField: form.conditionField ?? null,
      conditionValue: form.conditionField
        ? String(form.conditionValue || "").trim().toUpperCase()
        : null,
      expiredAt: form.expiredAt ?? null,
      description: form.description?.trim() || "",
      iconUrl: form.iconUrl?.trim() || "",
      isActive: form.isActive ?? true,
    };

    setSaving(true);
    try {
      if (editingItem) {
        await update(editingItem.id, payload as UpdateFlexibilityItemInput);
        toast.success("Item marketplace berhasil diperbarui.");
      } else {
        await create(payload);
        toast.success("Item marketplace berhasil ditambahkan.");
      }
      setShowModal(false);
    } catch {
      toast.error("Gagal menyimpan item marketplace.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (item: FlexibilityItem) => {
    setDeleteTarget(item);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await remove(deleteTarget.id);
      toast.success(`Item "${deleteTarget.itemName}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus item.";
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, page);
    setCurrentPage(nextPage);
    fetchAll({ page: nextPage, limit: MARKETPLACE_PAGE_LIMIT });
  };

  const totalItems = meta?.total ?? safeItems.length;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / MARKETPLACE_PAGE_LIMIT));

  return {
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
  };
}