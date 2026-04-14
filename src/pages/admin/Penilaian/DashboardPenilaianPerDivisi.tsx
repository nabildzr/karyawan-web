import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import { getCurrentPeriod, getPeriodOptions, useAssessments } from "../../../hooks/useAssessments";
import { assessmentsService } from "../../../services/assessments.service";
import { divisiService } from "../../../services/divisi.service";
import type {
  AssessmentCategory,
  AssessmentDetailInput,
  SubordinateEmployee,
} from "../../../types/assessments.types";

type Tab = "all" | "pending" | "done";

type LocationState = {
  divisionName?: string;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <svg
            className={`h-7 w-7 transition ${(hover || value) >= star ? "text-amber-400" : "text-gray-200 dark:text-gray-700"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function EvaluationModal({
  isOpen,
  onClose,
  employee,
  existingAssessmentId,
  period,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: SubordinateEmployee | null;
  existingAssessmentId: string | null;
  period: string;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setNotes("");
    setScores({});

    assessmentsService
      .getCategories({ isActive: "true" })
      .then((cats) => {
        setCategories(cats);

        const initialScores: Record<string, number> = {};
        cats.forEach((category) => {
          initialScores[category.id] = 0;
        });
        setScores(initialScores);
      })
      .finally(() => setLoading(false));

    if (existingAssessmentId) {
      assessmentsService
        .getIndividualById(existingAssessmentId)
        .then((data) => {
          setNotes(data.generalNotes);

          const previousScores: Record<string, number> = {};
          data.categories.forEach((category) => {
            previousScores[category.categoryId] = category.score;
          });

          setScores(previousScores);
        })
        .catch(() => {});
    }
  }, [isOpen, existingAssessmentId]);

  const allScored = categories.length > 0 && categories.every((category) => (scores[category.id] ?? 0) > 0);

  const handleSave = async () => {
    if (!employee || !allScored || !notes.trim()) return;

    const details: AssessmentDetailInput[] = categories.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      score: scores[category.id] ?? 1,
    }));

    setSaving(true);
    try {
      if (existingAssessmentId) {
        await assessmentsService.update(existingAssessmentId, {
          generalNotes: notes,
          details,
        });
      } else {
        await assessmentsService.submit({
          evaluateeId: employee.employeeId,
          period,
          generalNotes: notes,
          details,
        });
      }

      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg overflow-hidden p-0">
      <div className="border-b border-gray-100 bg-gray-50 px-6 pb-4 pt-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-bold text-white">
          {(employee?.fullName ?? "?").charAt(0)}
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{employee?.fullName}</h3>
        <p className="text-sm text-gray-400">{employee?.position} · {employee?.division}</p>
      </div>

      <div className="px-6 py-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Indikator Penilaian
            </p>

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-gray-400">{category.description}</p>
                    )}
                  </div>
                  <StarRating
                    value={scores[category.id] ?? 0}
                    onChange={(value) =>
                      setScores((previous) => ({
                        ...previous,
                        [category.id]: value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Catatan / Feedback *
              </p>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Tuliskan apresiasi atau saran pengembangan..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            {(!allScored || !notes.trim()) && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                {!allScored ? "Semua indikator harus diberi nilai." : "Catatan feedback wajib diisi."}
              </p>
            )}
          </>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !allScored || !notes.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : existingAssessmentId ? "Simpan Perubahan" : "Simpan Penilaian"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function EmployeeCard({
  emp,
  onBeriNilai,
  onEdit,
}: {
  emp: SubordinateEmployee;
  onBeriNilai: (employee: SubordinateEmployee) => void;
  onEdit: (employee: SubordinateEmployee) => void;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-4 transition hover:shadow-sm dark:bg-white/[0.03] ${emp.isReviewed ? "border-green-100 dark:border-green-500/20" : "border-gray-200 dark:border-gray-700"}`}
    >
      <span
        className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${emp.isReviewed ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}
      >
        {emp.isReviewed ? "Sudah Dinilai" : "Belum Dinilai"}
      </span>

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white">
        {(emp.fullName ?? "?").charAt(0)}
      </div>

      <p className="pr-20 text-sm font-semibold text-gray-800 dark:text-white">{emp.fullName}</p>
      <p className="text-xs text-gray-400">{emp.position}</p>
      <p className="text-xs text-gray-300 dark:text-gray-600">{emp.division}</p>

      <div className="mt-3 flex items-center justify-between">
        {emp.isReviewed ? (
          <button
            onClick={() => onEdit(emp)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-500 transition hover:bg-brand-50 dark:border-gray-700 dark:hover:bg-brand-500/10"
          >
            Edit Penilaian
          </button>
        ) : (
          <button
            onClick={() => onBeriNilai(emp)}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
          >
            Beri Nilai
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardPenilaianPerDivisi() {
  const { divisionId = "" } = useParams<{ divisionId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const { dashboardStats, subordinates, dashboardLoading, fetchDashboard } = useAssessments();
  const [period, setPeriod] = useState(getCurrentPeriod());
  const periodOptions = getPeriodOptions(12);
  const [tab, setTab] = useState<Tab>("all");
  const [modalEmp, setModalEmp] = useState<SubordinateEmployee | null>(null);
  const [modalAssessmentId, setModalAssessmentId] = useState<string | null>(null);
  const [divisionName, setDivisionName] = useState(state?.divisionName ?? "Divisi");

  useEffect(() => {
    if (!divisionId) return;
    fetchDashboard(period, { divisionId });
  }, [divisionId, period, fetchDashboard]);

  useEffect(() => {
    if (state?.divisionName || !divisionId) return;

    divisiService
      .getById(divisionId, false, false, false)
      .then((division) => setDivisionName(division.name))
      .catch(() => {});
  }, [divisionId, state?.divisionName]);

  const filtered = useMemo(
    () =>
      subordinates.filter((employee) =>
        tab === "pending"
          ? !employee.isReviewed
          : tab === "done"
            ? employee.isReviewed
            : true,
      ),
    [subordinates, tab],
  );

  const selesai = useMemo(
    () => subordinates.filter((employee) => employee.isReviewed).length,
    [subordinates],
  );
  const pending = subordinates.length - selesai;

  // Progress dihitung dari data aktual list karyawan pada divisi terpilih.
  // Guard `subordinates.length ? ... : 0` mencegah pembagian dengan nol saat divisi masih kosong.
  const progress = subordinates.length
    ? Math.round((selesai / subordinates.length) * 100)
    : 0;

  const averageScore = dashboardStats?.rataRataSkor ?? 0;
  const deadlineText = dashboardStats?.deadline ?? "-";
  const daysUntilReset = dashboardStats?.daysUntilReset ?? 0;

  return (
    <>
      <PageMeta
        title={`Dashboard Penilaian ${divisionName}`}
        description="Dashboard penilaian per divisi untuk Admin dan HR"
      />
      <PageBreadcrumb pageTitle="Dashboard Penilaian Per Divisi" />

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Dashboard Penilaian {divisionName}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
              Tampilan khusus Admin dan HR untuk memantau penilaian per divisi. Data ini membantu memastikan seluruh anggota divisi, termasuk manager divisi yang dinilai oleh atasan berikutnya, tetap masuk ke alur evaluasi periode berjalan.
            </p>
          </div>

          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {periodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!dashboardLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                  <svg
                    className="h-5 w-5 text-brand-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Kemajuan Penilaian Divisi</p>
                  <p className="text-xs text-gray-400">
                    Menilai {selesai} dari {subordinates.length} karyawan pada periode ini
                  </p>
                </div>
              </div>
              <span className="text-3xl font-black text-brand-500">{progress}%</span>
            </div>

            <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Selesai", value: String(selesai), cls: "text-green-600 dark:text-green-400" },
                { label: "Pending", value: String(pending), cls: "text-amber-600 dark:text-amber-400" },
                {
                  label: "Rata-rata Skor",
                  // `toFixed(1)` dipanggil setelah fallback number supaya render tidak pecah saat stats API belum ada.
                  value: averageScore.toFixed(1),
                  cls: "text-gray-700 dark:text-white",
                },
                {
                  label: "Deadline",
                  value: deadlineText,
                  cls: daysUntilReset <= 3 ? "text-red-600" : "text-gray-700 dark:text-white",
                },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-xl font-bold ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6 border-b border-gray-100 dark:border-gray-800">
          {(["all", "pending", "done"] as Tab[]).map((currentTab) => (
            <button
              key={currentTab}
              onClick={() => setTab(currentTab)}
              className={`-mb-px border-b-2 pb-3 text-xs font-bold tracking-wider transition ${tab === currentTab ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              {currentTab === "all"
                ? `SEMUA KARYAWAN (${subordinates.length})`
                : currentTab === "pending"
                  ? `BELUM DINILAI (${pending})`
                  : `SUDAH DINILAI (${selesai})`}
            </button>
          ))}
        </div>

        {dashboardLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((employee) => (
              <EmployeeCard
                key={employee.employeeId}
                emp={employee}
                onBeriNilai={(selectedEmployee) => {
                  setModalEmp(selectedEmployee);
                  setModalAssessmentId(null);
                }}
                onEdit={(selectedEmployee) => {
                  setModalEmp(selectedEmployee);
                  setModalAssessmentId(selectedEmployee.assessmentId);
                }}
              />
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-gray-400">
                Tidak ada karyawan ditemukan pada divisi ini.
              </div>
            )}
          </div>
        )}
      </div>

      <EvaluationModal
        isOpen={!!modalEmp}
        onClose={() => {
          setModalEmp(null);
          setModalAssessmentId(null);
        }}
        employee={modalEmp}
        existingAssessmentId={modalAssessmentId}
        period={period}
        onSaved={() => fetchDashboard(period, { divisionId })}
      />
    </>
  );
}
