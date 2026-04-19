// * Frontend module: karyawan-web/src/components/tables/DataTables/DataTable.tsx
// & This file defines frontend UI or logic for DataTable.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk DataTable.tsx.

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  showIndex?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  searchable = true,
  searchKeys,
  showIndex = true,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter((row) => {
      const keys = searchKeys ?? columns.filter((c) => c.accessor).map((c) => c.accessor!);
      return keys.some((key) => {
        const val = row[key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(lower);
      });
    });
  }, [data, search, searchKeys, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  // Reset to page 1 when search changes
  const safeCurrentPage = currentPage > totalPages ? 1 : currentPage;

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, safeCurrentPage, rowsPerPage]);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

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
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-transparent px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
          >
            {[5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            data
          </span>
        </div>

        {searchable && (
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
              placeholder="Cari..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-1.5 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500 sm:w-64"
            />
          </div>
        )}
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
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => {
                const globalIndex = (safeCurrentPage - 1) * rowsPerPage + i;
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
                <TableCell
                  className="px-5 py-10 text-center text-gray-400 dark:text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
            {filteredData.length === 0
              ? 0
              : (safeCurrentPage - 1) * rowsPerPage + 1}
          </span>
          {" - "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(safeCurrentPage * rowsPerPage, filteredData.length)}
          </span>
          {" dari "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {data.length}
          </span>
          {" data"}
        </p>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
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
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  safeCurrentPage === page
                    ? "bg-brand-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
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
