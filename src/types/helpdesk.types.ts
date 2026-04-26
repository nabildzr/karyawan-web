// * Types untuk modul helpdesk/ticketing.

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TicketUser {
  id: string;
  nip: string;
  employees: {
    id: string;
    fullName: string;
    email: string | null;
  } | null;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  responderId: string;
  message: string;
  isAutoReply: boolean;
  createdAt: string;
  responder: TicketUser;
}

export interface SatisfactionRating {
  id: string;
  ticketId: string;
  score: number;
  feedback: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  reporterId: string;
  operatorId: string | null;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  firstResponseAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: TicketUser;
  operator: TicketUser | null;
  _count?: { responses: number };
}

export interface TicketDetail extends Ticket {
  responses: TicketResponse[];
  satisfactionRating: SatisfactionRating | null;
}

export interface TicketPaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Request Payloads ---

export interface CreateTicketInput {
  subject: string;
  description: string;
  priority?: TicketPriority;
}

export interface GetTicketsParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}

export interface FindSimilarTicketsParams {
  subject?: string;
  description?: string;
  limit?: number;
}

export interface SimilarTicketItem {
  ticket: Ticket;
  similarity: number;
}

export interface RespondTicketInput {
  message: string;
  isAutoReply?: boolean;
}

export interface UpdateTicketStatusInput {
  status: "IN_PROGRESS" | "CLOSED";
  operatorId?: string;
}

export interface RateTicketInput {
  score: number;
  feedback?: string;
}

// --- WebSocket Events ---

export type WsEvent =
  | { type: "connected"; ticketId: string }
  | { type: "new_response"; data: TicketResponse }
  | { type: "status_updated"; data: Pick<Ticket, "id" | "status" | "closedAt"> }
  | { type: "pong" };

// --- Dashboard Admin ---

export interface HelpdeskDashboardStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
}

export interface OperatorMetric {
  operatorId: string;
  operatorName: string;
  nip: string;
  totalHandled: number;
  avgResponseMinutes: number | null;
  avgResolutionMinutes: number | null;
  avgRating: number | null;
}

export interface RatingDistribution {
  score: number;   // 1-5
  count: number;
}

export interface HelpdeskDashboard {
  stats: HelpdeskDashboardStats;
  operatorMetrics: OperatorMetric[];
  ratingDistribution: RatingDistribution[];
  avgRatingOverall: number | null;
}
