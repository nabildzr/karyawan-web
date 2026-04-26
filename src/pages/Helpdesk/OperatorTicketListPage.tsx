import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import type { Column } from "../../components/tables/DataTables/DataTable";
import DataTableOnline, {
  type PaginationMeta,
} from "../../components/tables/DataTables/DataTableOnline";
import { useTickets } from "../../hooks/useHelpdesk";
import type {
  GetTicketsParams,
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../../types/helpdesk.types";

const TABLE_META_DEFAULT: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: {
    label: "Open",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
  },
};

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; className: string }
> = {
  LOW: {
    label: "Low",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  HIGH: {
    label: "High",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OperatorTicketListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "" });

  const params: GetTicketsParams = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(priorityFilter ? { priority: priorityFilter } : {}),
    page: 1,
    limit: 1000,
  };
  const { data, isLoading } = useTickets(params);
  const tickets = data?.data ?? [];

  const filteredTickets = useMemo(() => {
    const keyword = query.search.trim().toLowerCase();
    if (!keyword) return tickets;
    return tickets.filter((ticket) => {
      const subject = ticket.subject.toLowerCase();
      const reporterName = (
        ticket.reporter.employees?.fullName ?? ""
      ).toLowerCase();
      const reporterNip = ticket.reporter.nip.toLowerCase();
      return (
        subject.includes(keyword) ||
        reporterName.includes(keyword) ||
        reporterNip.includes(keyword)
      );
    });
  }, [query.search, tickets]);

  const tableMeta: PaginationMeta = useMemo(() => {
    const total = filteredTickets.length;
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    const currentPage = Math.min(query.page, totalPages);
    return {
      total,
      page: currentPage,
      limit: query.limit,
      totalPages,
    };
  }, [filteredTickets.length, query.limit, query.page]);

  const pagedTickets = useMemo(() => {
    const start = (tableMeta.page - 1) * tableMeta.limit;
    return filteredTickets.slice(start, start + tableMeta.limit);
  }, [filteredTickets, tableMeta.limit, tableMeta.page]);

  const columns: Column<Ticket>[] = [
    {
      header: "Subject",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {row.subject}
          </p>
          <p className="text-xs text-gray-400">
            {row._count?.responses ?? 0} respons
          </p>
        </div>
      ),
    },
    {
      header: "Reporter",
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {row.reporter.employees?.fullName ?? row.reporter.nip}
          </p>
          <p className="text-xs text-gray-400">{row.reporter.nip}</p>
        </div>
      ),
    },
    {
      header: "Priority",
      width: "w-28",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_CONFIG[row.priority].className}`}
        >
          {PRIORITY_CONFIG[row.priority].label}
        </span>
      ),
    },
    {
      header: "Status",
      width: "w-36",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CONFIG[row.status].className}`}
        >
          {STATUS_CONFIG[row.status].label}
        </span>
      ),
    },
    {
      header: "Dibuat",
      width: "w-36",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {fmtDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Aksi",
      width: "w-28",
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/helpdesk/${row.id}`)}
          className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10"
        >
          Detail
        </button>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Helpdesk - Operator Ticket"
        description="Daftar tiket helpdesk untuk operator"
      />
      <PageBreadcrumb pageTitle="Operator Ticket List" />

      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Dashboard Operator Helpdesk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola tiket dari semua pengguna dengan filter status dan prioritas.
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </span>
              <button
                onClick={() => setStatusFilter("")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === ""
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300"
                }`}
              >
                Semua
              </button>
              {(["OPEN", "IN_PROGRESS", "CLOSED"] as TicketStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter((prev) => (prev === status ? "" : status))
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      statusFilter === status
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300"
                    }`}
                  >
                    {STATUS_CONFIG[status].label}
                  </button>
                ),
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Priority
              </span>
              <button
                onClick={() => setPriorityFilter("")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  priorityFilter === ""
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300"
                }`}
              >
                Semua
              </button>
              {(["LOW", "MEDIUM", "HIGH"] as TicketPriority[]).map(
                (priority) => (
                  <button
                    key={priority}
                    onClick={() =>
                      setPriorityFilter((prev) =>
                        prev === priority ? "" : priority,
                      )
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      priorityFilter === priority
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300"
                    }`}
                  >
                    {PRIORITY_CONFIG[priority].label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <DataTableOnline
          columns={columns}
          data={pagedTickets}
          meta={tableMeta.total ? tableMeta : TABLE_META_DEFAULT}
          loading={isLoading}
          showIndex={false}
          onQueryChange={(next) => setQuery(next)}
          searchPlaceholder="Cari subject, reporter, atau NIP..."
        />
      </div>
    </>
  );
}
