import { api } from './client';
import { ScreeningResponse, SoldSeatsResponse } from '@/types/api';

export const screeningsApi = {
  getAll: (): Promise<ScreeningResponse[]> => api.get('/api/screenings'),

  getById: (id: string): Promise<ScreeningResponse> =>
    api.get(`/api/screenings/${id}`),

  getByMovie: (movieId: string): Promise<ScreeningResponse[]> =>
    api.get(`/api/screenings/by-movie/${movieId}`),

  getSoldSeats: (screeningId: string): Promise<SoldSeatsResponse> =>
    api.get(`/api/screenings/${screeningId}/sold-seats`),
};
