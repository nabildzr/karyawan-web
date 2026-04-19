import type { RbacRole } from "../../../../../types/rbac.types";
import type {
  ConditionFieldOption,
  PointActionMeta,
  TargetRoleOption,
} from "../types";
import { CONDITION_FIELDS, OPERATOR_SENTENCE_MAP } from "./constants";

export const TIME_HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_HH_MM_SS_REGEX = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

export const toHHmm = (value: string): string => {
  const trimmed = value.trim();
  if (TIME_HH_MM_REGEX.test(trimmed)) return trimmed;
  if (TIME_HH_MM_SS_REGEX.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed;
};

export const normalizeBooleanValue = (value: string): string | null => {
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "ya"].includes(normalized)) return "true";
  if (["false", "0", "no", "tidak"].includes(normalized)) return "false";
  return null;
};

export const getConditionFieldConfig = (
  fieldValue: string,
): ConditionFieldOption | undefined =>
  CONDITION_FIELDS.find((field) => field.value === fieldValue);

export const normalizeConditionValue = (
  fieldValue: string,
  rawValue: string,
  op: string,
): string => {
  const config = getConditionFieldConfig(fieldValue);
  if (!config) return rawValue.trim();

  if (config.valueType === "boolean") {
    return normalizeBooleanValue(rawValue) ?? rawValue.trim().toLowerCase();
  }

  if (config.valueType === "time") {
    if (op === "BETWEEN") {
      const parts = rawValue
        .split(",")
        .map((part) => toHHmm(part))
        .filter(Boolean);
      if (parts.length === 2) return `${parts[0]},${parts[1]}`;
      return rawValue.trim();
    }
    return toHHmm(rawValue);
  }

  return rawValue.trim();
};

export const validateConditionValue = (
  fieldValue: string,
  op: string,
  value: string,
): string | null => {
  const config = getConditionFieldConfig(fieldValue);
  if (!config) return null;

  const normalizedValue = normalizeConditionValue(fieldValue, value, op);

  if (!normalizedValue) {
    return "Mohon isi nilai kondisi terlebih dahulu.";
  }

  if (!config.allowedOps.includes(op)) {
    return `Operator tidak valid untuk ${config.label}.`;
  }

  if (config.valueType === "boolean") {
    if (!["true", "false"].includes(normalizedValue)) {
      return "Untuk status boolean, nilai harus true atau false.";
    }
    return null;
  }

  if (config.valueType === "time") {
    if (op === "BETWEEN") {
      const parts = normalizedValue.split(",").map((part) => part.trim());
      if (
        parts.length !== 2 ||
        !parts.every((part) => TIME_HH_MM_REGEX.test(part))
      ) {
        return "Format jam BETWEEN harus HH:mm,HH:mm (contoh: 07:00,09:00).";
      }
      if (parts[0] > parts[1]) {
        return "Rentang jam tidak valid. Nilai awal harus <= nilai akhir.";
      }
      return null;
    }

    if (!TIME_HH_MM_REGEX.test(normalizedValue)) {
      return "Format jam harus HH:mm (contoh: 07:30).";
    }
    return null;
  }

  if (config.valueType === "number") {
    if (op === "BETWEEN") {
      const parts = normalizedValue.split(",").map((part) => part.trim());
      if (parts.length !== 2 || parts.some((part) => !/^\d+$/.test(part))) {
        return "Format angka BETWEEN harus min,max (contoh: 5,15).";
      }
      const minVal = Number(parts[0]);
      const maxVal = Number(parts[1]);
      if (minVal > maxVal) {
        return "Rentang angka tidak valid. Nilai awal harus <= nilai akhir.";
      }
      return null;
    }

    if (!/^\d+$/.test(normalizedValue)) {
      return "Nilai harus berupa angka bulat >= 0.";
    }
  }

  return null;
};

export const normalizeRoleValue = (value: string) => value.trim().toUpperCase();

export const toRoleLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const mapRbacRolesToTargetOptions = (
  roles: RbacRole[],
): TargetRoleOption[] => {
  const mapped = roles
    .filter((role) => role.isActive)
    .map((role) => {
      const normalizedValue = normalizeRoleValue(String(role.key || ""));
      return {
        value: normalizedValue,
        label: String(role.name || role.key || normalizedValue).trim(),
      };
    })
    .filter((role) => role.value && role.value !== "*");

  return Array.from(new Map(mapped.map((role) => [role.value, role])).values());
};

export const buildConditionNarrative = (
  field: ConditionFieldOption | undefined,
  op: string,
  value: string,
): string => {
  if (!field) return "kondisi yang dipilih";

  const normalizedValue = normalizeConditionValue(field.value, value, op);
  if (!normalizedValue) return `${field.label} belum ditentukan`;

  if (field.valueType === "boolean") {
    const boolLabel = normalizedValue === "true" ? "Ya" : "Tidak";
    return `${field.label} bernilai ${boolLabel}`;
  }

  if (op === "BETWEEN") {
    const [start, end] = normalizedValue.split(",").map((part) => part.trim());
    if (start && end) {
      return `${field.label} berada pada rentang ${start} sampai ${end}`;
    }
  }

  const opNarrative = OPERATOR_SENTENCE_MAP[op] ?? `dengan operator ${op}`;
  return `${field.label} ${opNarrative} ${normalizedValue}`;
};

export const buildPointActionMeta = (pointModifier: number): PointActionMeta => {
  if (pointModifier > 0) {
    return {
      label: `+${pointModifier} poin integritas`,
      toneClassName: "text-success-600 dark:text-success-400",
      impactNarrative: "mendorong budaya disiplin dan perilaku positif",
    };
  }

  if (pointModifier < 0) {
    return {
      label: `-${Math.abs(pointModifier)} poin integritas`,
      toneClassName: "text-error-600 dark:text-error-400",
      impactNarrative: "menjaga kepatuhan serta konsistensi kedisiplinan",
    };
  }

  return {
    label: "0 poin integritas",
    toneClassName: "text-gray-600 dark:text-gray-300",
    impactNarrative: "menjaga stabilitas perhitungan integritas",
  };
};

export const buildPageNumbers = (currentPage: number, totalPages: number) => {
  const pageNumbers: Array<number | "..."> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pageNumbers.push(i);
    return pageNumbers;
  }

  pageNumbers.push(1);
  if (currentPage > 3) pageNumbers.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i += 1) pageNumbers.push(i);
  if (currentPage < totalPages - 2) pageNumbers.push("...");
  pageNumbers.push(totalPages);
  return pageNumbers;
};