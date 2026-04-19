export const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  EARN: {
    label: "EARN",
    cls: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  },
  SPEND: {
    label: "SPEND",
    cls: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  },
  PENALTY: {
    label: "PENALTY",
    cls: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
  },
  ADJUSTMENT: {
    label: "ADJUSTMENT",
    cls: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
  },
};

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "EARN", label: "EARN" },
  { value: "SPEND", label: "SPEND" },
  { value: "PENALTY", label: "PENALTY" },
  { value: "ADJUSTMENT", label: "ADJUSTMENT" },
] as const;

export const TIME_FILTER_OPTIONS = [
  { key: "all", label: "All Time" },
  { key: "30d", label: "Last 30 Days" },
] as const;

export const INTEGRITY_LOGS_PAGE_LIMIT = 10;