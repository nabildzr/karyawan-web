// * Simple pagination controls for dompet sections.

interface DompetPaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

const DompetPagination = ({
  page,
  totalPages,
  disabled = false,
  onPageChange,
}: DompetPaginationProps) => {
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Math.min(page, totalPages));

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-sm dark:border-gray-700">
      <button
        onClick={() => onPageChange(safePage - 1)}
        disabled={disabled || safePage <= 1}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Sebelumnya
      </button>

      <span className="text-gray-500 dark:text-gray-400">
        Halaman {safePage} dari {totalPages}
      </span>

      <button
        onClick={() => onPageChange(safePage + 1)}
        disabled={disabled || safePage >= totalPages}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Berikutnya
      </button>
    </div>
  );
};

export default DompetPagination;
