// * This file defines route module logic for src/pages/Karyawan/routes/review/components/SkorPerKategoriSection.tsx.

import KategoriPenilaianCard from './KategoriPenilaianCard'
import { ReviewCategoryView } from '../types/ReviewCategoryViewType'



// & This function component/helper defines SkorPerKategoriSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku SkorPerKategoriSection untuk file route ini.
const SkorPerKategoriSection = ({categories}: {categories: ReviewCategoryView[]}) => {
  // & Process the main execution steps of SkorPerKategoriSection inside this function body.
  // % Memproses langkah eksekusi utama SkorPerKategoriSection di dalam body fungsi ini.
  return (
      <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
            <h2 className="text-sm font-semibold text-gray-800">
              Skor Per Kategori
            </h2>
            <div className="mt-3 space-y-2">
              {categories.map((category) => (
                <KategoriPenilaianCard key={category.id} category={category} />
              ))}
            </div>
          </section>
  )
}

export default SkorPerKategoriSection
