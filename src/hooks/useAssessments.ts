import { useCallback, useState } from "react";
import { toast } from "sonner";
import { assessmentsService } from "../services/assessments.service";
import type {
  AssessmentCategory,
  AssessmentCategoryStats,
  AssessmentDashboardStats,
  IndividualReport,
  ReportResponse,
  SubmitAssessmentInput,
  SubordinateEmployee,
  UpdateAssessmentInput,
} from "../types/assessments.types";

// * Hook ini mengelola fitur penilaian secara menyeluruh.
// * Ada helper periode, kategori, dashboard, laporan, dan detail individu.

// & Month labels used for period formatting.
// % Label bulan untuk format periode.
const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// & Get current period in "Bulan Tahun".
// % Ambil periode saat ini dalam format "Bulan Tahun".
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${MONTHS_ID[now.getMonth()]} ${now.getFullYear()}`;
}

// & Build list of recent period options.
// % Buat daftar opsi periode terbaru.
export function getPeriodOptions(count = 12): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`);
  }
  return result;
}

// & Main hook for assessments feature.
// % Hook utama untuk fitur penilaian.
export function useAssessments() {
  // & State for category module.
  // % State untuk modul kategori.
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [categoryStats, setCategoryStats] = useState<AssessmentCategoryStats>({
    totalCategories: 0,
    activeIndicators: 0,
    offIndicators: 0,
    lastUpdate: null,
  });
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // & State for dashboard module.
  // % State untuk modul dashboard.
  const [dashboardStats, setDashboardStats] =
    useState<AssessmentDashboardStats | null>(null);
  const [subordinates, setSubordinates] = useState<SubordinateEmployee[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // & State for report module.
  // % State untuk modul laporan.
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // & State for individual detail module.
  // % State untuk modul detail individu.
  const [individual, setIndividual] = useState<IndividualReport | null>(null);
  const [individualLoading, setIndividualLoading] = useState(false);

  // & Category actions.
  // % Aksi kategori.
  const fetchCategories = useCallback(
    async (params?: { isActive?: string }) => {
      setCategoriesLoading(true);
      try {
        const [cats, stats] = await Promise.all([
          assessmentsService.getCategories(params),
          assessmentsService.getCategoryStats(),
        ]);
        setCategories(cats);
        setCategoryStats(stats);
      } catch {
        toast.error("Gagal memuat kategori penilaian.");
      } finally {
        setCategoriesLoading(false);
      }
    },
    [],
  );

  // & Create, update, delete, and toggle category active status.
  // % Buat, ubah, hapus, dan toggle status aktif kategori.
  const createCategory = useCallback(
    async (data: Parameters<typeof assessmentsService.createCategory>[0]) => {
      const cat = await assessmentsService.createCategory(data);
      toast.success(`Kategori "${cat.name}" berhasil dibuat.`);
      await fetchCategories();
      return cat;
    },
    [fetchCategories],
  );

  // & Update category then refresh list.
  // % Ubah kategori lalu refresh daftar.
  const updateCategory = useCallback(
    async (
      id: string,
      data: Parameters<typeof assessmentsService.updateCategory>[1],
    ) => {
      const cat = await assessmentsService.updateCategory(id, data);
      toast.success(`Kategori "${cat.name}" berhasil diperbarui.`);
      await fetchCategories();
      return cat;
    },
    [fetchCategories],
  );

  // & Delete category then refresh list.
  // % Hapus kategori lalu refresh daftar.
  const deleteCategory = useCallback(
    async (id: string, name: string) => {
      await assessmentsService.deleteCategory(id);
      toast.success(`Kategori "${name}" berhasil dihapus.`);
      await fetchCategories();
    },
    [fetchCategories],
  );

  // & Toggle category active status then refresh list.
  // % Toggle status aktif kategori lalu refresh daftar.
  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      await assessmentsService.toggleCategoryActive(id, isActive);
      toast.success(
        isActive ? "Kategori diaktifkan." : "Kategori dinonaktifkan.",
      );
      await fetchCategories();
    },
    [fetchCategories],
  );

  // & Dashboard actions.
  // % Aksi dashboard.
  const fetchDashboard = useCallback(
    async (period: string, params?: { divisionId?: string }) => {
      setDashboardLoading(true);
      try {
        const [stats, subs] = await Promise.all([
          assessmentsService.getDashboardStats({ period, ...params }),
          assessmentsService.getSubordinates(period, params),
        ]);
        setDashboardStats(stats);
        setSubordinates(subs);
      } catch {
        toast.error("Gagal memuat data penilaian.");
      } finally {
        setDashboardLoading(false);
      }
    },
    [],
  );

  // & Submit and update assessment actions.
  // % Aksi submit dan update penilaian.
  const submitAssessment = useCallback(async (data: SubmitAssessmentInput) => {
    await assessmentsService.submit(data);
    toast.success("Penilaian berhasil disimpan.");
  }, []);

  // & Update assessment then refresh dashboard.
  // % Ubah penilaian lalu refresh dashboard.
  const updateAssessment = useCallback(
    async (id: string, data: UpdateAssessmentInput) => {
      await assessmentsService.update(id, data);
      toast.success("Penilaian berhasil diperbarui.");
    },
    [],
  );

  // & Report actions.
  // % Aksi laporan.
  const fetchReport = useCallback(
    async (params: Parameters<typeof assessmentsService.getReport>[0]) => {
      setReportLoading(true);
      try {
        const data = await assessmentsService.getReport(params);
        setReport(data);
      } catch {
        toast.error("Gagal memuat laporan penilaian.");
      } finally {
        setReportLoading(false);
      }
    },
    [],
  );

  // & Individual detail actions.
  // % Aksi detail individu.
  const fetchIndividual = useCallback(
    async (employeeId: string, period: string) => {
      setIndividualLoading(true);
      try {
        const data = await assessmentsService.getIndividualByEmployee(
          employeeId,
          period,
        );
        setIndividual(data);
      } catch {
        setIndividual(null);
      } finally {
        setIndividualLoading(false);
      }
    },
    [],
  );

  const fetchIndividualById = useCallback(async (assessmentId: string) => {
    setIndividualLoading(true);
    try {
      const data = await assessmentsService.getIndividualById(assessmentId);
      setIndividual(data);
    } catch {
      setIndividual(null);
    } finally {
      setIndividualLoading(false);
    }
  }, []);

  // & Return all state and actions for UI.
  // % Kembalikan semua state dan aksi untuk UI.
  return {
    // & Category group.
    // % Grup kategori.
    categories,
    categoryStats,
    categoriesLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleActive,

    // & Dashboard group.
    // % Grup dashboard.
    dashboardStats,
    subordinates,
    dashboardLoading,
    fetchDashboard,
    submitAssessment,
    updateAssessment,

    // & Report group.
    // % Grup laporan.
    report,
    reportLoading,
    fetchReport,

    // & Individual group.
    // % Grup individu.
    individual,
    individualLoading,
    fetchIndividual,
    fetchIndividualById,
    setIndividual,
  };
}
