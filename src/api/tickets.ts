import { api } from './client';
import {
  TicketCreateRequest,
  TicketResponse,
  MyTicketsResponse,
  CancelTicketResponse,
  TicketStatus,
} from '@/types/api';

interface TicketHistoryResponse {
  ticketId: string;
  screeningId: string;
  seatCount: number;
  seatNumbers: number[];
  amount: number;
  status: number;
  paymentReference?: string;
  createdAtUtc: string;
}

export const ticketsApi = {
  create: (req: TicketCreateRequest): Promise<TicketResponse> =>
    api.post('/api/tickets', req),

  getById: (id: string): Promise<TicketResponse> =>
    api.get(`/api/tickets/${id}`),

  getHistory: async (): Promise<MyTicketsResponse[]> => {
    const data = await api.get<TicketHistoryResponse[]>('/api/tickets/me/history');
    if (!data) return [];

    const statusMap: Record<number, TicketStatus> = {
      0: TicketStatus.Pending,
      1: TicketStatus.Paid,
      2: TicketStatus.Cancelled,
      3: TicketStatus.Refunded,
    };

    return data.map(ticket => ({
      id: ticket.ticketId,
      screeningId: ticket.screeningId,
      seatCount: ticket.seatCount,
      seatNumbers: ticket.seatNumbers,
      amount: ticket.amount,
      status: statusMap[ticket.status] || ticket.status,
      paymentReference: ticket.paymentReference,
      createdAtUtc: ticket.createdAtUtc,
    }));
  },

  cancel: (id: string): Promise<CancelTicketResponse> =>
    api.post(`/api/tickets/${id}/cancel`),
};
