// * This file defines route module logic for src/pages/Karyawan/routes/review/components/BuildPrintHTML.tsx.

import { MyResultsCurrentReview } from "../../../../../types/assessments.types";
import { formatScore } from "../../../utils/review/formatter";
import { getStarsText } from "../../../utils/review/parser";
import { ReviewCategoryView } from "../types/ReviewCategoryViewType";

// & This function defines escapeHtml behavior in the route flow.
// % Fungsi ini mendefinisikan perilaku escapeHtml dalam alur route.
function escapeHtml(value: string): string {
  // & Process the main execution steps of escapeHtml inside this function body.
  // % Memproses langkah eksekusi utama escapeHtml di dalam body fungsi ini.
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}




// & This function defines buildPrintHtml behavior in the route flow.
// % Fungsi ini mendefinisikan perilaku buildPrintHtml dalam alur route.
export function buildPrintHtml(params: {
  // & Process the main execution steps of buildPrintHtml inside this function body.
  // % Memproses langkah eksekusi utama buildPrintHtml di dalam body fungsi ini.
  review: MyResultsCurrentReview;
  categories: ReviewCategoryView[];
  evaluatorName: string;
  evaluatorPosition: string;
  completedLabel: string;
  periodLabel: string;
  averageScore: number;
  predikat: string;
  feedback: string;
}): string {
  const rows = params.categories
    .map(
      (category, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(category.label)}</td>
        <td>${formatScore(category.score)} / ${category.maxScore}</td>
        <td>${escapeHtml(getStarsText(category.score, category.maxScore))}</td>
      </tr>
    `,
    )
    .join("");

  const feedbackValue = params.feedback.trim()
    ? escapeHtml(params.feedback)
    : "Belum ada umpan balik tertulis.";

  return `
    <!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>Review Saya - ${escapeHtml(params.periodLabel)}</title>
        <style>
          :root {
            color-scheme: light;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          .page {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            padding: 24px;
          }

          h1 {
            margin: 0;
            font-size: 24px;
          }

          h2 {
            margin: 0 0 10px;
            font-size: 14px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #6b7280;
          }

          .header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .score {
            text-align: right;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 12px 14px;
            min-width: 180px;
          }

          .score strong {
            font-size: 32px;
            line-height: 1;
            display: block;
            color: #1d4ed8;
          }

          .score span {
            font-size: 12px;
            color: #1f2937;
          }

          .section {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 14px;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px 16px;
            font-size: 13px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          th,
          td {
            border-bottom: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #f9fafb;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }

          .feedback {
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
            white-space: pre-wrap;
          }

          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .page {
              padding: 8px;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="header">
            <div>
              <h1>Hasil Review Saya</h1>
              <p>Periode: ${escapeHtml(params.periodLabel)}</p>
              <p>Status: ${escapeHtml(params.review.status || "Selesai")}</p>
            </div>
            <div class="score">
              <strong>${formatScore(params.averageScore)}/5</strong>
              <span>${escapeHtml(params.predikat)}</span>
            </div>
          </section>

          <section class="section">
            <h2>Informasi Evaluasi</h2>
            <div class="meta-grid">
              <div><strong>Penilai:</strong> ${escapeHtml(params.evaluatorName)}</div>
              <div><strong>Jabatan:</strong> ${escapeHtml(params.evaluatorPosition)}</div>
              <div><strong>Tanggal:</strong> ${escapeHtml(params.completedLabel)}</div>
              <div><strong>ID Review:</strong> ${escapeHtml(params.review.id)}</div>
            </div>
          </section>

          <section class="section">
            <h2>Skor Per Kategori</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">No</th>
                  <th>Kategori</th>
                  <th style="width: 130px;">Skor</th>
                  <th style="width: 130px;">Rating</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </section>

          <section class="section">
            <h2>Umpan Balik</h2>
            <p class="feedback">${feedbackValue}</p>
          </section>
        </main>
      </body>
    </html>
  `;
}