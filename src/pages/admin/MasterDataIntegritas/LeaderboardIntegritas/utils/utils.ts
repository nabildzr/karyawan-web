import {
  INTEGRITY_LEVELS,
  type LeaderboardEntry,
} from "../../../../../types/integrity.types";
import type { LevelDistributionItem } from "../types";

// % Fungsi util untuk halaman Leaderboard
// % Dapatkan Initials agar avatar bisa tampil dengan inisial nama karyawan. Contohnya "John Doe" → "JD", "Alice" → "A", "Bob Smith Jr." → "BS".
export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

// % Konsistensi adalah persentase dari balance terhadap 5000 poin, dibatasi antara 0% hingga 100%.
// % Perhitungannya adalah: (balance / 5000 alias maxPoints }) * 100 agar mendapatkan persentase, lalu dibulatkan ke angka terdekat dan dibatasi antara 0 dan 100.
export const getConsistency = (balance: number) =>
  Math.max(0, Math.min(100, Math.round((balance / 5000) * 100)));

export const getLevelDistribution = (
  entries: LeaderboardEntry[],
): LevelDistributionItem[] => {
  const total = entries.length || 1;

  return INTEGRITY_LEVELS.map((level) => {
    const nextLevel = INTEGRITY_LEVELS.find(
      (candidateLevel) => candidateLevel.minPoints > level.minPoints,
    );

    const count = entries.filter((entry) => {
      const points = entry.balance;
      if (nextLevel) {
        return points >= level.minPoints && points < nextLevel.minPoints;
      }
      return points >= level.minPoints;
    }).length;

    return {
      ...level,
      count,
      percent: Math.round((count / total) * 100),
    };
  }).reverse();
};

// % Fungsi untuk membangun array halaman yang akan ditampilkan di pagination control. 
// % Misalnya, jika totalPages=10, currentPage=5, dan maxVisibleButtons=5,
// % maka fungsi ini akan menghasilkan [3, 4, 5, 6, 7].
export const buildVisiblePages = (
  currentPage: number,
  totalPages: number,
  maxVisibleButtons: number,
) => {
  const startPage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - maxVisibleButtons + 1),
  );
  const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

  return Array.from(
    { length: Math.max(0, endPage - startPage + 1) },
    (_, index) => startPage + index,
  );
};
