// * Frontend module: karyawan-web/src/pages/admin/Penilaian/PenilaianKaryawan.tsx
// & This file defines frontend UI or logic for PenilaianKaryawan.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk PenilaianKaryawan.tsx.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import {
  getCurrentPeriod,
  getPeriodOptions,
  useAssessments,
} from "../../../hooks/useAssessments";
import { assessmentsService } from "../../../services/assessments.service";
import type {
  AssessmentCategory,
  AssessmentDetailInput,
  SubordinateEmployee,
} from "../../../types/assessments.types";

// ── Star Rating ───────────────────────────────────────────────
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
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

// ── Evaluation Modal ──────────────────────────────────────────
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
        const init: Record<string, number> = {};
        cats.forEach((c) => {
          init[c.id] = 0;
        });
        setScores(init);
      })
      .finally(() => setLoading(false));
    if (existingAssessmentId) {
      assessmentsService
        .getIndividualById(existingAssessmentId)
        .then((data) => {
          setNotes(data.generalNotes);
          const s: Record<string, number> = {};
          data.categories.forEach((c) => {
            s[c.categoryId] = c.score;
          });
          setScores(s);
        })
        .catch(() => {});
    }
  }, [isOpen, existingAssessmentId]);

  const allScored =
    categories.length > 0 && categories.every((c) => (scores[c.id] ?? 0) > 0);

  const handleSave = async () => {
    if (!employee || !allScored || !notes.trim()) return;
    const details: AssessmentDetailInput[] = categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      score: scores[cat.id] ?? 1,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-0 overflow-hidden"
    >
      <div className="bg-gray-50 dark:bg-gray-900 px-6 pt-6 pb-4 text-center border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
          {(employee?.fullName ?? "?").charAt(0)}
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {employee?.fullName}
        </h3>
        <p className="text-sm text-gray-400">
          {employee?.position} · {employee?.division}
        </p>
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
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-gray-400">{cat.description}</p>
                    )}
                  </div>
                  <StarRating
                    value={scores[cat.id] ?? 0}
                    onChange={(v) => setScores((p) => ({ ...p, [cat.id]: v }))}
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
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan apresiasi atau saran pengembangan..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            {(!allScored || !notes.trim()) && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                {!allScored
                  ? "⚠ Semua indikator harus diberi nilai."
                  : "⚠ Catatan feedback wajib diisi."}
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
            {saving
              ? "Menyimpan..."
              : existingAssessmentId
                ? "Simpan Perubahan"
                : "Simpan & Lanjut →"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Employee Card ─────────────────────────────────────────────
function EmployeeCard({
  emp,
  onBeriNilai,
  onEdit,
}: {
  emp: SubordinateEmployee;
  onBeriNilai: (e: SubordinateEmployee) => void;
  onEdit: (e: SubordinateEmployee) => void;
}) {
  const navigate = useNavigate();
  return (
    <div
      className={`relative rounded-2xl border p-4 transition hover:shadow-sm ${emp.isReviewed ? "border-green-100 dark:border-green-500/20" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-white/[0.03]`}
    >
      <span
        className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${emp.isReviewed ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}
      >
        {emp.isReviewed ? "Sudah Dinilai" : "Belum Dinilai"}
      </span>
      <div className="mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-lg font-bold">
        {(emp.fullName ?? "?").charAt(0)}
      </div>
      <p className="pr-20 text-sm font-semibold text-gray-800 dark:text-white">
        {emp.fullName}
      </p>
      <p className="text-xs text-gray-400">{emp.position}</p>
      <p className="text-xs text-gray-300 dark:text-gray-600">{emp.division}</p>
      <div className="mt-3 flex items-center justify-between">
        {emp.isReviewed ? (
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate(`/admin/laporan-individu/${emp.assessmentId}`)
              }
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
            <button
              onClick={() => onEdit(emp)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-brand-50 hover:text-brand-500 dark:border-gray-700 dark:hover:bg-brand-500/10"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onBeriNilai(emp)}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition"
          >
            Beri Nilai
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
type Tab = "all" | "pending" | "done";
const PAGE_SIZE = 12;

export default function PenilaianKaryawan() {
  const { dashboardStats, subordinates, dashboardLoading, fetchDashboard } =
    useAssessments();
  const [period, setPeriod] = useState(getCurrentPeriod());
  const periodOptions = getPeriodOptions(12);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalEmp, setModalEmp] = useState<SubordinateEmployee | null>(null);
  const [modalAssessmentId, setModalAssessmentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchDashboard(period);
  }, [period]); // eslint-disable-line

  const filteredByTab = subordinates.filter((e) =>
    tab === "pending" ? !e.isReviewed : tab === "done" ? e.isReviewed : true,
  );
  const searchKeyword = search.trim().toLowerCase();
  const filtered = filteredByTab.filter((employee) => {
    if (!searchKeyword) return true;

    return [
      employee.nip,
      employee.fullName,
      employee.position,
      employee.division,
    ]
      .map((value) => value.toLowerCase())
      .some((value) => value.includes(searchKeyword));
  });
  const selesai = subordinates.filter((e) => e.isReviewed).length;
  const pending = subordinates.filter((e) => !e.isReviewed).length;
  const progress = subordinates.length
    ? Math.round((selesai / subordinates.length) * 100)
    : 0;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedEmployees = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [period, tab, search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <>
      <PageMeta
        title="Penilaian Karyawan"
        description="Dashboard evaluasi kinerja karyawan"
      />
      <PageBreadcrumb pageTitle="Penilaian Karyawan" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Dashboard Penilaian
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pantau kemajuan evaluasi kinerja tim Anda bulan ini.
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
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {periodOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress summary */}
        {!dashboardLoading && dashboardStats && (
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
                  <p className="font-semibold text-gray-700 dark:text-gray-200">
                    Kemajuan Penilaian
                  </p>
                  <p className="text-xs text-gray-400">
                    Menilai {selesai} dari {subordinates.length} staf bulan ini
                  </p>
                </div>
              </div>
              <span className="text-3xl font-black text-brand-500">
                {progress}%
              </span>
            </div>
            <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  label: "Selesai",
                  value: String(selesai),
                  cls: "text-green-600 dark:text-green-400",
                },
                {
                  label: "Pending",
                  value: String(pending),
                  cls: "text-amber-600 dark:text-amber-400",
                },
                {
                  label: "Rata-rata Skor",
                  value: dashboardStats.rataRataSkor.toFixed(1),
                  cls: "text-gray-700 dark:text-white",
                },
                {
                  label: "Deadline",
                  value: dashboardStats.deadline,
                  cls:
                    dashboardStats.daysUntilReset <= 3
                      ? "text-red-600"
                      : "text-gray-700 dark:text-white",
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

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-100 dark:border-gray-800">
          {(["all", "pending", "done"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-xs font-bold tracking-wider border-b-2 -mb-px transition ${tab === t ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              {t === "all"
                ? `SEMUA STAF (${subordinates.length})`
                : t === "pending"
                  ? `BELUM DINILAI (${pending})`
                  : `SUDAH DINILAI (${selesai})`}
            </button>
          ))}
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
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari NIP, nama, jabatan, atau divisi..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>

        {/* Cards */}
        {dashboardLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.employeeId}
                  emp={emp}
                  onBeriNilai={(e) => {
                    setModalEmp(e);
                    setModalAssessmentId(null);
                  }}
                  onEdit={(e) => {
                    setModalEmp(e);
                    setModalAssessmentId(e.assessmentId);
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-gray-400">
                  Tidak ada karyawan ditemukan.
                </div>
              )}
            </div>

            {filtered.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Menampilkan {startIndex + 1}-
                  {Math.min(endIndex, filtered.length)} dari {filtered.length}{" "}
                  staf
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={safeCurrentPage === 1}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Halaman {safeCurrentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={safeCurrentPage === totalPages}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
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
        onSaved={() => fetchDashboard(period)}
      />
    </>
  );
}
