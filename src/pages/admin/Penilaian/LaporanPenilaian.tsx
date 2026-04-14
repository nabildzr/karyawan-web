import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import type { Column } from "../../../components/tables/DataTables/DataTableOnline";
import { useAssessments, getCurrentPeriod, getPeriodOptions } from "../../../hooks/useAssessments";
import { assessmentsService } from "../../../services/assessments.service";
import type { ReportRow } from "../../../types/assessments.types";
import { getPredikat } from "../../../types/assessments.types";

// ── Stars display ─────────────────────────────────────────────
function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`h-3.5 w-3.5 ${i < Math.round(value) ? "text-amber-400" : "text-gray-200 dark:text-gray-700"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-l-4 bg-white p-5 shadow-sm dark:bg-white/[0.03] ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-black text-gray-800 dark:text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">{icon}</div>
      </div>
    </div>
  );
}

// ── Columns ───────────────────────────────────────────────────
const columns: Column<ReportRow>[] = [
  {
    accessor: "employeeName", header: "Karyawan",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
          {(row.employeeName ?? "?").charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{row.employeeName}</p>
          <p className="text-xs text-gray-400">{row.nip}</p>
        </div>
      </div>
    ),
  },
  { accessor: "position", header: "Jabatan", render: (row) => <span className="text-sm text-gray-500">{row.position}</span> },
  { accessor: "evaluatorName", header: "Penilai", render: (row) => <span className="text-sm text-gray-500">{row.evaluatorName}</span> },
  {
    accessor: "assessmentDate", header: "Tanggal",
    render: (row) => (
      <span className="text-sm text-gray-500">
        {new Date(row.assessmentDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    ),
  },
  {
    accessor: "averageScore", header: "Rata-rata",
    render: (row) => (
      <div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{row.averageScore.toFixed(1)} / {row.maxScore}</p>
        <Stars value={row.averageScore} max={row.maxScore} />
      </div>
    ),
  },
  {
    accessor: "status", header: "Status",
    render: (row) => {
      const predikat = getPredikat(row.averageScore);
      const isGood = row.averageScore >= 3.5;
      return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isGood ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
          {predikat.split(" ")[0]}
        </span>
      );
    },
  },
];

// ── Main Page ─────────────────────────────────────────────────
export default function LaporanPenilaian() {
  const { report, reportLoading, fetchReport } = useAssessments();
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);
  const periodOptions = getPeriodOptions(24);

  // Normalisasi stats API ke object numerik penuh.
  // Backend kadang mengirim `stats: null` atau field numerik tidak lengkap saat periode kosong,
  // jadi semua turunan UI membaca dari fallback ini agar render tetap stabil.
  const safeStats = {
    totalPenilaian: report?.stats?.totalPenilaian ?? 0,
    rataRataKeseluruhan: report?.stats?.rataRataKeseluruhan ?? 0,
    nilaiTertinggi: report?.stats?.nilaiTertinggi ?? 0,
    nilaiTerendah: report?.stats?.nilaiTerendah ?? 0,
  };

  useEffect(() => {
    fetchReport({ period, page: 1, limit: 10 });
  }, [period]); // eslint-disable-line

  const handleQueryChange = ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    fetchReport({ period, page, limit, search });
  };

  const handleExport = async (format: "xlsx" | "pdf") => {
    setExporting(format);
    try { await assessmentsService.exportReport({ period, format }); }
    finally { setExporting(null); }
  };

  return (
    <>
      <PageMeta title="Laporan Penilaian" description="Laporan penilaian karyawan per periode" />
      <PageBreadcrumb pageTitle="Laporan Penilaian" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Laporan Penilaian Karyawan</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              A comprehensive view of all employee performance evaluations across departments and periods.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Period selector */}
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                {periodOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={() => handleExport("pdf")} disabled={!!exporting}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              {exporting === "pdf" ? "Exporting..." : "Export PDF"}
            </button>
            <button onClick={() => handleExport("xlsx")} disabled={!!exporting}
              className="flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              {exporting === "xlsx" ? "Exporting..." : "Export Excel"}
            </button>
          </div>
        </div>

        {/* Stats cards
            `safeStats` mencegah akses property ke nilai undefined/null.
            Dengan begitu kalkulasi turunan seperti `toFixed()` selalu bekerja pada number valid. */}
        {report && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Penilaian"
              value={safeStats.totalPenilaian}
              accent="border-blue-500"
              icon={<svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} />
            {/*
              toFixed(2) dipanggil pada number →
              fallback di `safeStats` menjamin tidak ada TypeError walau stats undefined/null
            */}
            <StatCard label="Rata-rata Keseluruhan"
              value={safeStats.rataRataKeseluruhan.toFixed(2)}
              accent="border-amber-500"
              icon={<svg className="h-6 w-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>} />
            <StatCard label="Nilai Tertinggi"
              value={safeStats.nilaiTertinggi.toFixed(2)}
              accent="border-green-500"
              icon={<svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>} />
            <StatCard label="Nilai Terendah"
              value={safeStats.nilaiTerendah.toFixed(2)}
              accent="border-red-500"
              icon={<svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>} />
          </div>
        )}

        {/* Table */}
        <DataTableOnline<ReportRow>
          columns={columns}
          data={report?.data ?? []}
          meta={report?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 }}
          loading={reportLoading}
          onQueryChange={handleQueryChange}
          searchPlaceholder="Cari nama karyawan..."
          showIndex={false}
        />
      </div>
    </>
  );
}
