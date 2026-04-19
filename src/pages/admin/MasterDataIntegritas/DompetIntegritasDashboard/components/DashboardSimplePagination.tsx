import type { DashboardSimplePaginationProps } from "../types";

export function DashboardSimplePagination({
  currentPage,
  totalPages,
  onChange,
}: DashboardSimplePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-3 dark:border-gray-700">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
      >
        Sebelumnya
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Hal {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
      >
        Berikutnya
      </button>
    </div>
  );
}