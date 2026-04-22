// * Utility helpers for admin AbsensiManual page.
// & This file contains date and schedule helper functions used by the manual attendance form.
// % File ini berisi helper tanggal dan jadwal yang dipakai oleh form absensi manual.

import { DAY_CANONICAL_MAP, MAX_PAST_DAYS, TODAY_DATE } from "./constants";

export function toDateStr(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildIso(datePart: string, timePart: string) {
  return new Date(`${datePart}T${timePart}:00`).toISOString();
}

export function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";

  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysDiff(dateStr: string): number {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return Math.round((TODAY_DATE.getTime() - date.getTime()) / 86400000);
}

export function isWithinGrace(dateStr: string) {
  if (!dateStr) return false;

  const diff = daysDiff(dateStr);
  return diff >= 0 && diff <= MAX_PAST_DAYS;
}

export function getLocalDayIndex(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).getDay();
}

export function toCanonicalDay(dayName?: string | null) {
  if (!dayName) return "";

  const normalized = dayName.trim().toLowerCase();
  return DAY_CANONICAL_MAP[normalized] ?? normalized;
}
