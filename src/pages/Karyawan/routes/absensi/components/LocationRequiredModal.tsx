// * This file defines route module logic for src/pages/Karyawan/routes/absensi/components/LocationRequiredModal.tsx.

import { Modal } from "../../../../../components/ui/modal";
import type { LocationState } from "../types/AbsensiTypes";

interface LocationRequiredModalProps {
  locationState: LocationState;
  locationError: string;
  onRetryLocation: () => void;
  onBack: () => void;
}

// & This function component/helper defines LocationRequiredModal behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku LocationRequiredModal untuk file route ini.
const LocationRequiredModal = ({
  locationState,
  locationError,
  onRetryLocation,
  onBack,
}: LocationRequiredModalProps) => {
  // & Process the main execution steps of LocationRequiredModal inside this function body.
  // % Memproses langkah eksekusi utama LocationRequiredModal di dalam body fungsi ini.
  return (
    <Modal
      isOpen={locationState !== "ready"}
      onClose={() => {}}
      showCloseButton={false}
      className="max-w-md p-6 mx-4"
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lokasi Wajib Aktif</h2>
          <p className="mt-1 text-sm text-gray-600">
            {locationState === "checking"
              ? "Sedang memeriksa akses lokasi perangkat..."
              : locationError || "Aktifkan lokasi untuk melanjutkan proses absensi."}
          </p>
        </div>

        <div className="rounded-xl border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
          Absensi hanya bisa diproses ketika lokasi perangkat aktif.
        </div>

        <button
          type="button"
          onClick={onRetryLocation}
          disabled={locationState === "checking"}
          className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locationState === "checking" ? "Memeriksa Lokasi..." : "Cek Lokasi Sekarang"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>
    </Modal>
  );
};

export default LocationRequiredModal;
