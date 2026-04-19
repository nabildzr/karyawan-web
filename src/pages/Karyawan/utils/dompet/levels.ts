// * This file defines helper functions for integrity level progression.
import type { IntegrityLevelConfig } from "../../../../types/integrity.types";
import { INTEGRITY_LEVELS } from "../../../../types/integrity.types";

// & Resolve current integrity level based on active wallet balance.
// % Menentukan level integritas saat ini berdasarkan saldo dompet aktif.
export function getCurrentLevel(balance: number): IntegrityLevelConfig {
  let current = INTEGRITY_LEVELS[0];
  for (const level of INTEGRITY_LEVELS) {
    if (balance >= level.minPoints) current = level;
  }
  return current;
}

// & Resolve next level and percentage progress from current balance.
// % Menentukan level berikutnya dan persentase progres dari saldo saat ini.
export function getNextLevel(balance: number) {
  const currentIdx = INTEGRITY_LEVELS.findIndex(
    (level) => level.key === getCurrentLevel(balance).key,
  );

  const next = INTEGRITY_LEVELS[currentIdx + 1] ?? null;
  if (!next) return { next: null, progress: 100 };

  const current = INTEGRITY_LEVELS[currentIdx];
  const range = next.minPoints - current.minPoints;
  const progress = Math.round(((balance - current.minPoints) / range) * 100);

  return { next, progress: Math.min(100, Math.max(0, progress)) };
}
