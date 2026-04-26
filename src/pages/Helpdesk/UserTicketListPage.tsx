import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Column } from "../../components/tables/DataTables/DataTable";
import DataTableOnline, {
  type PaginationMeta,
} from "../../components/tables/DataTables/DataTableOnline";
import { useTickets, useUpdateTicketStatus } from "../../hooks/useHelpdesk";
import type { Ticket, TicketStatus } from "../../types/helpdesk.types";

const TABLE_META_DEFAULT: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; className: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
    dot: "bg-gray-500",
  },
};

const PRIORITY_LABEL: Record<Ticket["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function CloseButton({ ticketId }: { ticketId: string }) {
  const { mutateAsync, isPending } = useUpdateTicketStatus(ticketId);

  async function handleClose() {
    if (!confirm("Tutup tiket ini?")) return;
    try {
      await mutateAsync({ status: "CLOSED" });
      toast.success("Tiket berhasil ditutup");
    } catch {
      // handled by interceptor
    }
  }

  return (
    <button
      onClick={handleClose}
      disabled={isPending}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
    >
      {isPending ? "..." : "Tutup"}
    </button>
  );
}

export default function UserTicketListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "" });

  const { data, isLoading } = useTickets({
    ...(statusFilter ? { status: statusFilter } : {}),
    page: 1,
    limit: 1000,
  });
  const { data: allData } = useTickets({ page: 1, limit: 1000 });

  const tickets = data?.data ?? [];
  const allTickets = allData?.data ?? [];

  const filteredTickets = useMemo(() => {
    const keyword = query.search.trim().toLowerCase();
    if (!keyword) return tickets;
    return tickets.filter((ticket) => {
      const subject = ticket.subject.toLowerCase();
      const nip = ticket.reporter.nip.toLowerCase();
      const name = (ticket.reporter.employees?.fullName ?? "").toLowerCase();
      return (
        subject.includes(keyword) ||
        nip.includes(keyword) ||
        name.includes(keyword)
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

  const counts: Record<TicketStatus, number> = {
    OPEN: allTickets.filter((ticket) => ticket.status === "OPEN").length,
    IN_PROGRESS: allTickets.filter((ticket) => ticket.status === "IN_PROGRESS")
      .length,
    CLOSED: allTickets.filter((ticket) => ticket.status === "CLOSED").length,
  };

  const columns: Column<Ticket>[] = [
    {
      header: "Subject",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {row.subject}
          </p>
          <p className="text-xs text-gray-400">
            {PRIORITY_LABEL[row.priority]} · {row._count?.responses ?? 0} respons
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      width: "w-36",
      render: (row) => <StatusBadge status={row.status} />,
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
      width: "w-52",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/karyawan/helpdesk/${row.id}`)}
            className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10"
          >
            Detail
          </button>
          {row.status !== "CLOSED" && <CloseButton ticketId={row.id} />}
        </div>
      ),
    },
  ];

  return (
    <>
    

      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Daftar Tiket Saya
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pantau status tiket support Anda.
              </p>
            </div>
            <button
              onClick={() => navigate("/karyawan/helpdesk/create")}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Buat Tiket
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["OPEN", "IN_PROGRESS", "CLOSED"] as TicketStatus[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter((prev) => (prev === status ? "" : status))
                  }
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    statusFilter === status
                      ? "border-brand-300 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    {STATUS_CONFIG[status].label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {counts[status]}
                  </p>
                </button>
              ),
            )}
          </div>
        </div>

        <DataTableOnline
          columns={columns}
          data={pagedTickets}
          meta={tableMeta.total ? tableMeta : TABLE_META_DEFAULT}
          loading={isLoading}
          showIndex={false}
          onQueryChange={(next) => setQuery(next)}
          searchPlaceholder="Cari subject, nama, atau NIP..."
        />
      </div>
    </>
  );
}
