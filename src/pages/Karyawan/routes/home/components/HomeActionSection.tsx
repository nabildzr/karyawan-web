// * This file defines route module logic for src/pages/Karyawan/routes/home/components/HomeActionSection.tsx.

interface HomeActionSectionProps {
  checkInButtonDisabled: boolean;
  checkOutButtonDisabled: boolean;
  checkInHint: string;
  checkOutHint: string;
  onOpenAttendance: () => void;
}

// & This function component/helper defines HomeActionSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku HomeActionSection untuk file route ini.
const HomeActionSection = ({
  checkInButtonDisabled,
  checkOutButtonDisabled,
  checkInHint,
  checkOutHint,
  onOpenAttendance,
}: HomeActionSectionProps) => {
  // & Process the main execution steps of HomeActionSection inside this function body.
  // % Memproses langkah eksekusi utama HomeActionSection di dalam body fungsi ini.
  return (
    <section className="mb-4 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onOpenAttendance}
        disabled={checkInButtonDisabled}
        className="rounded-2xl border border-success-200 bg-success-50 px-3 py-3 text-left transition hover:bg-success-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100"
      >
        <p className="text-xs font-medium text-success-700">Aksi</p>
        <p className="text-2xl font-semibold text-success-800">Check In</p>
        <p className="mt-1 text-[11px] text-gray-600">{checkInHint}</p>
      </button>

      <button
        type="button"
        onClick={onOpenAttendance}
        disabled={checkOutButtonDisabled}
        className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-3 text-left transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100"
      >
        <p className="text-xs font-medium text-brand-700">Aksi</p>
        <p className="text-2xl font-semibold text-brand-800">Check Out</p>
        <p className="mt-1 text-[11px] text-gray-600">{checkOutHint}</p>
      </button>
    </section>
  );
};

export default HomeActionSection;
