// * Dashboard widget: 4 stat cards tiket helpdesk.

import type { HelpdeskDashboardStats } from "../../../types/helpdesk.types";

const CARDS = [
  {
    key: "total" as const,
    label: "Total Tiket",
    icon: (
      <svg className="size-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    accent: "border-l-violet-500",
  },
  {
    key: "open" as const,
    label: "Open",
    icon: (
      <svg className="size-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    accent: "border-l-blue-500",
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    icon: (
      <svg className="size-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    accent: "border-l-amber-500",
  },
  {
    key: "closed" as const,
    label: "Closed",
    icon: (
      <svg className="size-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    accent: "border-l-emerald-500",
  },
];

interface Props {
  stats: HelpdeskDashboardStats;
}

export default function HelpdeskStatCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {CARDS.map((c) => (
        <div
          key={c.key}
          className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] border-l-4 ${c.accent}`}
        >
          <div className="flex items-center justify-between">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${c.iconBg}`}>
              {c.icon}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{c.label}</span>
            <div className="mt-1">
              <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {stats[c.key]}
              </h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
