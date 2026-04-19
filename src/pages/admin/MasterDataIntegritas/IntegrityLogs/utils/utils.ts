import type { PointLedgerEntry } from "../../../../../types/integrity.types";

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function escapeCsvValue(value: unknown): string {
  const plain = String(value ?? "");
  return `"${plain.replace(/"/g, '""')}"`;
}

export function buildPageNumbers(currentPage: number, totalPages: number) {
  const pages: Array<number | "..."> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (currentPage > 3) pages.push("...");

  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i += 1
  ) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export function buildCsvFromLogs(entries: PointLedgerEntry[]) {
  const headers = [
    "timestamp",
    "user_id",
    "employee_id",
    "name",
    "role",
    "email",
    "transaction_type",
    "amount",
    "balance_after",
    "reference_entity",
    "reference_id",
    "description",
  ];

  const rows = entries.map((entry) =>
    [
      formatDateTime(entry.createdAt),
      entry.userId,
      entry.user?.employeeId ?? "",
      entry.user?.name ?? "",
      entry.user?.role ?? "",
      entry.user?.email ?? "",
      entry.transactionType,
      entry.amount,
      entry.currentBalance,
      entry.referenceEntity ?? "",
      entry.referenceId ?? "",
      entry.description ?? "",
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function getUserInitials(entry: PointLedgerEntry) {
  return (entry.user?.name ?? entry.userId).substring(0, 2).toUpperCase();
}