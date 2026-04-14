// * This file defines route module logic for src/pages/Karyawan/routes/review/types/ReviewCategoryViewType.ts.

// & This interface describes normalized category values ready for review UI rendering.
// % Interface ini menjelaskan nilai kategori ternormalisasi yang siap dirender di UI review.

export interface ReviewCategoryView {
  id: string;
  label: string;
  score: number;
  maxScore: number;
}