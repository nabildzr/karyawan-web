// * This file defines route module logic for src/pages/Karyawan/routes/dompet/components/DompetHeaderSection.tsx.

import { Star, Wallet } from "lucide-react";
import type { IntegrityLevelConfig } from "../../../../../types/integrity.types";
import { getAvatarLabel } from "../../../utils/dompet/formatter";

interface DompetHeaderSectionProps {
  fullName?: string | null;
  nip?: string | null;
  walletLoading: boolean;
  currentBalance: number;
  rank?: number | null;
  totalEarned: number;
  totalSpent: number;
  level: IntegrityLevelConfig;
  nextLevel: IntegrityLevelConfig | null;
  progress: number;
}

// & This function component/helper defines DompetHeaderSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku DompetHeaderSection untuk file route ini.
const DompetHeaderSection = ({
  fullName,
  nip,
  walletLoading,
  currentBalance,
  rank,
  totalEarned,
  totalSpent,
  level,
  nextLevel,
  progress,
}: DompetHeaderSectionProps) => {
  // & Process the main execution steps of DompetHeaderSection inside this function body.
  // % Memproses langkah eksekusi utama DompetHeaderSection di dalam body fungsi ini.
  return (
    <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 p-8 text-white shadow-2xl shadow-brand-500/30">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/70">
            <Wallet size={18} />
            <span className="text-sm font-medium">Dompet Integritas</span>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">
            {nip ?? "Karyawan"}
          </span>
        </div>

        <div className=" flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
            {getAvatarLabel(fullName, nip)}
          </div>
          <div>
            <p className="text-xs text-white/80">Pemilik Dompet</p>
            <p className="text-base font-bold">
              {fullName ?? nip ?? "Karyawan"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-5xl font-bold tracking-tight">
              {walletLoading ? (
                <span className="inline-block h-12 w-32 animate-pulse rounded-lg bg-white/20" />
              ) : (
                currentBalance.toLocaleString("id-ID")
              )}
            </p>
            <p className="mt-1 text-sm text-white/60">Total Poin Integritas</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              <Star size={14} className="text-yellow-300" />
              <span className="text-sm font-bold">{level.label}</span>
            </div>
            <p className="mt-1 text-xs text-white/50">Level</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">#{rank ?? "—"}</p>
            <p className="text-xs text-white/50">Ranking</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-300">
                +{totalEarned.toLocaleString("id-ID")}
              </span>
              <span className="text-white/30">|</span>
              <span className="text-sm text-red-300">
                -{totalSpent.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-xs text-white/50">Total Histori</p>
          </div>
        </div>
        </div>

        {nextLevel && (
          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-white/60">
              <span>{level.label}</span>
              <span>
                {nextLevel.label} ({nextLevel.minPoints.toLocaleString("id-ID")}{" "}
                pts)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/15">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DompetHeaderSection;
