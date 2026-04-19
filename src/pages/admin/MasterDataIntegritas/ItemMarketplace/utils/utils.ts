import type { FlexibilityItem } from "../../../../../types/integrity.types";

export const formatDateTimeLocal = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};

export const parseDateTimeLocal = (value: string): string | null => {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
};

export const buildConditionSummary = (item: FlexibilityItem) => {
  if (!item.conditionField || !item.conditionValue) {
    return "Tidak auto-apply ke absensi";
  }

  if (item.conditionField === "attendance.lateMinutes") {
    return `Berlaku jika LATE <= ${item.conditionValue} menit`;
  }

  return `Berlaku untuk status: ${item.conditionValue}`;
};

export const computeLowestPointCost = (items: FlexibilityItem[]) => {
  if (!items.length) return 0;
  return Math.min(...items.map((item) => item.pointCost));
};

export const computeHighestPointCost = (items: FlexibilityItem[]) => {
  if (!items.length) return 0;
  return Math.max(...items.map((item) => item.pointCost));
};