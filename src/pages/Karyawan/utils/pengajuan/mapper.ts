
// * This file contains simple mapper/timezone helpers for submission utilities.
export function getTodayJakartaDate() {
  // & Build a Date object based on Jakarta timezone local string.
  // % Membangun objek Date berdasarkan string lokal zona waktu Jakarta.
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
}