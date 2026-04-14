// * This file defines route module logic for src/pages/Karyawan/routes/absensi/components/AbsensiUserHeader.tsx.

interface AbsensiUserHeaderProps {
  fullName?: string | null;
  role?: string | null;
  nip?: string | null;
  isCheckOutMode: boolean;
}

// & This function component/helper defines AbsensiUserHeader behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku AbsensiUserHeader untuk file route ini.
const AbsensiUserHeader = ({
  fullName,
  role,
  nip,
  isCheckOutMode,
}: AbsensiUserHeaderProps) => {
  // & Process the main execution steps of AbsensiUserHeader inside this function body.
  // % Memproses langkah eksekusi utama AbsensiUserHeader di dalam body fungsi ini.
  return (
    <header className="mb-4 flex items-start justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gray-200">
          <img
            src="/images/user/user-14.jpg"
            alt="Profil Karyawan"
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-0 right-0 inline-block h-3 w-3 rounded-full border border-white bg-success-500" />
        </div>

        <div>
          <h1 className="text-base font-semibold leading-none text-gray-900">
            Halo, {fullName ?? nip ?? "Karyawan"}
          </h1>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{role ?? nip ?? "Role"}</p>
        </div>
      </div>

      <span
        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
          isCheckOutMode ? "bg-brand-50 text-brand-700" : "bg-success-50 text-success-700"
        }`}
      >
        {isCheckOutMode ? "Mode Check-Out" : "Mode Check-In"}
      </span>
    </header>
  );
};

export default AbsensiUserHeader;
