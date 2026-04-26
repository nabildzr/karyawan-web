import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import { useAuthContext } from "../../context/AuthContext";
import {
  useRateTicket,
  useRespondTicket,
  useTicketDetail,
} from "../../hooks/useHelpdesk";
import { useTicketChat } from "../../hooks/useTicketChat";
import type { TicketStatus } from "../../types/helpdesk.types";

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

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span
            className={
              (hover || value) >= star ? "text-amber-400" : "text-gray-300"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function UserTicketDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const { data: ticket, isLoading } = useTicketDetail(id);
  const { mutateAsync: rateTicket, isPending: isRating } = useRateTicket(id);
  const { mutateAsync: respondTicket, isPending: isSending } = useRespondTicket(id);

  const [chatMsg, setChatMsg] = useState("");
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const isReporter = ticket?.reporterId === user?.id;

  const { messages: wsMessages, isConnected, sendMessage } = useTicketChat({
    ticketId: id,
    enabled: !!id && isReporter,
  });

  const isClosed = ticket?.status === "CLOSED";
  const hasRated = !!ticket?.satisfactionRating;

  const allResponses = useMemo(
    () => [
      ...(ticket?.responses ?? []),
      ...wsMessages.filter(
        (message) => !(ticket?.responses ?? []).find((response) => response.id === message.id),
      ),
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [ticket?.responses, wsMessages],
  );

  const timelineItems = useMemo(
    () =>
      [
        { label: "Tiket Dibuat", at: ticket?.createdAt },
        { label: "Respon Pertama", at: ticket?.firstResponseAt ?? null },
        { label: "Tiket Ditutup", at: ticket?.closedAt ?? null },
      ].filter((item) => !!item.at),
    [ticket?.closedAt, ticket?.createdAt, ticket?.firstResponseAt],
  );

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allResponses.length]);

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatMsg.trim() || !isReporter) return;
    sendMessage(chatMsg.trim());

    try {
      await respondTicket({ message: chatMsg.trim() });
      setChatMsg("");
    } catch {
      // handled
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (ratingScore === 0) {
      toast.error("Pilih rating bintang terlebih dahulu");
      return;
    }

    try {
      await rateTicket({
        score: ratingScore,
        feedback: ratingFeedback || undefined,
      });
      toast.success("Rating berhasil dikirim");
    } catch {
      // handled
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-gray-400">
        Tiket tidak ditemukan
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-3">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <ComponentCard
            title={ticket.subject}
            desc={`Dibuat ${fmtDateTime(ticket.createdAt)} · Priority ${ticket.priority}`}
            action={
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusCfg.className}`}>
                {statusCfg.label}
              </span>
            }
          >
            <div
              className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />

            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Dibuat:</span>{" "}
                {fmtDateTime(ticket.createdAt)}
              </span>
              <span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>{" "}
                <span
                  className={
                    ticket.priority === "HIGH"
                      ? "text-rose-500"
                      : ticket.priority === "MEDIUM"
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }
                >
                  {ticket.priority}
                </span>
              </span>
              {ticket.operator && (
                <span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Operator:</span>{" "}
                  {ticket.operator.employees?.fullName ?? ticket.operator.nip}
                </span>
              )}
            </div>
          </ComponentCard>

          <ComponentCard title="Timeline Tiket" desc="Riwayat status tiket.">
            <div className="space-y-3">
              {timelineItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {fmtDateTime(String(item.at))}
                  </span>
                </div>
              ))}
            </div>
          </ComponentCard>

          {isReporter && (
            <ComponentCard
              title="Percakapan"
              desc="Balasan tiket dan chat real-time"
              action={
                <div className="flex items-center gap-2 text-xs">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-gray-400"}`} />
                  <span className="text-gray-500 dark:text-gray-400">{isConnected ? "Live" : "Offline"}</span>
                </div>
              }
            >
              <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
                {allResponses.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">Belum ada respons</p>
                ) : (
                  allResponses.map((response) => {
                    const isOwn = response.responderId === user?.id;
                    return (
                      <div key={response.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                          {(response.responder.employees?.fullName ?? response.responder.nip)[0].toUpperCase()}
                        </div>
                        <div className={`flex max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
                          <div className={`mb-1 text-xs text-gray-500 ${isOwn ? "text-right" : ""}`}>
                            {response.responder.employees?.fullName ?? response.responder.nip}
                          </div>
                          <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isOwn ? "rounded-tr-sm bg-brand-500 text-white" : "rounded-tl-sm bg-gray-100 text-gray-700 dark:bg-white/[0.04] dark:text-gray-200"}`}>
                            {response.message}
                          </div>
                          <div className={`mt-1 text-xs text-gray-400 ${isOwn ? "text-right" : ""}`}>
                            {fmtDateTime(response.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={msgEndRef} />
              </div>

              {!isClosed && (
                <form onSubmit={handleSendChat} className="mt-4 flex gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <input
                    type="text"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !chatMsg.trim()}
                    className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Kirim
                  </button>
                </form>
              )}
            </ComponentCard>
          )}

          {isClosed && isReporter && !hasRated && (
            <ComponentCard title="Beri Rating" desc="Nilai pengalaman kamu setelah tiket ditutup.">
              <form onSubmit={handleRate} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">Tingkat Kepuasan</label>
                  <StarRating value={ratingScore} onChange={setRatingScore} />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">Feedback (opsional)</label>
                  <textarea
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    placeholder="Ceritakan pengalaman kamu..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isRating || ratingScore === 0}
                  className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRating ? "Mengirim..." : "Kirim Rating"}
                </button>
              </form>
            </ComponentCard>
          )}

          {hasRated && isReporter && (
            <ComponentCard title="Rating Kamu" desc="Rating yang sudah kamu berikan untuk tiket ini.">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-xl ${s <= (ticket.satisfactionRating?.score ?? 0) ? "text-amber-400" : "text-gray-300"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {ticket.satisfactionRating?.score}/5
                </span>
              </div>
              {ticket.satisfactionRating?.feedback && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {ticket.satisfactionRating.feedback}
                </p>
              )}
            </ComponentCard>
          )}
        </div>

        <div className="space-y-6">
          <ComponentCard title="Info Tiket" desc="Ringkasan cepat tiket support.">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Status</p>
                <p className="mt-1 font-medium text-gray-800 dark:text-white/90">{statusCfg.label}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Priority</p>
                <p className="mt-1 font-medium text-gray-800 dark:text-white/90">{ticket.priority}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Operator</p>
                <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                  {ticket.operator ? (ticket.operator.employees?.fullName ?? ticket.operator.nip) : "Belum ditugaskan"}
                </p>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
