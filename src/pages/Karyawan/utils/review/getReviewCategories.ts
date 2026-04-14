// * This file maps raw review detail data into normalized review category view models.
import { MyResultsCurrentReview } from "../../../../types/assessments.types";
import { ReviewCategoryView } from "../../routes/review/types/ReviewCategoryViewType";

export function getReviewCategories(
  review: MyResultsCurrentReview | null,
): ReviewCategoryView[] {
  // & Return empty array when review is missing to simplify component rendering.
  // % Mengembalikan array kosong saat review tidak ada untuk mempermudah rendering komponen.
  if (!review) return [];

  // & Map each review detail into a safe category object with numeric fallbacks.
  // % Memetakan setiap detail review menjadi objek kategori aman dengan fallback numerik.
  return (review.details ?? []).map((detail) => {
    // & Parse score values to numbers before validation.
    // % Parsing nilai skor ke angka sebelum divalidasi.
    const score = Number(detail.score);
    const maxScore = Number(detail.maxScore ?? 5);

    // & Build normalized category object with defensive defaults.
    // % Menyusun objek kategori ternormalisasi dengan default defensif.
    return {
      id: detail.id,
      label: detail.categoryName || detail.category?.name || "Kategori",
      score: Number.isFinite(score) ? score : 0,
      maxScore: Number.isFinite(maxScore) && maxScore > 0 ? maxScore : 5,
    };
  });
}