import { INTEGRITY_LEVELS, type LeaderboardEntry } from "../../../../../types/integrity.types";
import type { LevelDistributionItem } from "../types";

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

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