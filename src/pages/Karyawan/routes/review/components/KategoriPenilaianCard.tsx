// * This file defines route module logic for src/pages/Karyawan/routes/review/components/KategoriPenilaianCard.tsx.

import { formatScore } from "../../../utils/review/formatter";
import { Stars } from "../../../utils/shared/starsIcon";
import { KategoriPenilaianCardProps } from "../types/KategoriPenilaianTypes";





// & This function component/helper defines KategoriPenilaianCard behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KategoriPenilaianCard untuk file route ini.
const KategoriPenilaianCard = ({ category }: KategoriPenilaianCardProps) => {
  // & Process the main execution steps of KategoriPenilaianCard inside this function body.
  // % Memproses langkah eksekusi utama KategoriPenilaianCard di dalam body fungsi ini.
  return (
    <article
      key={category.id}
      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
    >
      <p className="text-2xl font-bold text-gray-800">
        {formatScore(category.score)}
        <span className="text-sm font-medium text-gray-500">
          {" "}
          / {category.maxScore}
        </span>
      </p>
      <div className="mt-1">
        <Stars value={category.score} max={category.maxScore} />
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
        {category.label}
      </p>
    </article>
  );
};

export default KategoriPenilaianCard;
