// * Read-only schedule field for admin AbsensiManual page.
// & This component renders a locked schedule value with consistent styling.
// % Komponen ini menampilkan nilai jadwal yang terkunci dengan styling konsisten.

type ScheduleFieldProps = {
  label: string;
  value: string;
};

export default function ScheduleField({ label, value }: ScheduleFieldProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          Auto · Jadwal Kerja
        </span>
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/5">
        <svg
          className="h-4 w-4 shrink-0 text-brand-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}
