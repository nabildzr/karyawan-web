// * Employee search component for admin AbsensiManual page.
// & This component provides debounced employee lookup with dropdown selection.
// % Komponen ini menyediakan pencarian karyawan dengan debounce dan dropdown pilihan.

import { useCallback, useEffect, useRef, useState } from "react";
import { karyawanService } from "../../../../../services/karyawan.service";
import type { Employee } from "../../../../../types/karyawan.types";
import { inputCls } from "../constants";

type EmployeeSearchProps = {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
};

export default function EmployeeSearch({ value, onChange }: EmployeeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await karyawanService.getAll({
        page: 1,
        limit: 8,
        search: searchQuery,
      });
      setResults(response.data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const select = (employee: Employee) => {
    onChange(employee);
    setQuery(employee.fullName);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="text"
          value={value ? `${value.fullName}  ·  NIP ${value.user?.nip}` : query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);

            if (value) onChange(null);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => search(nextQuery), 350);
          }}
          onFocus={() => query && results.length && setOpen(true)}
          placeholder="Ketik nama atau NIP karyawan..."
          className={`${inputCls} pl-10 pr-8`}
        />
        {loading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 animate-spin text-brand-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </span>
        )}
        {value && !loading && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {results.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => select(employee)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
                {(employee.fullName ?? "?").charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {employee.fullName}
                </p>
                <p className="text-xs text-gray-400">
                  NIP {employee.user?.nip} · {employee.position?.name ?? "—"} ·{" "}
                  {employee.position?.division?.name ?? "—"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && !results.length && query && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          Tidak ditemukan.
        </div>
      )}
    </div>
  );
}
