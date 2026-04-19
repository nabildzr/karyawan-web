// * This file defines route module logic for src/pages/Karyawan/routes/dompet/components/DompetMarketplaceSection.tsx.

import { Clock, Gift, ShoppingCart } from "lucide-react";
import type { FlexibilityItem } from "../../../../../types/integrity.types";
import { MARKETPLACE_GRADIENTS } from "../../../utils/dompet/constants";
import DompetPagination from "./DompetPagination";

const formatCondition = (item: FlexibilityItem) => {
  if (!item.conditionField || !item.conditionValue) {
    return "Tidak auto-apply";
  }

  if (item.conditionField === "attendance.lateMinutes") {
    return `Berlaku saat LATE <= ${item.conditionValue} menit`;
  }

  return `Berlaku untuk status ${item.conditionValue}`;
};

interface DompetMarketplaceSectionProps {
  loading: boolean;
  items: FlexibilityItem[];
  currentBalance: number;
  buying: boolean;
  canBuyToken: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onBuy: (item: FlexibilityItem) => void;
}

// & This function component/helper defines DompetMarketplaceSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku DompetMarketplaceSection untuk file route ini.
const DompetMarketplaceSection = ({
  loading,
  items,
  currentBalance,
  buying,
  canBuyToken,
  page,
  totalPages,
  onPageChange,
  onBuy,
}: DompetMarketplaceSectionProps) => {
  // & Process the main execution steps of DompetMarketplaceSection inside this function body.
  // % Memproses langkah eksekusi utama DompetMarketplaceSection di dalam body fungsi ini.
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Tukarkan Poin Anda
      </h3>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          {!canBuyToken && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Anda dapat melihat marketplace, tetapi tidak memiliki izin untuk menukar token.
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {items.map((item, index) => {
              const listingExpired =
                item.expiredAt != null &&
                !Number.isNaN(new Date(item.expiredAt).getTime()) &&
                new Date(item.expiredAt).getTime() <= Date.now();
              const monthlyLimitReached =
                item.maxPerMonth != null &&
                item.maxPerMonth > 0 &&
                item.canBuyThisMonth === false;
              const canAfford = currentBalance >= item.pointCost;
              const canBuy =
                canBuyToken &&
                canAfford &&
                !buying &&
                !listingExpired &&
                !monthlyLimitReached;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div
                    className={`bg-gradient-to-br ${MARKETPLACE_GRADIENTS[index % MARKETPLACE_GRADIENTS.length]} flex h-28 items-center justify-center`}
                  >
                    <Gift className="h-10 w-10 text-white/80 transition-transform group-hover:scale-110" />
                  </div>

                  <div className="p-5">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.itemName}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {item.description || "Token kelonggaran"}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>Durasi: {item.durationDays} hari</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatCondition(item)}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Listing: {item.expiredAt ? new Date(item.expiredAt).toLocaleString("id-ID") : "Tanpa batas"}
                    </p>
                    {item.maxPerMonth != null && item.maxPerMonth > 0 && (
                      <p
                        className={`mt-1 text-[11px] ${
                          monthlyLimitReached
                            ? "font-medium text-error-500"
                            : "text-gray-400"
                        }`}
                      >
                        Batas bulan ini: {item.monthlyPurchaseCount ?? 0}/{item.maxPerMonth}
                      </p>
                    )}
                    <div className="mt-3 rounded-xl bg-brand-50 p-2.5 text-center dark:bg-brand-500/10">
                      <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
                        {item.pointCost.toLocaleString("id-ID")} Poin
                      </p>
                    </div>

                    <button
                      disabled={!canBuy}
                      onClick={() => onBuy(item)}
                      className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                        canBuy
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 hover:shadow-xl"
                          : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700"
                      }`}
                    >
                      {buying
                        ? "Memproses..."
                        : listingExpired
                          ? "Item Kedaluwarsa"
                        : monthlyLimitReached
                          ? "Batas Bulanan Tercapai"
                        : !canBuyToken
                          ? "Akses Ditolak"
                          : canAfford
                            ? "Tukar Sekarang"
                            : "Poin Tidak Cukup"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <DompetPagination
            page={page}
            totalPages={totalPages}
            disabled={loading || buying}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <ShoppingCart className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">Belum ada item marketplace</p>
        </div>
      )}
    </section>
  );
};

export default DompetMarketplaceSection;
