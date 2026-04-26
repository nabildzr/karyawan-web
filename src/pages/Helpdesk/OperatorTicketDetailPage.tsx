// * Page: Detail Tiket (Operator)
// * Info reporter, ubah status, response time & resolution time, chat

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuthContext } from "../../context/AuthContext";
import {
  useTicketDetail,
  useUpdateTicketStatus,
  useRespondTicket,
} from "../../hooks/useHelpdesk";
import { useTicketChat } from "../../hooks/useTicketChat";
import type { TicketStatus } from "../../types/helpdesk.types";

const QUICK_REPLY_SUGGESTIONS = [
  "Terima kasih, tiket Anda sedang kami proses.",
  "Mohon lampirkan screenshot error yang muncul.",
  "Kami sudah meneruskan ke tim teknis untuk investigasi.",
  "Silakan coba logout lalu login kembali, lalu konfirmasi hasilnya.",
  "Perbaikan sudah diterapkan. Mohon dicoba kembali ya.",
];

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function diffMinutes(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

function fmtDuration(minutes: number) {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}j ${m}m`;
}

export default function OperatorTicketDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const { data: ticket, isLoading } = useTicketDetail(id);
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateTicketStatus(id);
  const { mutateAsync: respondTicket, isPending: isSending } = useRespondTicket(id);

  const [chatMsg, setChatMsg] = useState("");
  const [statusInput, setStatusInput] = useState<"IN_PROGRESS" | "CLOSED">("IN_PROGRESS");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const { messages: wsMessages, isConnected, sendMessage } = useTicketChat({
    ticketId: id,
    enabled: !!id,
  });

  const allResponses = useMemo(() => [
    ...(ticket?.responses ?? []),
    ...wsMessages.filter(
      (m) => !(ticket?.responses ?? []).find((r) => r.id === m.id),
    ),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [ticket?.responses, wsMessages]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allResponses.length]);

  async function handleUpdateStatus() {
    try {
      await updateStatus({ status: statusInput, operatorId: user?.id });
      toast.success(`Status diubah ke ${statusInput}`);
    } catch {
      // handled
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    sendMessage(chatMsg.trim());
    try {
      await respondTicket({ message: chatMsg.trim() });
      setChatMsg("");
    } catch {
      // handled
    }
  }

  async function handleQuickReply(message: string) {
    if (!message.trim() || isClosed || isSending) return;
    sendMessage(message);
    try {
      await respondTicket({ message });
      toast.success("Saran jawab berhasil dikirim");
    } catch {
      // handled
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-16 text-center text-gray-400">
        Tiket tidak ditemukan
      </div>
    );
  }

  const responseTime = ticket.firstResponseAt
    ? diffMinutes(ticket.createdAt, ticket.firstResponseAt)
    : null;
  const resolutionTime =
    ticket.closedAt ? diffMinutes(ticket.createdAt, ticket.closedAt) : null;

  const STATUS_COLOR: Record<TicketStatus, string> = {
    OPEN: "bg-blue-500/15 text-blue-400 border-blue-400/30",
    IN_PROGRESS: "bg-amber-500/15 text-amber-400 border-amber-400/30",
    CLOSED: "bg-gray-500/15 text-gray-400 border-gray-400/30",
  };

  const isClosed = ticket.status === "CLOSED";

  return (
    <>
      <PageMeta
        title="Helpdesk - Detail Operator"
        description="Detail tiket untuk operator helpdesk"
      />
      <PageBreadcrumb pageTitle="Operator Ticket Detail" />
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-6 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket info */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-xl font-bold text-white leading-tight">{ticket.subject}</h1>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLOR[ticket.status]}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
              <div
                className="prose prose-sm prose-invert max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: ticket.description }}
              />
              <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 flex flex-wrap gap-4">
                <span>Dibuat: {fmtDateTime(ticket.createdAt)}</span>
                <span>
                  Priority:{" "}
                  <span
                    className={
                      ticket.priority === "HIGH"
                        ? "text-rose-400"
                        : ticket.priority === "MEDIUM"
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }
                  >
                    {ticket.priority}
                  </span>
                </span>
              </div>
            </div>

            {/* Chat / Responses */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-semibold text-white">Percakapan ({allResponses.length})</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
                  <span className="text-gray-500">{isConnected ? "Live" : "Offline"}</span>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
                {allResponses.length === 0 ? (
                  <p className="text-center text-gray-600 text-sm py-6">Belum ada respons</p>
                ) : (
                  allResponses.map((resp) => {
                    const isOwn = resp.responderId === user?.id;
                    return (
                      <div key={resp.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {(resp.responder.employees?.fullName ?? resp.responder.nip)[0].toUpperCase()}
                        </div>
                        <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                          <div className={`text-xs text-gray-500 mb-1 ${isOwn ? "text-right" : ""}`}>
                            {resp.responder.employees?.fullName ?? resp.responder.nip}
                          </div>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm ${
                              isOwn
                                ? "bg-violet-600 text-white rounded-tr-sm"
                                : "bg-gray-800 text-gray-200 rounded-tl-sm"
                            }`}
                          >
                            {resp.message}
                          </div>
                          <div className={`text-xs text-gray-600 mt-1 ${isOwn ? "text-right" : ""}`}>
                            {fmtDateTime(resp.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={msgEndRef} />
              </div>

              {!isClosed && (
                <>
                  <div className="px-5 pt-4 border-t border-gray-800">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Saran Jawab
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLY_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleQuickReply(suggestion)}
                          disabled={isSending}
                          className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-200 transition hover:border-violet-500 hover:text-violet-300 disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSend} className="px-5 py-4 flex gap-3">
                    <input
                      type="text"
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                      placeholder="Tulis balasan..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !chatMsg.trim()}
                      className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 disabled:opacity-50 transition-colors"
                    >
                      Kirim
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Reporter Info */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Info Reporter</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                    {(ticket.reporter.employees?.fullName ?? ticket.reporter.nip)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">
                      {ticket.reporter.employees?.fullName ?? "—"}
                    </div>
                    <div className="text-xs text-gray-500">{ticket.reporter.nip}</div>
                  </div>
                </div>
                {ticket.reporter.employees?.email && (
                  <div className="text-xs text-gray-400">
                    <span className="text-gray-500">Email: </span>
                    {ticket.reporter.employees.email}
                  </div>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Response Time</div>
                  <div className="font-semibold text-white text-sm">
                    {responseTime !== null ? fmtDuration(responseTime) : "—"}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Resolution Time</div>
                  <div className="font-semibold text-white text-sm">
                    {resolutionTime !== null ? fmtDuration(resolutionTime) : "—"}
                  </div>
                </div>
              </div>
              {ticket.satisfactionRating && (
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Rating</div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-lg">{"★".repeat(ticket.satisfactionRating.score)}{"☆".repeat(5 - ticket.satisfactionRating.score)}</span>
                    <span className="text-sm text-white">{ticket.satisfactionRating.score}/5</span>
                  </div>
                </div>
              )}
            </div>

            {/* Update Status */}
            {!isClosed && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Update Status</h3>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as "IN_PROGRESS" | "CLOSED")}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 transition-all"
                >
                  {isUpdating ? "Memperbarui..." : "Simpan Status"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
