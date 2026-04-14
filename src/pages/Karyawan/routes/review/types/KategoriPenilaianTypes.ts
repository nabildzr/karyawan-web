// * This file defines route module logic for src/pages/Karyawan/routes/review/types/KategoriPenilaianTypes.ts.

// & This type describes props consumed by the category score card component.
// % Tipe ini menjelaskan props yang dipakai komponen kartu skor kategori.

export type KategoriPenilaianCardProps = {
  category: {
    id: string;
    label: string;
    score: number;
    maxScore: number;
  };
};