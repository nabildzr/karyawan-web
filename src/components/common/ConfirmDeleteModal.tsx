// * Frontend module: karyawan-web/src/components/common/ConfirmDeleteModal.tsx
// & This file defines frontend UI or logic for ConfirmDeleteModal.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk ConfirmDeleteModal.tsx.

// ============================================================
// CONFIRM DELETE MODAL — Reusable
// Props: isOpen, onClose, itemName, onConfirm, loading, errorMessage
// ============================================================

import { Modal } from "../ui/modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  errorMessage?: string | null;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  itemName,
  onConfirm,
  loading = false,
  errorMessage,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
          <svg
            className="h-7 w-7 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <div>
          <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
            Hapus Data
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apakah kamu yakin ingin menghapus{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {itemName}
            </span>
            ? Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="flex w-full gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
