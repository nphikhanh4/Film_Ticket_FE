import { api } from './client';
import { MovieResponse } from '@/types/api';

export const moviesApi = {
  getAll: (includeInactive?: boolean): Promise<MovieResponse[]> =>
    api.get(`/api/movies${includeInactive ? '?includeInactive=true' : ''}`),

  getById: (id: string): Promise<MovieResponse> =>
    api.get(`/api/movies/${id}`),
};
