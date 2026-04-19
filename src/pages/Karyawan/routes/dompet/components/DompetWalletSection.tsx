// * This file defines route module logic for src/pages/Karyawan/routes/dompet/components/DompetWalletSection.tsx.

import { Award } from "lucide-react";
import type { IntegrityLevelKey } from "../../../../../types/integrity.types";
import { INTEGRITY_LEVELS } from "../../../../../types/integrity.types";

interface DompetWalletSectionProps {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  currentLevelKey: IntegrityLevelKey;
  progress: number;
}

// & This function component/helper defines DompetWalletSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku DompetWalletSection untuk file route ini.
const DompetWalletSection = ({
  currentBalance,
  totalEarned,
  totalSpent,
  currentLevelKey,
  progress,
}: DompetWalletSectionProps) => {
  // & Process the main execution steps of DompetWalletSection inside this function body.
  // % Memproses langkah eksekusi utama DompetWalletSection di dalam body fungsi ini.
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Aktif (Saat ini)</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {currentBalance.toLocaleString("id-ID")}
              </p>
            </div>
        
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Didapat (Total)</p>
              <p className="mt-1 text-3xl font-bold text-success-600">
                +{totalEarned.toLocaleString("id-ID")}
              </p>
            </div>
          
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Spent (Total)</p>
              <p className="mt-1 text-3xl font-bold text-error-600">
                -{totalSpent.toLocaleString("id-ID")}
              </p>
            </div>
           
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          <Award className="mr-2 inline h-5 w-5 text-yellow-500" />
          Level Integritas
        </h3>

        <div className="space-y-4">
          {INTEGRITY_LEVELS.map((level) => {
            const isCurrent = level.key === currentLevelKey;
            const isCompleted = currentBalance >= level.minPoints && !isCurrent;

            return (
              <div key={level.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-brand-600 dark:text-brand-400"
                        : isCompleted
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {level.label}
                    {isCurrent && " (Saat Ini)"}
                  </span>
                  <span className="text-sm text-gray-400">
                    {level.minPoints.toLocaleString("id-ID")} poin
                  </span>
                </div>

                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: isCompleted ? "100%" : isCurrent ? `${progress}%` : "0%",
                      backgroundColor: level.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
};

export default DompetWalletSection;
