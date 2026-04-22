// * Constants for admin AbsensiManual page.
// & This file stores shared constants and style tokens for the manual attendance form.
// % File ini menyimpan konstanta bersama dan token style untuk form absensi manual.

export const MAX_PAST_DAYS = 7;

export const TODAY_DATE = (() => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
})();

export const DAYS_ID: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

export const DAYS_EN: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_CANONICAL_MAP: Record<string, string> = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
  minggu: "sunday",
  senin: "monday",
  selasa: "tuesday",
  rabu: "wednesday",
  kamis: "thursday",
  jumat: "friday",
  sabtu: "saturday",
};

export const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500/20";

export const selectCls = `${inputCls} appearance-none cursor-pointer`;
