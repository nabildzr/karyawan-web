// * This file defines route module logic for src/pages/Karyawan/routes/absensi/components/AbsensiClockSection.tsx.

interface AbsensiClockSectionProps {
  currentDateLabel: string;
  currentTimeLabel: string;
  attendanceInfoLabel: string;
}

// & This function component/helper defines AbsensiClockSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku AbsensiClockSection untuk file route ini.
const AbsensiClockSection = ({
  currentDateLabel,
  currentTimeLabel,
  attendanceInfoLabel,
}: AbsensiClockSectionProps) => {
  // & Process the main execution steps of AbsensiClockSection inside this function body.
  // % Memproses langkah eksekusi utama AbsensiClockSection di dalam body fungsi ini.
  return (
    <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-theme-xs">
      <p className="mb-2 text-sm font-medium text-gray-500">{currentDateLabel}</p>

      <div className="flex items-end justify-center gap-2">
        <span className="text-5xl font-extrabold leading-none tracking-[-0.04em] text-gray-900">
          {currentTimeLabel}
        </span>
        <span className="pb-1 text-sm font-semibold leading-none text-gray-500">WIB</span>
      </div>

      <span className="mt-3 inline-flex items-center justify-center rounded-full bg-success-50 px-5 py-2 text-sm font-semibold text-success-700">
        {attendanceInfoLabel}
      </span>
    </section>
  );
};

export default AbsensiClockSection;
