import { Gift, Package, ShoppingBag } from "lucide-react";
import type { ItemMarketplaceSummaryCardsProps } from "../types";

export function ItemMarketplaceSummaryCards({
  totalItems,
  lowestPointCost,
  highestPointCost,
}: ItemMarketplaceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
            <Package className="h-6 w-6 text-brand-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">TOTAL ITEM</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10">
            <ShoppingBag className="h-6 w-6 text-success-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">HARGA TERENDAH</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {lowestPointCost.toLocaleString("id-ID")}
              <span className="text-sm font-normal text-gray-500"> poin</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 dark:bg-warning-500/10">
            <Gift className="h-6 w-6 text-warning-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">HARGA TERTINGGI</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {highestPointCost.toLocaleString("id-ID")}
              <span className="text-sm font-normal text-gray-500"> poin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}