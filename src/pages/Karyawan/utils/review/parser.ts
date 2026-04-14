// * This file parses review-related raw values into safer normalized forms.

export function parseIsoDate(value?: string | null): Date | null {
  // & Return null for empty input so callers can handle missing date explicitly.
  // % Mengembalikan null untuk input kosong agar pemanggil bisa menangani tanggal yang tidak ada secara eksplisit.
  if (!value) return null;

  // & Parse raw value into Date object.
  // % Parsing nilai mentah menjadi objek Date.
  const parsed = new Date(value);

  // & Return null if parsing result is invalid.
  // % Mengembalikan null jika hasil parsing tidak valid.
  if (Number.isNaN(parsed.getTime())) return null;

  // & Return valid parsed date object.
  // % Mengembalikan objek tanggal hasil parsing yang valid.
  return parsed;
}

export function getStarsText(score: number, maxScore = 5): string {
  // & Normalize maximum stars to at least 1 and to integer.
  // % Menormalkan jumlah bintang maksimum minimal 1 dan menjadi bilangan bulat.
  const max = Math.max(1, Math.round(maxScore));

  // & Clamp active stars between 0 and max.
  // % Menjepit jumlah bintang aktif antara 0 dan nilai maksimum.
  const active = Math.min(max, Math.max(0, Math.round(score)));

  // & Build filled and empty star string representation.
  // % Menyusun representasi string bintang terisi dan kosong.
  return `${"★".repeat(active)}${"☆".repeat(max - active)}`;
}