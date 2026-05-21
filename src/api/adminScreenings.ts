import { api } from './client';
import { ScreeningResponse } from '@/types/api';

export interface CreateScreeningRequest {
  movieId: string;
  startAtUtc: string;
  totalSeats: number;
  venue?: string;
}

export interface UpdateScreeningRequest extends CreateScreeningRequest {}

export const adminScreeningsApi = {
  create: (req: CreateScreeningRequest): Promise<ScreeningResponse> =>
    api.post('/api/screenings', req),

  update: (id: string, req: UpdateScreeningRequest): Promise<ScreeningResponse> =>
    api.put(`/api/screenings/${id}`, req),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/screenings/${id}`),
};
