// * This file defines route module logic for src/pages/Karyawan/routes/review/components/InfoEvaluasiSection.tsx.



type InfoEvaluasiSectionProps = {
  evaluatorName: string;
  evaluatorPosition: string;
  statusLabel: string;
  completedLabel: string;
  periodLabel: string;
};

// & This function component/helper defines InfoEvaluasiSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku InfoEvaluasiSection untuk file route ini.
const InfoEvaluasiSection = ({
  evaluatorName,
  evaluatorPosition,
  statusLabel,
  completedLabel,
  periodLabel
}: InfoEvaluasiSectionProps) => {
  // & Process the main execution steps of InfoEvaluasiSection inside this function body.
  // % Memproses langkah eksekusi utama InfoEvaluasiSection di dalam body fungsi ini.
  return (
    <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <h2 className="text-sm font-semibold text-gray-800">
        Informasi Evaluasi
      </h2>
      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Penilai:</span> {evaluatorName}
        </p>
        <p>
          <span className="font-semibold">Jabatan Penilai:</span>{" "}
          {evaluatorPosition}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {statusLabel}
        </p>
        <p>
          <span className="font-semibold">Tanggal:</span> {completedLabel}
        </p>
        <p>
          <span className="font-semibold">Periode:</span> {periodLabel}
        </p>
      </div>
    </section>
  );
};

export default InfoEvaluasiSection;
