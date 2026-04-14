import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

// Re-export Column type so pages can import it from here too
export type { Column } from "./DataTable";
import type { Column } from "./DataTable";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DataTableOnlineProps<T> {
  columns: Column<T>[];
  data: T[];
  meta: PaginationMeta;
  loading?: boolean;
  showIndex?: boolean;
  /** Called whenever page, limit, or search changes */
  onQueryChange: (params: { page: number; limit: number; search: string }) => void;
  searchPlaceholder?: string;
}

export default function DataTableOnline<T>({
  columns,
  data,
  meta,
  loading = false,
  showIndex = true,
  onQueryChange,
  searchPlaceholder = "Cari...",
}: DataTableOnlineProps<T>) {
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(meta.limit ?? 10);
  const [currentPage, setCurrentPage] = useState(meta.page ?? 1);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync page from meta when API responds
  useEffect(() => {
    setCurrentPage(meta.page);
  }, [meta.page]);

  const triggerQuery = (page: number, limit: number, s: string) => {
    onQueryChange({ page, limit, search: s });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      triggerQuery(1, rowsPerPage, value);
    }, 400);
  };

  const handleLimitChange = (limit: number) => {
    setRowsPerPage(limit);
    setCurrentPage(1);
    triggerQuery(1, limit, search);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > meta.totalPages) return;
    setCurrentPage(page);
    triggerQuery(page, rowsPerPage, search);
  };

  // Generate page numbers
  const pageNumbers: (number | "...")[] = [];
  const total = meta.totalPages;
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(total - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (currentPage < total - 2) pageNumbers.push("...");
    pageNumbers.push(total);
  }

  const startItem = meta.total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, meta.total);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">
            Tampilkan
          </label>
          <select
            value={rowsPerPage}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-transparent px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
          >
            {[5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">data</span>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-transparent py-1.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500 sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-t border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {showIndex && (
                <TableCell
                  isHeader
                  className="w-12 px-5 py-3 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  #
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.header}
                  isHeader
                  className={`px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 ${!col.accessor && col.render ? "text-center" : "text-start"} ${col.width ?? ""} ${col.className ?? ""}`}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: rowsPerPage > 5 ? 5 : rowsPerPage }).map(
                (_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {showIndex && (
                      <TableCell className="px-5 py-4">
                        <div className="h-4 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.header} className="px-5 py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : data.length > 0 ? (
              data.map((row, i) => {
                const globalIndex = (currentPage - 1) * rowsPerPage + i;
                return (
                  <TableRow key={globalIndex}>
                    {showIndex && (
                      <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                        {globalIndex + 1}
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.header}
                        className={`px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 ${col.width ?? ""} ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(row, globalIndex)
                          : col.accessor
                            ? String(row[col.accessor] ?? "")
                            : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell className="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="h-10 w-10 text-gray-300 dark:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <span className="text-sm">Data tidak ditemukan</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Menampilkan{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {startItem}
          </span>
          {" - "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {endItem}
          </span>
          {" dari "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {meta.total}
          </span>
          {" data"}
        </p>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.05]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span
                key={`dots-${idx}`}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-brand-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === meta.totalPages || loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.05]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
