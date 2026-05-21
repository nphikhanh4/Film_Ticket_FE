import { api } from './client';
import { MyTicketsResponse, TicketStatus } from '@/types/api';

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export const adminTicketsApi = {
  getAll: (): Promise<MyTicketsResponse[]> =>
    api.get('/api/tickets/all'),

  updateStatus: (id: string, req: UpdateTicketStatusRequest): Promise<MyTicketsResponse> => {
    // Convert enum string to numeric value
    const statusMap: Record<string, number> = {
      'Pending': 0,
      'Paid': 1,
      'Cancelled': 2,
      'Refunded': 3,
    };
    const statusNumber = statusMap[req.status] ?? 1;
    return api.put(`/api/tickets/${id}`, { status: statusNumber });
  },
};
