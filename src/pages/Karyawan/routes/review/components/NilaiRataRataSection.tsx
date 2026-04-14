// * This file defines route module logic for src/pages/Karyawan/routes/review/components/NilaiRataRataSection.tsx.

import { formatScore } from "../../../utils/review/formatter";


type NilaiRataRataSectionProps = {
  averageScore: number;
  predikat: string;
};

// & This function component/helper defines NilaiRataRataSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku NilaiRataRataSection untuk file route ini.
const NilaiRataRataSection = ({ averageScore, predikat }: NilaiRataRataSectionProps) => {
  // & Process the main execution steps of NilaiRataRataSection inside this function body.
  // % Memproses langkah eksekusi utama NilaiRataRataSection di dalam body fungsi ini.

  const safeAverageScore = Number.isFinite(averageScore) ? averageScore : 0;

  return (
    <section className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 shadow-theme-xs">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Nilai Rata-rata
      </p>
      <p className="mt-1 text-4xl font-black text-brand-800">
        {formatScore(safeAverageScore)}
        <span className="text-base font-semibold text-brand-600">/5</span>
      </p>
      <p className="mt-1 text-sm font-semibold text-brand-700">{predikat}</p>
    </section>
  );
};

export default NilaiRataRataSection;
