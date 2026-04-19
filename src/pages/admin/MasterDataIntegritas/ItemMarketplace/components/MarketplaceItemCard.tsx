import { Clock, Edit2, Gift, Package, Trash2 } from "lucide-react";
import type { MarketplaceItemCardProps } from "../types";
import { CARD_GRADIENTS } from "../utils/constants";
import { buildConditionSummary } from "../utils/utils";

export function MarketplaceItemCard({
  item,
  index,
  onEdit,
  onDelete,
}: MarketplaceItemCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div
        className={`bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} flex h-32 items-center justify-center`}
      >
        <Gift className="h-12 w-12 text-white/80" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {item.itemName}
          </h3>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
              item.isActive
                ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {item.isActive ? "AKTIF" : "NONAKTIF"}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {item.description || "Tidak ada deskripsi"}
        </p>

        <div className="mt-4 rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10">
          <p className="text-center text-2xl font-bold text-brand-600 dark:text-brand-400">
            {item.pointCost.toLocaleString("id-ID")}
          </p>
          <p className="text-center text-xs text-brand-500">POIN</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Clock size={14} />
            <span>{item.durationDays} hari</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Package size={14} />
            <span>Maks {item.maxPerMonth ?? "∞"}/bln</span>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
          <p className="font-medium">{buildConditionSummary(item)}</p>
          <p className="mt-1">
            Listing berakhir: {item.expiredAt ? new Date(item.expiredAt).toLocaleString("id-ID") : "Tanpa batas"}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Edit2 size={14} className="mr-1.5 inline" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className="flex-1 rounded-xl border border-error-200 px-3 py-2 text-sm font-medium text-error-600 transition-colors hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
          >
            <Trash2 size={14} className="mr-1.5 inline" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}