import { AlertTriangle, BookOpen, RefreshCw } from "lucide-react";

type AturanPoinBottomCardsProps = {
  rulesCount: number;
};

export function AturanPoinBottomCards({ rulesCount }: AturanPoinBottomCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl bg-gradient-to-br from-error-500 to-error-600 p-6 text-white">
        <h4 className="text-lg font-bold">Panduan Cepat</h4>
        <p className="mt-2 text-sm text-white/80">
          Pastikan modifier poin seimbang antara reward (+) dan penalty (-)
          untuk menjaga ekosistem integritas yang sehat.
        </p>
        <button className="mt-4 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30">
          <BookOpen size={14} className="mr-1.5 inline" />
          Baca Dokumentasi Lengkap
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 dark:bg-warning-500/10">
          <AlertTriangle className="h-6 w-6 text-warning-500" />
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white">Conflict Check</h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Sistem mendeteksi {rulesCount > 1 ? "beberapa" : "0"} aturan yang mungkin tumpang tindih.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
          <RefreshCw className="h-6 w-6 text-brand-500" />
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white">Update Terakhir</h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Diperbarui oleh Admin via Sync.</p>
      </div>
    </div>
  );
}