import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePointRules } from "../../../../../hooks/useIntegrity";
import { rbacService } from "../../../../../services/rbac.service";
import type {
  CreatePointRuleInput,
  PointRule,
  UpdatePointRuleInput,
} from "../../../../../types/integrity.types";
import type { TargetRoleOption } from "../types";
import {
  CONDITION_FIELDS,
  CONDITION_OPS,
  EMPTY_FORM,
  FALLBACK_TARGET_ROLES,
} from "../utils/constants";
import {
  buildConditionNarrative,
  buildPageNumbers,
  buildPointActionMeta,
  getConditionFieldConfig,
  mapRbacRolesToTargetOptions,
  normalizeBooleanValue,
  normalizeConditionValue,
  normalizeRoleValue,
  toRoleLabel,
  validateConditionValue,
} from "../utils/utils";

const PAGE_LIMIT = 10;

export function useAturanPoinPage() {
  const { rules, meta, loading, error, fetchAll, create, update, remove } =
    usePointRules();

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PointRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PointRule | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePointRuleInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState("*");
  const [currentPage, setCurrentPage] = useState(1);
  const [rbacRoles, setRbacRoles] = useState<TargetRoleOption[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);

  const safeRules = useMemo(() => (Array.isArray(rules) ? rules : []), [rules]);

  const targetRoleOptions = useMemo(() => {
    const fromRbac =
      rbacRoles.length > 0
        ? rbacRoles
        : FALLBACK_TARGET_ROLES.filter((role) => role.value !== "*");

    const existingRoleSet = new Set(fromRbac.map((role) => role.value));
    const legacyRuleRoles = Array.from(
      new Set(
        safeRules
          .map((rule) => normalizeRoleValue(String(rule.targetRole || "")))
          .filter((value) => value && value !== "*"),
      ),
    )
      .filter((value) => !existingRoleSet.has(value))
      .map((value) => ({
        value,
        label: toRoleLabel(value),
      }));

    return [{ value: "*", label: "Semua" }, ...fromRbac, ...legacyRuleRoles];
  }, [rbacRoles, safeRules]);

  const targetRoleLabelMap = useMemo(
    () => new Map(targetRoleOptions.map((role) => [role.value, role.label])),
    [targetRoleOptions],
  );

  const resolveTargetRoleLabel = useCallback(
    (value: string) => {
      const normalized = normalizeRoleValue(value || "*");
      if (normalized === "*") return "Semua";
      return targetRoleLabelMap.get(normalized) ?? toRoleLabel(normalized);
    },
    [targetRoleLabelMap],
  );

  const selectedConditionField = getConditionFieldConfig(form.conditionField);
  const allowedConditionOps = selectedConditionField
    ? CONDITION_OPS.filter((op) =>
        selectedConditionField.allowedOps.includes(op.value),
      )
    : CONDITION_OPS;

  const isBetweenCondition = form.conditionOp === "BETWEEN";
  const isBooleanCondition = selectedConditionField?.valueType === "boolean";
  const isTimeCondition = selectedConditionField?.valueType === "time";
  const isNumberCondition = selectedConditionField?.valueType === "number";

  const selectedTargetRoleLabel = resolveTargetRoleLabel(form.targetRole);
  const conditionNarrative = buildConditionNarrative(
    selectedConditionField,
    form.conditionOp,
    form.conditionValue,
  );
  const pointActionMeta = buildPointActionMeta(form.pointModifier);
  const targetRoleNarrative =
    selectedTargetRoleLabel === "Semua"
      ? "seluruh role dalam cakupan aturan"
      : `role ${selectedTargetRoleLabel}`;
  const canShowNarrativePreview =
    !!selectedConditionField && !!form.conditionValue.trim();

  const fetchTargetRoles = useCallback(async () => {
    setRoleLoading(true);
    try {
      const result = await rbacService.getRoles({ page: 1, limit: 100 });
      setRbacRoles(mapRbacRolesToTargetOptions(result.data));
    } catch (err) {
      console.warn("[AturanPoin] Gagal mengambil role dari RBAC:", err);
      setRbacRoles([]);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTargetRoles();
  }, [fetchTargetRoles]);

  useEffect(() => {
    setCurrentPage(1);
    fetchAll({ page: 1, limit: PAGE_LIMIT, targetRole: activeFilter });
  }, [fetchAll, activeFilter]);

  useEffect(() => {
    if (!targetRoleOptions.some((role) => role.value === activeFilter)) {
      setActiveFilter("*");
    }
  }, [activeFilter, targetRoleOptions]);

  useEffect(() => {
    if (meta?.page && meta.page !== currentPage) {
      setCurrentPage(meta.page);
    }
  }, [meta?.page, currentPage]);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (rule: PointRule) => {
    const ruleConfig = getConditionFieldConfig(rule.conditionField);
    const nextOp = ruleConfig?.allowedOps.includes(rule.conditionOp)
      ? rule.conditionOp
      : (ruleConfig?.allowedOps[0] ?? rule.conditionOp);

    setEditingRule(rule);
    setForm({
      ruleName: rule.ruleName,
      targetRole: normalizeRoleValue(rule.targetRole || "*"),
      conditionField: rule.conditionField,
      conditionOp: nextOp,
      conditionValue: normalizeConditionValue(
        rule.conditionField,
        rule.conditionValue,
        nextOp,
      ),
      pointModifier: rule.pointModifier,
      description: rule.description ?? "",
    });
    setShowModal(true);
  };

  const handleConditionFieldChange = (fieldValue: string) => {
    const config = getConditionFieldConfig(fieldValue);

    setForm((prev) => {
      if (!config) {
        return {
          ...prev,
          conditionField: fieldValue,
        };
      }

      const nextOp = config.allowedOps.includes(prev.conditionOp)
        ? prev.conditionOp
        : config.allowedOps[0];

      let nextValue = normalizeConditionValue(
        fieldValue,
        prev.conditionValue,
        nextOp,
      );

      if (config.valueType === "boolean") {
        nextValue = normalizeBooleanValue(nextValue) ?? "true";
      }

      return {
        ...prev,
        conditionField: fieldValue,
        conditionOp: nextOp,
        conditionValue: nextValue,
      };
    });
  };

  const handleConditionOpChange = (opValue: string) => {
    setForm((prev) => ({
      ...prev,
      conditionOp: opValue,
      conditionValue: normalizeConditionValue(
        prev.conditionField,
        prev.conditionValue,
        opValue,
      ),
    }));
  };

  const handleSave = async () => {
    if (!form.ruleName || !form.conditionField || !form.conditionValue) {
      toast.error("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    const normalizedConditionValue = normalizeConditionValue(
      form.conditionField,
      form.conditionValue,
      form.conditionOp,
    );
    const conditionValidationError = validateConditionValue(
      form.conditionField,
      form.conditionOp,
      normalizedConditionValue,
    );

    if (conditionValidationError) {
      toast.error(conditionValidationError);
      return;
    }

    const payload: CreatePointRuleInput = {
      ...form,
      targetRole:
        form.targetRole === "*" ? "*" : normalizeRoleValue(form.targetRole),
      conditionValue: normalizedConditionValue,
    };

    setSaving(true);
    try {
      if (editingRule) {
        await update(editingRule.id, payload as UpdatePointRuleInput);
        toast.success("Aturan poin berhasil diperbarui.");
      } else {
        await create(payload);
        toast.success("Aturan poin berhasil ditambahkan.");
      }
      setShowModal(false);
    } catch {
      toast.error("Gagal menyimpan aturan poin.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (rule: PointRule) => {
    setDeleteTarget(rule);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await remove(deleteTarget.id);
      toast.success(`Aturan poin "${deleteTarget.ruleName}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus aturan poin.";
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAll({ page, limit: PAGE_LIMIT, targetRole: activeFilter });
  };

  const filteredRules =
    activeFilter === "*"
      ? safeRules
      : safeRules.filter(
          (rule) =>
            normalizeRoleValue(String(rule.targetRole || "")) === activeFilter ||
            rule.targetRole === "*",
        );

  const totalActive = safeRules.filter((rule) => rule.isActive).length;
  const totalDistributed = safeRules.reduce(
    (sum, rule) => sum + Math.abs(rule.pointModifier),
    0,
  );
  const totalRules = meta?.total ?? safeRules.length;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(totalRules / PAGE_LIMIT));
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return {
    conditionFields: CONDITION_FIELDS,
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
    limit: PAGE_LIMIT,
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
  };
}