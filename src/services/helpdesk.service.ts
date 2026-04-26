// * Service helpdesk — REST API calls untuk fitur ticketing.

import { apiClient } from "../api/apiClient";
import type {
  CreateTicketInput,
  FindSimilarTicketsParams,
  GetTicketsParams,
  RateTicketInput,
  RespondTicketInput,
  SatisfactionRating,
  SimilarTicketItem,
  Ticket,
  TicketDetail,
  TicketPaginatedMeta,
  TicketResponse,
  UpdateTicketStatusInput,
} from "../types/helpdesk.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
  meta?: TicketPaginatedMeta | null;
}

export const helpdeskService = {
  // & GET /v1/tickets — daftar tiket (filter opsional)
  getTickets: async (
    params: GetTicketsParams = {},
  ): Promise<{ data: Ticket[]; meta: TicketPaginatedMeta }> => {
    const res = await apiClient.get<ApiResponse<Ticket[]>>("/tickets", {
      params,
    });
    return {
      data: res.data.data,
      meta: res.data.meta ?? {
        total: res.data.data.length,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        totalPages: 1,
      },
    };
  },

  // & POST /v1/tickets — buat tiket baru
  createTicket: async (payload: CreateTicketInput): Promise<Ticket> => {
    const res = await apiClient.post<ApiResponse<Ticket>>("/tickets", payload);
    return res.data.data;
  },

  // & GET /v1/tickets/:id — detail tiket
  getTicketDetail: async (id: string): Promise<TicketDetail> => {
    const res = await apiClient.get<ApiResponse<TicketDetail>>(`/tickets/${id}`);
    return res.data.data;
  },

  // & POST /v1/tickets/:id/respond — tambah response
  respondTicket: async (
    id: string,
    payload: RespondTicketInput,
  ): Promise<TicketResponse> => {
    const res = await apiClient.post<ApiResponse<TicketResponse>>(
      `/tickets/${id}/respond`,
      payload,
    );
    return res.data.data;
  },

  // & PATCH /v1/tickets/:id/status — ubah status
  updateTicketStatus: async (
    id: string,
    payload: UpdateTicketStatusInput,
  ): Promise<Ticket> => {
    const res = await apiClient.patch<ApiResponse<Ticket>>(
      `/tickets/${id}/status`,
      payload,
    );
    return res.data.data;
  },

  // & POST /v1/tickets/:id/rating — beri rating
  rateTicket: async (
    id: string,
    payload: RateTicketInput,
  ): Promise<SatisfactionRating> => {
    const res = await apiClient.post<ApiResponse<SatisfactionRating>>(
      `/tickets/${id}/rating`,
      payload,
    );
    return res.data.data;
  },

  // & GET /v1/tickets/suggestions — suggestion subject (mock-friendly)
  getSubjectSuggestions: async (query: string): Promise<string[]> => {
    if (!query || query.length < 3) return [];
    try {
      const res = await apiClient.get<ApiResponse<string[]>>(
        "/tickets/suggestions",
        { params: { q: query } },
      );
      return res.data.data ?? [];
    } catch {
      const fallback = [
        "Laptop tidak bisa login",
        "Printer tidak bisa print",
        "VPN tidak terkoneksi",
        "Email tidak masuk",
        "Akses sistem ditolak",
        "Aplikasi crash saat dibuka",
        "Koneksi internet lambat",
        "Reset password akun",
      ];
      return fallback.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase()),
      );
    }
  },

  getSimilarTickets: async (
    params: FindSimilarTicketsParams,
  ): Promise<SimilarTicketItem[]> => {
    const subject = params.subject?.trim() ?? "";
    const description = params.description?.trim() ?? "";
    if (!subject && !description) return [];

    const res = await apiClient.get<ApiResponse<SimilarTicketItem[]>>(
      "/tickets/similar",
      { params: { subject, description, limit: params.limit ?? 5 } },
    );
    return res.data.data ?? [];
  },

  // & GET /v1/tickets/dashboard — statistik dashboard admin
  // % Satu request semua tiket, compute client-side (efisien karena satu call).
  getDashboard: async (): Promise<import("../types/helpdesk.types").HelpdeskDashboard> => {
    const res = await apiClient.get<ApiResponse<Ticket[]>>("/tickets", {
      params: { limit: 1000 },
    });
    const tickets = res.data.data ?? [];

    // — Stats —
    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    };

    // — Operator metrics — group by operatorId
    const operatorMap = new Map<string, {
      name: string; nip: string;
      responseMins: number[]; resolutionMins: number[];
    }>();

    for (const t of tickets) {
      if (!t.operator) continue;
      const opId = t.operator.id;
      if (!operatorMap.has(opId)) {
        operatorMap.set(opId, {
          name: t.operator.employees?.fullName ?? t.operator.nip,
          nip: t.operator.nip,
          responseMins: [],
          resolutionMins: [],
        });
      }
      const entry = operatorMap.get(opId)!;
      if (t.firstResponseAt) {
        const mins = Math.round(
          (new Date(t.firstResponseAt).getTime() - new Date(t.createdAt).getTime()) / 60000,
        );
        entry.responseMins.push(mins);
      }
      if (t.closedAt) {
        const mins = Math.round(
          (new Date(t.closedAt).getTime() - new Date(t.createdAt).getTime()) / 60000,
        );
        entry.resolutionMins.push(mins);
      }
    }

    const avg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

    const operatorMetrics = Array.from(operatorMap.entries())
      .map(([operatorId, v]) => ({
        operatorId,
        operatorName: v.name,
        nip: v.nip,
        totalHandled: v.responseMins.length + v.resolutionMins.length,
        avgResponseMinutes: avg(v.responseMins),
        avgResolutionMinutes: avg(v.resolutionMins),
        avgRating: null, // Rating detail butuh endpoint terpisah
      }))
      .sort((a, b) => (a.avgResponseMinutes ?? 9999) - (b.avgResponseMinutes ?? 9999));

    // — Rating distribution (dummy karena butuh detail fetch) —
    // Backend hanya kembalikan _count, bukan rating per tiket di list.
    // Kita set placeholder; page bisa di-extend kalau backend punya endpoint rating.
    const closedTickets = tickets.filter((t) => t.status === "CLOSED");
    const detailResults = await Promise.allSettled(
      closedTickets.map((ticket) => helpdeskService.getTicketDetail(ticket.id)),
    );
    const ratedDetails = detailResults
      .filter(
        (result): result is PromiseFulfilledResult<TicketDetail> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value)
      .filter((detail) => detail.satisfactionRating != null);

    const ratingDistribution = [1, 2, 3, 4, 5].map((score) => ({
      score,
      count: ratedDetails.filter(
        (detail) => detail.satisfactionRating?.score === score,
      ).length,
    }));

    const ratedScores = ratedDetails
      .map((detail) => detail.satisfactionRating?.score ?? 0)
      .filter((score) => score >= 1 && score <= 5);
    const avgRatingOverall = ratedScores.length
      ? Number(
          (
            ratedScores.reduce((acc, score) => acc + score, 0) /
            ratedScores.length
          ).toFixed(2),
        )
      : null;

    return {
      stats,
      operatorMetrics,
      ratingDistribution,
      avgRatingOverall,
    };
  },
};
