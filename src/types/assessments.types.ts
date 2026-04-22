// * File ini berisi type untuk modul penilaian.
// * Dipakai oleh service, hook, dan halaman penilaian.

// & Category related types.
// % Type yang terkait kategori.
export interface AssessmentCategoryStats {
  totalCategories: number;
  activeIndicators: number;
  offIndicators: number;
  lastUpdate: string | null;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  isActive: boolean;
  isVisibleToEmployee: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
  isVisibleToEmployee?: boolean;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  type?: string | null;
  isVisibleToEmployee?: boolean;
  isActive?: boolean;
}

// & Dashboard stats type.
// % Type statistik dashboard.
export interface AssessmentDashboardStats {
  currentPeriod: string;
  selesai: number;
  pending: number;
  totalKaryawan: number;
  rataRataSkor: number;
  deadline: string;
  daysUntilReset: number;
}

// & Subordinate list item type.
// % Type item daftar bawahan.
export interface SubordinateEmployee {
  employeeId: string;
  nip: string;
  fullName: string;
  position: string;
  division: string;
  isReviewed: boolean;
  assessmentId: string | null;
  assessedAt: string | null;
}

// & Report related types.
// % Type yang terkait laporan.
export interface ReportStats {
  totalPenilaian: number;
  rataRataKeseluruhan: number;
  nilaiTertinggi: number;
  nilaiTerendah: number;
}

export interface ReportRow {
  id: string;
  employeeId: string;
  employeeName: string;
  nip: string;
  position: string;
  division: string;
  evaluatorName: string;
  assessmentDate: string;
  period: string;
  averageScore: number;
  maxScore: number;
  status: string;
}

export interface ReportResponse {
  stats: ReportStats | null;
  data: ReportRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// & Individual report types.
// % Type laporan individu.
export interface IndividualReportCategory {
  id: string;
  categoryId: string;
  categoryName: string;
  score: number;
  maxScore: number;
}

export interface IndividualReportEvaluatee {
  id: string;
  fullName: string;
  nip: string;
  email: string;
  phoneNumber: string;
  position: string;
  division: string;
  divisionId: string;
  employmentType: string;
  profilePictureUrl: string | null;
  gender: string | null;
  joinDate: string;
}

export interface IndividualReportEvaluator {
  fullName: string;
  position: string;
  profilePictureUrl: string | null;
}

export interface IndividualReport {
  id: string;
  period: string;
  assessmentDate: string;
  completedAt: string;
  status: string;
  generalNotes: string;
  averageScore: number;
  maxScore: number;
  predikat: string;
  evaluatee: IndividualReportEvaluatee;
  evaluator: IndividualReportEvaluator;
  categories: IndividualReportCategory[];
}

// & Self review result types.
// % Type hasil review diri sendiri.
export interface MyResultsDetailCategory {
  name: string;
  description: string | null;
}

export interface MyResultsReviewDetail {
  id: string;
  categoryId: string;
  categoryName: string;
  score: number;
  maxScore: number;
  category?: MyResultsDetailCategory | null;
}

export interface MyResultsManagerInfo {
  name: string;
  position: string;
  photo: string | null;
}

export interface MyResultsEvaluatorProfile {
  fullName: string;
  position?: { name: string | null } | null;
  employeeDetails?: Array<{ profilePictureUrl: string | null }>;
}

export interface MyResultsCurrentReview {
  id: string;
  period: string;
  assessmentDate: string;
  completedAt: string;
  status: string;
  generalNotes: string | null;
  averageScore: number;
  maxScore: number;
  predikat: string;
  details: MyResultsReviewDetail[];
  managerInfo?: MyResultsManagerInfo | null;
  evaluator?: {
    employees?: MyResultsEvaluatorProfile | null;
  } | null;
}

export interface MyResultsHistoryItem {
  period: string;
  date: string;
  score: number;
}

export interface MyResultsResponse {
  currentReview: MyResultsCurrentReview;
  history: MyResultsHistoryItem[];
}

// & Submit payload types.
// % Type payload submit penilaian.
export interface AssessmentDetailInput {
  categoryId: string;
  categoryName: string;
  score: number;
}

export interface SubmitAssessmentInput {
  evaluateeId: string;
  period: string;
  generalNotes: string;
  details: AssessmentDetailInput[];
}

export interface UpdateAssessmentInput {
  generalNotes?: string;
  details?: AssessmentDetailInput[];
}

// & Helper to map score into grade label.
// % Helper untuk map skor ke label predikat.
export function getPredikat(avg: number): string {
  if (avg >= 4.5) return "Sangat Memuaskan (A)";
  if (avg >= 3.5) return "Memuaskan (B)";
  if (avg >= 2.5) return "Cukup (C)";
  return "Kurang (D)";
}

// & Helper to map score into text color.
// % Helper untuk map skor ke warna teks.
export function getPredikatColor(avg: number): string {
  if (avg >= 4.5) return "text-green-600 dark:text-green-400";
  if (avg >= 3.5) return "text-blue-600 dark:text-blue-400";
  if (avg >= 2.5) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}
