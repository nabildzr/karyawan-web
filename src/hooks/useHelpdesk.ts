// * Hook untuk fitur helpdesk — CRUD tiket, response, rating.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { helpdeskService } from "../services/helpdesk.service";
import type {
  CreateTicketInput,
  FindSimilarTicketsParams,
  GetTicketsParams,
  RateTicketInput,
  RespondTicketInput,
  UpdateTicketStatusInput,
} from "../types/helpdesk.types";

// & Query keys
export const HELPDESK_KEYS = {
  tickets: (params?: GetTicketsParams) => ["helpdesk", "tickets", params],
  detail: (id: string) => ["helpdesk", "ticket", id],
} as const;

// & Daftar tiket dengan filter opsional
export function useTickets(params: GetTicketsParams = {}) {
  return useQuery({
    queryKey: HELPDESK_KEYS.tickets(params),
    queryFn: () => helpdeskService.getTickets(params),
    staleTime: 30_000,
  });
}

// & Detail tiket by id
export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: HELPDESK_KEYS.detail(id),
    queryFn: () => helpdeskService.getTicketDetail(id),
    enabled: !!id,
    staleTime: 15_000,
  });
}

// & Buat tiket baru
export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketInput) =>
      helpdeskService.createTicket(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["helpdesk", "tickets"] });
    },
  });
}

// & Respond ke tiket
export function useRespondTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RespondTicketInput) =>
      helpdeskService.respondTicket(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HELPDESK_KEYS.detail(ticketId) });
    },
  });
}

// & Update status tiket
export function useUpdateTicketStatus(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTicketStatusInput) =>
      helpdeskService.updateTicketStatus(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["helpdesk", "tickets"] });
      qc.invalidateQueries({ queryKey: HELPDESK_KEYS.detail(ticketId) });
    },
  });
}

// & Rating tiket (hanya USER & CLOSED)
export function useRateTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RateTicketInput) =>
      helpdeskService.rateTicket(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HELPDESK_KEYS.detail(ticketId) });
    },
  });
}

// & Subject suggestions
export function useSubjectSuggestions(query: string) {
  return useQuery({
    queryKey: ["helpdesk", "suggestions", query],
    queryFn: () => helpdeskService.getSubjectSuggestions(query),
    enabled: query.length >= 10,
    staleTime: 60_000,
  });
}

export function useSimilarTickets(params: FindSimilarTicketsParams) {
  const subject = params.subject?.trim() ?? "";
  const description = params.description?.trim() ?? "";
  const enabled = (subject + description).trim().length >= 5;

  return useQuery({
    queryKey: ["helpdesk", "similar", subject, description, params.limit ?? 5],
    queryFn: () => helpdeskService.getSimilarTickets(params),
    enabled,
    staleTime: 20_000,
  });
}
