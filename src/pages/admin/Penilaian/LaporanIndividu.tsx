// * Frontend module: karyawan-web/src/pages/admin/Penilaian/LaporanIndividu.tsx
// & This file defines frontend UI or logic for LaporanIndividu.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk LaporanIndividu.tsx.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useAssessments, getCurrentPeriod, getPeriodOptions } from "../../../hooks/useAssessments";
import { assessmentsService } from "../../../services/assessments.service";
import { getPredikat, getPredikatColor } from "../../../types/assessments.types";

// ── Radar Chart (pure Canvas, no library) ────────────────────
function RadarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const r = (size / 2) - 52;
    const n = data.length;
    const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const pt = (i: number, radius: number) => ({
      x: cx + radius * Math.cos(angle(i)),
      y: cy + radius * Math.sin(angle(i)),
    });

    ctx.clearRect(0, 0, size, size);

    // Grid circles
    for (let ring = 1; ring <= 5; ring++) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const { x, y } = pt(i, (r * ring) / 5);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(150,150,180,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Spokes
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const { x, y } = pt(i, r);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(150,150,180,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data polygon (filled)
    ctx.beginPath();
    data.forEach((d, i) => {
      const ratio = Math.min(d.value / d.max, 1);
      const { x, y } = pt(i, r * ratio);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(59,130,246,0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(59,130,246,0.85)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    data.forEach((d, i) => {
      const ratio = Math.min(d.value / d.max, 1);
      const { x, y } = pt(i, r * ratio);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Labels
    data.forEach((d, i) => {
      const { x, y } = pt(i, r + 30);
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${d.label} (${d.value})`, x, y);
    });
  }, [data]);

  return <canvas ref={canvasRef} />;
}

// ── Stars ─────────────────────────────────────────────────────
function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < Math.round(value) ? "text-amber-400" : "text-gray-200 dark:text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function LaporanIndividu() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const { individual, individualLoading, fetchIndividualById, fetchIndividual } = useAssessments();
  const [period, setPeriod] = useState(getCurrentPeriod());
  const periodOptions = getPeriodOptions(24);
  const [exporting, setExporting] = useState(false);

  // Fetch by assessmentId on mount (from route param)
  useEffect(() => {
    if (assessmentId) {
      fetchIndividualById(assessmentId);
    }
  }, [assessmentId]); // eslint-disable-line

  // Re-fetch when period changes (if we have an employeeId from loaded data)
  useEffect(() => {
    if (individual?.evaluatee?.id && !assessmentId) {
      fetchIndividual(individual.evaluatee.id, period);
    }
  }, [period]); // eslint-disable-line

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    if (individual?.evaluatee?.id) {
      fetchIndividual(individual.evaluatee.id, p);
    }
  };

  const handleExportPdf = async () => {
    if (!individual?.id) return;
    setExporting(true);
    try { await assessmentsService.exportIndividualPdf(individual.id); }
    finally { setExporting(false); }
  };

  if (individualLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!individual) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 dark:text-gray-400">Data laporan tidak ditemukan untuk periode ini.</p>
        <button onClick={() => navigate(-1)} className="mt-4 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
          ← Kembali
        </button>
      </div>
    );
  }

  const radarData = individual.categories.map((c) => ({
    label: c.categoryName,
    value: c.score,
    max: c.maxScore,
  }));

  const avg = individual.averageScore;
  const predikat = getPredikat(avg);
  const predikatColor = getPredikatColor(avg);

  return (
    <>
      <PageMeta title={`Laporan Individu — ${individual.evaluatee.fullName}`} description="Laporan penilaian individu karyawan" />
      <PageBreadcrumb pageTitle="Laporan Individu" />

      <div className="space-y-6">
        {/* Header card */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                {(individual.evaluatee.fullName ?? "?").charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">{individual.evaluatee.fullName}</h1>
              <p className="text-sm text-gray-500">ID: {individual.evaluatee.nip} · {individual.evaluatee.position}</p>
              <div className="mt-1 flex gap-2">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {individual.evaluatee.division}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {individual.evaluatee.employmentType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <select value={period} onChange={(e) => handlePeriodChange(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                {periodOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={handleExportPdf} disabled={exporting}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {exporting ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>}
              Download PDF
            </button>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              ← Kembali
            </button>
          </div>
        </div>

        {/* Main content: radar + score summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Radar chart */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">Radar Analisis Performa</h2>
            <p className="mb-5 text-xs text-gray-400">Visualisasi pencapaian berdasarkan {radarData.length} kategori utama</p>
            <div className="flex justify-center">
              <RadarChart data={radarData} />
            </div>
          </div>

          {/* Score + evaluator info */}
          <div className="space-y-4">
            {/* Score card */}
            <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-blue-50 p-6 dark:border-brand-500/20 dark:from-brand-500/10 dark:to-blue-500/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">Skor Rata-rata</p>
              <p className="mt-1 text-5xl font-black text-brand-600 dark:text-brand-400">
                {avg.toFixed(1)} <span className="text-xl text-brand-400">/ {individual.maxScore}</span>
              </p>
              <p className={`mt-1 text-sm font-semibold ${predikatColor}`}>{predikat}</p>
            </div>

            {/* Evaluator info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Informasi Evaluasi</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {(individual.evaluator.fullName ?? "?").charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{individual.evaluator.fullName}</p>
                  <p className="text-xs text-gray-400">{individual.evaluator.position}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Status: {individual.status}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {new Date(individual.completedAt).toLocaleString("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Periode: {individual.period}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score per category (mini-cards row) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {individual.categories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-2xl font-black text-gray-800 dark:text-white">{c.score}</p>
              <Stars value={c.score} max={c.maxScore} />
              <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">{c.categoryName}</p>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {individual.generalNotes && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Umpan Balik Tambahan</h3>
            </div>
            <blockquote className="rounded-xl bg-gray-50 px-5 py-4 text-sm italic text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              "{individual.generalNotes}"
            </blockquote>
          </div>
        )}
      </div>
    </>
  );
}
