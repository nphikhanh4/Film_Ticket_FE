import { api } from './client';
import { AdminTicketResponseDto } from '@/types/api';

export interface AdminUserListItem {
  id: string;
  username: string;
  isAdmin: boolean;
  paidTicketCount: number;
  totalSpent: number;
  lastPurchaseAtUtc: string | null;
}

export interface AdminUserDetail {
  id: string;
  username: string;
  isAdmin: boolean;
  tickets: AdminTicketResponseDto[];
}

export interface AdminCreateUserRequest {
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface AdminChangeUserPasswordRequest {
  newPassword: string;
}

export const adminUsersApi = {
  getAll: (): Promise<AdminUserListItem[]> => api.get('/api/users'),

  getTickets: (id: string): Promise<AdminUserDetail> =>
    api.get(`/api/users/${id}/tickets`),

  create: (req: AdminCreateUserRequest): Promise<AdminUserListItem> =>
    api.post('/api/users', req),

  resetPassword: (id: string, req: AdminChangeUserPasswordRequest): Promise<void> =>
    api.post(`/api/users/${id}/reset-password`, req),

  delete: (id: string): Promise<void> => api.delete(`/api/users/${id}`),
};
